# Chiroro · 个人博客

基于 [Hexo](https://hexo.io) + [Fluid](https://github.com/fluid-dev/hexo-theme-fluid) 主题的个人博客，通过 **GitHub Actions** 自动构建并发布到 **GitHub Pages**。

- 站点地址：<https://chitciao.github.io>
- 源码仓库：<https://github.com/chitciao/chitciao.github.io>

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

正文用 Markdown 写，`<!-- more -->` 之前的内容会作为首页摘要。

## 发布（自动）

只要把源码推送到 `main` 分支，GitHub Actions 就会自动构建并部署：

```bash
git add .
git commit -m "post: 新文章标题"
git push
```

几十秒后访问 <https://chitciao.github.io> 即可看到更新。部署进度可以在仓库的 **Actions** 标签页查看。

## 目录结构

```
├── .github/workflows/pages.yml   # GitHub Actions 自动部署
├── _config.yml                   # 站点主配置（标题、网址、主题等）
├── _config.fluid.yml             # Fluid 主题配置（导航、首页、关于页、页脚等）
├── scaffolds/                    # 新建文章/页面的模板
├── source/
│   ├── _posts/                   # 文章（Markdown）
│   ├── about/                    # 关于页
│   └── img/                      # 图片资源（头像、图标）
└── themes/                       # 主题目录（当前用 npm 安装的 Fluid）
```

## 常用自定义位置

| 想改什么 | 改哪里 |
| --- | --- |
| 站点标题 / 副标题 / 作者 | `_config.yml` 开头的 `title`、`subtitle`、`author` |
| 导航栏菜单 | `_config.fluid.yml` → `navbar.menu` |
| 首页标语 | `_config.fluid.yml` → `index.slogan.text` |
| 头像 | 替换 `source/img/avatar.png` |
| 关于页内容 | `source/about/index.md` |
| 页脚版权 | `_config.fluid.yml` → `footer.content` |

## 注意

- 仓库必须命名为 `<用户名>.github.io`（本仓库为 `chitciao.github.io`）才能使用根域名访问。
- GitHub Pages 的发布来源需设置为 **GitHub Actions**（Settings → Pages → Build and deployment → Source）。
- `public/` 和 `node_modules/` 已被 `.gitignore` 忽略，不需要提交。
