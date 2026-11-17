# Chiroro · 个人博客

基于 [Hexo](https://hexo.io) + [Fluid](https://github.com/fluid-dev/hexo-theme-fluid) 主题的个人博客。

首页是一张独立的二次元风格 Landing 页（全屏随机背景 + 毛玻璃控件），文章列表在 `/blog/`，其余页面沿用 Fluid 主题。
通过 **GitHub Actions** 自动构建并发布到 **GitHub Pages**。

- 站点地址：<https://chistxiao.github.io>
- 源码仓库：<https://github.com/chistxiao/chistxiao.github.io>
- 文章列表：<https://chistxiao.github.io/blog/>

## 本地开发

需要 Node.js 20+。首次使用先安装依赖：

```bash
pnpm install     # 或 npm install
```

常用命令：

```bash
pnpm run server  # 本地预览 http://localhost:4000，改动能热更新
pnpm run build   # 生成静态站点到 public/
pnpm run clean   # 清除缓存和 public/
```

## 首页（Landing）

| 想改什么 | 改哪里 |
| --- | --- |
| 背景图来源池 | `source/home/landing.js` → `CONFIG.sources`（默认含南风 API 的 `auto`/`pc`/`pe` 与两个随机图接口） |
| 是否自动轮播 | `CONFIG.autoRotate`（`0` = 只在刷新页面时换一张，默认） |
| 「换一张」按钮 | `CONFIG.showShuffle`（`false` 可隐藏） |
| 全部来源失败时的兜底图 | `source/home/bg/bg1.webp ~ bg8.webp`，或 `CONFIG.backgrounds` |
| 一言内容 | `CONFIG.quotes`（`t` 正文，`f` 出处） |
| 一言切换间隔 | `CONFIG.quoteInterval` |
| 天气城市（留空=按 IP 自动定位） | `CONFIG.city` |
| 名字 / 头像 / 标语 / 快捷入口 | `source/index.html` |
| 配色、毛玻璃、圆角、字体大小 | `source/home/landing.css` |

实现要点：

- **每次刷新随机取一张背景**：从 `CONFIG.sources` 里随机挑一个来源，用 `sessionStorage` 记录最近 4 次用过的来源，刷新时优先选没用过的，避免连续重复。图片**先在内存里预加载成功再淡入**，不会闪白；某个来源超时（10s）或失败会自动换下一个，全部失败才用本地 `bgN.webp`。
- 默认关闭自动轮播（`autoRotate: 0`）；想恢复定时换图把它改成毫秒数（如 `30000`）即可，右下角「换一张」按钮随时可手动换。
- 天气：先按 IP 依次尝试 `ipwho.is` → `api.ipapi.is` → `ipinfo.io` 定位，再用 `wttr.in` 取当前天气；结果在 `sessionStorage` 缓存 30 分钟，失败就留空不影响页面。
- 毛玻璃：`backdrop-filter: blur(26px) saturate(135%)`。注意**不要**给玻璃元素的父级加 `animation ... both`、`transform`、`opacity < 1` 之类的属性，否则会形成新的 backdrop root，模糊会直接失效（本项目踩过这个坑，入场动画已改成无 `fill-mode`）。
- 时钟、日期、一言都是纯前端，不需要任何后端；支持 `prefers-reduced-motion` 和键盘焦点样式。

## 写一篇新文章

```bash
hexo new "文章标题"
```

会在 `source/_posts/文章标题.md` 生成模板，开头是 Front Matter：

```yaml
---
title: 文章标题
date: 2026-11-17 21:00:00
tags:
  - 标签
categories:
  - 分类
---
```

正文用 Markdown 写，`<!-- more -->` 之前的内容会作为摘要。

## 发布（自动）

把源码推送到 `main` 分支，GitHub Actions 会自动构建并部署：

```bash
git add .
git commit -m "post: 新文章标题"
git push
```

几十秒后访问 <https://chistxiao.github.io> 即可看到更新。部署进度可以在仓库的 **Actions** 标签页查看。

## 目录结构

```
├── .github/workflows/pages.yml   # GitHub Actions 自动部署
├── _config.yml                   # 站点主配置（标题、网址、主题、文章列表位置）
├── _config.fluid.yml             # Fluid 主题配置（导航、页脚、关于页等）
├── scaffolds/                    # 新建文章/页面的模板
├── source/
│   ├── index.html                # 首页 Landing（skip_render，不经过主题）
│   ├── home/                     # Landing 的样式/脚本/背景/字体
│   │   ├── landing.css
│   │   ├── landing.js            # CONFIG：背景接口、一言、天气
│   │   ├── avatar.png
│   │   ├── bg/bg1-8.webp         # 兜底背景
│   │   └── fonts/                # 手写体字体（本地托管）
│   ├── _posts/                   # 文章（Markdown）
│   ├── about/                    # 关于页
│   └── img/                      # 其它图片资源
└── themes/                       # 主题目录（Fluid 通过 npm 安装）
```

> 首页是 `source/index.html`，所以 `.gitignore` 里的 `public/` 不需要提交；文章列表由 `_config.yml` 的 `index_generator.path: 'blog'` 指到了 `/blog/`。

## 其它自定义位置

| 想改什么 | 改哪里 |
| --- | --- |
| 站点标题 / 副标题 / 作者 | `_config.yml` 开头的 `title`、`subtitle`、`author` |
| 导航栏菜单 | `_config.fluid.yml` → `navbar.menu` |
| 文章页页脚版权 | `_config.fluid.yml` → `footer.content` |
| 关于页内容 | `source/about/index.md` |
| 头像 | 替换 `source/home/avatar.png`（主题页面也引用这个路径） |

## 注意

- 仓库必须命名为 `<用户名>.github.io`（本仓库为 `chistxiao.github.io`）才能使用根域名访问。
- GitHub Pages 的发布来源需设置为 **GitHub Actions**（Settings → Pages → Build and deployment → Source）。
- `public/` 和 `node_modules/` 已被 `.gitignore` 忽略，不需要提交。
- 首页背景接口 `api.sretna.cn` 是第三方公开接口，若某天不可用，页面会自动回退到本地背景图，不影响访问。
