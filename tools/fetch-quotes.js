// 构建前抓取一批一言，写成 source/home/quotes.json
// 接口没有 CORS 头，所以不在浏览器直接请求，改为构建时抓取 + 静态化
const fs = require("fs");
const path = require("path");

const API = "https://www.moey.cn/yan/?type=json&form=all";
const COUNT = 40;
const OUT = path.join(__dirname, "..", "source", "home", "quotes.json");

function attribution(item) {
  const who = item.from_who && item.from_who !== "null" ? item.from_who : "";
  const from = item.from && item.from !== "null" ? item.from : "";
  if (who && from) return `— ${who}「${from}」`;
  if (who) return `— ${who}`;
  if (from) return `— ${from}`;
  return "";
}

(async () => {
  const seen = new Set();
  const list = [];

  for (let i = 0; i < COUNT * 3 && list.length < COUNT; i++) {
    try {
      const res = await fetch(API, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; chistxiao-homepage)" },
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) continue;
      const data = JSON.parse(await res.text());
      const text = (data.text || "").trim();
      if (!text || text.length > 120 || seen.has(text)) continue;
      seen.add(text);
      list.push({ t: text, f: attribution(data) });
    } catch (e) {
      // 单次失败忽略
    }
  }

  if (!list.length) {
    console.log("[quotes] 接口不可用，保留已有 quotes.json");
    return;
  }

  fs.writeFileSync(OUT, JSON.stringify(list, null, 2) + "\n", "utf-8");
  console.log(`[quotes] 写入 ${list.length} 条 -> ${OUT}`);
})();
