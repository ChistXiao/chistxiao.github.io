# ChistXiao · 个人主页

一个纯静态的个人展示页：全屏随机二次元背景（随鼠标轻微视差）+ 毛玻璃控件，用 Hexo 生成、GitHub Actions 自动发布到 GitHub Pages。

- 站点：<https://chistxiao.github.io>
- 仓库：<https://github.com/chistxiao/chistxiao.github.io>

没有文章、归档、标签、评论等多余页面 —— 整个站点只有 `public/index.html` 和 `/home/` 下的静态资源。

## 页面构成

- **左**：圆形头像（点击在右侧覆盖展示一段简介，再点一次还原）、手写体名字、三个圆形入口（GitHub / QQ / 邮箱）
- **右**：随机一言、日期时间 + 天气
- **背景**：每次刷新从来源池随机取一张，预加载成功后才淡入；鼠标移动时整层背景轻微位移

## 本地开发

需要 Node.js 20+：

```bash
pnpm install     # 或 npm install
pnpm run server  # 预览 http://localhost:4000
pnpm run build   # 生成到 public/
```

## 想改什么

| 内容 | 位置 |
| --- | --- |
| 头像 | 替换 `source/home/avatar.png`（会同时作为 favicon） |
| 头像点击后的简介文字 | `source/index.html` 里 `.note` 区块 |
| 名字 / 社交链接 | `source/index.html`（`.brand`、`.socials`） |
| 背景来源池 | `source/home/landing.js` → `CONFIG.sources`（默认 `https://www.moey.cn/pic/?type=img&form=auto`） |
| 兜底背景（接口全挂时） | `source/home/bg/bg1-8.webp` |
| 鼠标视差幅度 | `CONFIG.parallax`（默认 14px） |
| 一言来源 / 间隔 | `scripts/fetch-quotes.js`（构建时抓取）、`CONFIG.quoteInterval` |
| 天气城市（留空=按 IP 定位） | `CONFIG.city` |
| 毛玻璃：透明度 / 模糊半径 | `source/home/landing.css` 的 `--glass-top`、`--glass-bottom`、`--blur` |

## 一言与背景接口

- **背景**：`https://www.moey.cn/pic/?type=img&form=auto`，每次请求 302 到一张随机图，直接用 `<img>`/CSS 背景加载（不需要 CORS）。
- **一言**：`https://www.moey.cn/yan/?type=json&form=all`。这个接口**没有 CORS 头**，浏览器直连会被拦，所以改为**构建时抓取**：`pnpm run build` 会先跑 `scripts/fetch-quotes.js` 抓 40 条写入 `source/home/quotes.json`，页面再从本地 JSON 随机取。每次部署都会刷新这批句子；接口挂掉时保留上一次的文件。
- 点击一言卡片（或聚焦后按回车/空格）随机换下一句。

## 字体

标题的 `ChistXiao` 用 Comic Sans 风格字体：`font-family: "Comic Sans MS", "Comic Relief", "Comic Sans", cursive`。

Comic Sans MS 是微软商业字体、不能打包分发，所以自托管了开源的 **Comic Relief**（SIL OFL，按 Comic Sans 字宽复刻，约 18KB）作为兜底：Windows / macOS 用系统自带的 Comic Sans MS，Android / Linux 等设备用自托管的 Comic Relief，两边观感基本一致。

字体文件在 `source/home/fonts/comic-relief-400.woff2`，想强制全平台统一就把 `landing.css` 里 `.brand` 的字体栈把 `"Comic Relief"` 挪到第一位。

## 结构

```
├── .github/workflows/pages.yml   # GitHub Actions 构建 + 发布
├── _config.yml                   # Hexo 极简配置
├── package.json                  # 只依赖 hexo + hexo-server
└── source/
    ├── index.html                # 首页（skip_render，直接输出）
    └── home/
        ├── landing.css
        ├── landing.js            # 背景轮换 / 视差 / 时钟 / 一言 / 天气
        ├── avatar.png
        ├── bg/                   # 兜底背景
        └── fonts/                # 手写体字体（本地托管）
```

## 注意

- 没有主题：`_config.yml` 里不配 `theme`，Hexo 只负责把 `source/` 原样输出。
- `package.json` 里的 `"hexo": { "version": "" }` 是 Hexo CLI 识别站点目录的标记，**不要删**，删了 `hexo generate` 会只打印帮助。
- 毛玻璃元素不要放在带 `transform` / `opacity<1` / `animation ... both` 的父级里，否则会形成 backdrop root 导致模糊失效。
- GitHub Pages 发布来源需为 **GitHub Actions**（Settings → Pages）。
