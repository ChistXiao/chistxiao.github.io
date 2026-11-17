/* ========================================================
   Chiroro · Landing 首页脚本
   背景轮换 / 实时时钟 / 随机一言 / 天气
   想改内容，基本只需要动下面的 CONFIG
   ======================================================== */

(function () {
  "use strict";

  var CONFIG = {
    // 背景图来源池：每次刷新随机取一个（尽量不与最近用过的重复）
    // 南风 API 的 auto / pc / pe 是三个不同端点，其余为每次请求都随机的接口
    sources: [
      "https://api.sretna.cn/api/anime/auto",
      "https://api.sretna.cn/api/anime/pc",
      "https://api.sretna.cn/api/anime/pe",
      "https://www.loliapi.com/acg/",
      "https://t.alcy.cc/ycy"
    ],
    // 自动轮播间隔（毫秒）；0 表示只在刷新页面时换
    autoRotate: 0,
    // 是否显示右下角「换一张」按钮
    showShuffle: true,
    // 所有来源都失败时的本地兜底背景
    backgrounds: [
      "/home/bg/bg1.webp",
      "/home/bg/bg2.webp",
      "/home/bg/bg3.webp",
      "/home/bg/bg4.webp",
      "/home/bg/bg5.webp",
      "/home/bg/bg6.webp",
      "/home/bg/bg7.webp",
      "/home/bg/bg8.webp"
    ],
    // 手动指定城市（留空则按 IP 自动定位）
    city: "",
    // 一言切换间隔（毫秒）
    quoteInterval: 22000,
    quotes: [
      { t: "智慧需要沉淀，积累才能够饱满。", f: "— 「铠甲勇士」" },
      { t: "热爱可抵岁月漫长。", f: "— Chiroro" },
      { t: "慢一点没关系，方向对就好。", f: "" },
      { t: "把每一件小事做好，日子就有了质感。", f: "" },
      { t: "心之所向，素履以往。", f: "— 木心" },
      { t: "既然选择了远方，便只顾风雨兼程。", f: "— 汪国真" },
      { t: "不慌不忙，来日方长。", f: "" },
      { t: "愿你在自己热爱的世界里，闪闪发光。", f: "" },
      { t: "所有的努力都不会白费，只是形式不同。", f: "" },
      { t: "生活明朗，万物可爱。", f: "" },
      { t: "认真生活的人，运气都不会太差。", f: "" },
      { t: "每一次记录，都是和时间的一场对话。", f: "" }
    ]
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };

  /* ------------------------- 背景轮换 ------------------------- */

  (function initBackground() {
    var layers = [document.getElementById("bgA"), document.getElementById("bgB")];
    if (!layers[0] || !layers[1]) return;

    var front = 0;
    var RECENT_KEY = "chiroro-bg-recent";
    var timer = null;

    function paint(el, url) {
      el.style.backgroundImage = "url('" + url + "')";
      el.classList.add("is-active");
      el.classList.add("animate");
    }

    function swap(url) {
      if (!url) return;
      var back = 1 - front;
      paint(layers[back], url);
      layers[front].classList.remove("is-active");
      front = back;
    }

    function shuffle(arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }

    function readRecent() {
      try { return JSON.parse(sessionStorage.getItem(RECENT_KEY) || "[]"); } catch (e) { return []; }
    }

    function remember(source) {
      try {
        var list = readRecent().filter(function (s) { return s !== source; });
        list.unshift(source);
        sessionStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 4)));
      } catch (e) { /* 隐私模式忽略 */ }
    }

    // 先把最近用过的来源排到最后，保证刷新后换一张
    function pickOrder() {
      var recent = readRecent();
      var fresh = CONFIG.sources.filter(function (s) { return recent.indexOf(s) === -1; });
      var stale = CONFIG.sources.filter(function (s) { return recent.indexOf(s) !== -1; });
      var order = shuffle(fresh).concat(shuffle(stale));
      return order.length ? order : shuffle(CONFIG.sources);
    }

    // 预加载一张图：成功回调 url，失败/超时回调空
    function preload(source, done) {
      var url = source + (source.indexOf("?") > -1 ? "&" : "?") + "t=" + Date.now().toString(36);
      var img = new Image();
      var settled = false;

      var timerId = setTimeout(function () {
        if (settled) return;
        settled = true;
        done("");
      }, 10000);

      img.onload = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timerId);
        done(url);
      };

      img.onerror = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timerId);
        done("");
      };

      img.src = url;
    }

    function nextLocal() {
      return CONFIG.backgrounds[Math.floor(Math.random() * CONFIG.backgrounds.length)] || "";
    }

    // 按随机顺序依次尝试来源，直到有一张加载成功
    function loadOne() {
      var order = pickOrder();
      var i = 0;

      function attempt() {
        if (i >= order.length) {
          swap(nextLocal());
          return;
        }
        var source = order[i++];
        preload(source, function (url) {
          if (url) {
            remember(source);
            swap(url);
          } else {
            attempt();
          }
        });
      }

      attempt();
    }

    // 首屏保持深色底，等随机图的加载完成后再淡入，避免先闪一张兜底图
    setTimeout(loadOne, 150);
    if (CONFIG.autoRotate > 0) {
      timer = setInterval(loadOne, CONFIG.autoRotate);
    }

    var btn = document.getElementById("shuffle");
    if (btn) {
      if (!CONFIG.showShuffle) {
        btn.hidden = true;
      } else {
        btn.addEventListener("click", function () {
          loadOne();
        });
      }
    }
  })();

  /* ------------------------- 时钟 ------------------------- */

  (function initClock() {
    var elDate = document.getElementById("date");
    var elClock = document.getElementById("clock");
    if (!elClock) return;

    var week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

    function tick() {
      var d = new Date();
      elClock.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
      if (elDate) {
        elDate.textContent = d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日 · " + week[d.getDay()];
      }
    }

    tick();
    setInterval(tick, 1000);
  })();

  /* ------------------------- 一言 ------------------------- */

  (function initQuote() {
    var box = document.querySelector(".quote");
    var elText = document.getElementById("quoteText");
    var elFrom = document.getElementById("quoteFrom");
    if (!box || !elText || !CONFIG.quotes.length) return;

    var last = Math.floor(Math.random() * CONFIG.quotes.length);

    function render(index) {
      var item = CONFIG.quotes[index];
      elText.textContent = item.t;
      if (elFrom) elFrom.textContent = item.f || "";
    }

    // 首屏直接渲染，避免淡入过程中空白
    render(last);

    function show(index) {
      box.classList.add("is-switching");
      setTimeout(function () {
        render(index);
        box.classList.remove("is-switching");
      }, reduceMotion ? 0 : 260);
    }

    setInterval(function () {
      last = (last + 1 + Math.floor(Math.random() * (CONFIG.quotes.length - 1))) % CONFIG.quotes.length;
      show(last);
    }, CONFIG.quoteInterval);
  })();

  /* ------------------------- 天气 ------------------------- */

  (function initWeather() {
    var el = document.getElementById("weather");
    if (!el) return;

    // 常见城市拼音 → 中文，命中就显示中文，未命中显示原文
    var CITY_ZH = {
      Beijing: "北京", Shanghai: "上海", Guangzhou: "广州", Shenzhen: "深圳", Tianjin: "天津",
      Chongqing: "重庆", Chengdu: "成都", Hangzhou: "杭州", Nanjing: "南京", Wuhan: "武汉",
      Xian: "西安", Suzhou: "苏州", Zhengzhou: "郑州", Changsha: "长沙",
      Qingdao: "青岛", Dalian: "大连", Xiamen: "厦门", Fuzhou: "福州", Jinan: "济南",
      Hefei: "合肥", Nanchang: "南昌", Shenyang: "沈阳", Harbin: "哈尔滨", Changchun: "长春",
      Shijiazhuang: "石家庄", Taiyuan: "太原", Nanning: "南宁", Kunming: "昆明", Guiyang: "贵阳",
      Lanzhou: "兰州", Xining: "西宁", Yinchuan: "银川", Urumqi: "乌鲁木齐", Hohhot: "呼和浩特",
      Haikou: "海口", Wuxi: "无锡", Ningbo: "宁波", Wenzhou: "温州", Dongguan: "东莞",
      Foshan: "佛山", Zhuhai: "珠海", Zhongshan: "中山", Huizhou: "惠州", Luoyang: "洛阳"
    };

    var cache = null;

    function getJSON(url, timeout) {
      return new Promise(function (resolve, reject) {
        var ctrl = window.AbortController ? new AbortController() : null;
        var t = setTimeout(function () { if (ctrl) ctrl.abort(); reject(new Error("timeout")); }, timeout || 9000);
        fetch(url, ctrl ? { signal: ctrl.signal } : {})
          .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error("http " + r.status)); })
          .then(function (d) { clearTimeout(t); resolve(d); })
          .catch(function (e) { clearTimeout(t); reject(e); });
      });
    }

    function render(city, desc, temp) {
      var parts = [];
      if (city) parts.push(city);
      if (desc) parts.push(desc);
      parts.push(temp + "°C");
      el.textContent = parts.join(" · ");
    }

    var CACHE_KEY = "chiroro-weather";
    var CACHE_TTL = 30 * 60 * 1000;

    function readCache() {
      try {
        var raw = sessionStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        var obj = JSON.parse(raw);
        if (!obj || !obj.temp || Date.now() - obj.at > CACHE_TTL) return null;
        return obj;
      } catch (e) { return null; }
    }

    function saveCache(obj) {
      try {
        obj.at = Date.now();
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(obj));
      } catch (e) { /* 隐私模式下忽略 */ }
    }

    // 依次尝试多个定位服务，任意一个成功即可，避免单一服务被限流
    var LOCATORS = [
      function () {
        return getJSON("https://ipwho.is/", 6000).then(function (d) {
          if (!d || d.success === false || d.latitude == null) throw new Error("ipwho");
          return { city: d.city, lat: d.latitude, lon: d.longitude };
        });
      },
      function () {
        return getJSON("https://api.ipapi.is/", 6000).then(function (d) {
          if (!d || d.lat == null) throw new Error("ipapi");
          return { city: d.city, lat: d.lat, lon: d.lon };
        });
      },
      function () {
        return getJSON("https://ipinfo.io/json", 6000).then(function (d) {
          if (!d || !d.loc) throw new Error("ipinfo");
          var parts = d.loc.split(",");
          return { city: d.city, lat: parts[0], lon: parts[1] };
        });
      }
    ];

    function locate() {
      var i = 0;
      function attempt() {
        if (i >= LOCATORS.length) return Promise.reject(new Error("no geo"));
        return LOCATORS[i++]().catch(attempt);
      }
      return attempt();
    }

    function describe(cur) {
      return (cur["lang_zh-cn"] && cur["lang_zh-cn"][0] && cur["lang_zh-cn"][0].value) ||
        (cur.weatherDesc && cur.weatherDesc[0] && cur.weatherDesc[0].value) || "";
    }

    function load() {
      var cached = readCache();
      if (cached) {
        render(cached.city, cached.desc, cached.temp);
        return;
      }

      var geo = CONFIG.city ? Promise.resolve({ city: CONFIG.city }) : locate();

      geo
        .then(function (g) {
          var where = g.lat != null ? g.lat + "," + g.lon : encodeURIComponent(g.city);
          return getJSON("https://wttr.in/" + where + "?format=j1&lang=zh-cn", 12000).then(function (w) {
            return { g: g, w: w };
          });
        })
        .then(function (res) {
          var cur = res.w.current_condition && res.w.current_condition[0];
          if (!cur) throw new Error("no condition");
          var data = {
            city: res.g.city ? (CITY_ZH[res.g.city] || res.g.city) : "",
            desc: describe(cur),
            temp: cur.temp_C
          };
          saveCache(data);
          render(data.city, data.desc, data.temp);
        })
        .catch(function () {
          // 定位或天气失败就留空，不打扰页面
        });
    }

    load();
    setInterval(load, 30 * 60 * 1000);
  })();
})();
