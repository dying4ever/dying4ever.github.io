---
title: 建站日志
date: 2026-05-10 19:35:08
sticky: 1
categories:
    - uncategorized
tags:
    - Hexo
    - Shokax
    - Obsidian
desc: 我的小破站
disableNunjucks: true
---

---

# 2026-07-16

## version4

完成独立 Markdown 站点迁移：将原有 131 篇文章及相对资源一次性复制到新项目，保留原日期地址、分类、标签和 Markdown 抬头。
新增 Notes、Film、Life、Projects、分类、归档、About、友链、建站日志与文章静态页面，生产构建不再调用 Hexo。
第二场景以后启用连续山水背景，序章改为与 About Me 呼应的左右排版，并降低重影、提高文字不透明度。
执行命令：`npm test`、`npm run build`、`python tests/smoke.py`。
修改位置：`content/`、`src/content/`、`src/templates/`、`src/styles/`、`scripts/build-site.mjs`。

## version3

完成沉浸式首页与 Hexo 内容站的统一构建：根路径使用新的电影式首页，About、分类、归档、项目、友链和文章继续由 Hexo 生成并保持同域访问。
新增统一生产构建脚本，先生成全部 Markdown 页面，再覆盖沉浸式根首页；保留 `CNAME`、文章资源和现有 URL。
执行命令：`npm run build:unified`、`python tests/smoke.py`。
结果：统一构建通过；根首页、五个内容页面、131 篇归档入口及桌面/移动端浏览检查通过。
修改位置：`immersive/scripts/build-unified.mjs`、`immersive/vite.config.js`、`immersive/index.html`、`blog/public`。

## version2

优化沉浸式首页的封面、主页、序章与 About 转场：保留“终南山下，活死人墓”的原字体，正文与小字号改为仿宋阅读字体；提高序章文字对比度，并用深色—暖纸色—深色渐变消除全黑、全白硬切。
补充山水推远、云雾、飞鸟、线条消散与视差动画；桌面端保留完整滚动叙事，移动端减少高成本动画并处理横向溢出。
修改位置：`immersive/src/styles`、`immersive/src/scroll-story.js`、`immersive/src/motion.js`。

## version1

完善 Markdown 内容页面：重整 About 章节，新增友链页面，补充分类和项目说明；分类页从 Markdown 页面回取引言，归档页恢复全部文章列表并修复无效标题嵌套。
统一内容页正文使用仿宋阅读字体，大字号标题继续使用权衡度量体；分类、归档、About、项目和友链均完成 PC 与移动端访问检查。
修改位置：`source/about/index.md`、`source/categories/index.md`、`source/projects/index.md`、`source/friends/index.md`、`themes/shokax/layout`、`source/_data/custom.styl`。

# 2026-06-14

## version3

修复 Obsidian 同步后 Hexo 构建误解析问题：将同步脚本从 `scripts/` 移到 `tools/`，避免 Hexo 把 PowerShell 文件当作主题脚本加载。
统一补齐 Obsidian Markdown 的 Hexo front-matter，避免正文分隔线 `---` 被误判为 YAML 头部。
执行命令：python tools/normalize-obsidian-frontmatter.py、npm run sync:obsidian、npm run build。
结果：Build passed。
修改位置：tools/sync-obsidian-posts.ps1、package.json、D:\Obsidian 笔记目录\know、source/_posts。

## version2

新增 Obsidian 到 Hexo `_posts` 的镜像同步脚本，采用真实目录同步方案，不使用 junction，保证 Hexo 与 GitHub Pages 部署都能读取真实 Markdown 和图片资源。
执行 `npm run sync:obsidian` 将 `D:\Obsidian 笔记目录\know` 同步到 `source/_posts`，并补充 `watch:obsidian` 命令用于后续监听 Obsidian 修改。
执行命令：npm run sync:obsidian、npm run build。
结果：Build passed。
修改位置：package.json、scripts/sync-obsidian-posts.ps1、source/_posts。

## version1

将项目根目录“图库”中的 19 张图片转换为 WebP，并输出到 `source/images/gallery/` 作为首页封面图库。
新增首页随机封面脚本，每次打开页面为置顶文章和精选分类随机分配图库图片；同一轮分配不重复，图库用完后才重新洗牌复用。
执行命令：npm run build、npm run dev。
结果：Build passed。
修改位置：source/images/gallery、source/js/gallery-random-covers.js、themes/shokax/layout/_partials/layout.pug。

# 2026-06-09

## version1

优化字体与首屏加载：将权衡度量体改为按本站实际标题和 About 用字生成的 woff2 子集，删除未引用的完整 ttf/woff2 字体文件。
继续保留 Story Script 与权衡度量体的视觉效果，但移动端正文使用稳定中文 fallback，避免大字体阻塞首屏。
确认首页、分类页、About 不再引用远程随机图、阿里 iconfont、JetBrains CDN、Google Fonts 和已关闭播放器预加载。
执行命令：npm run clean、npm run build。
结果：Build passed。
修改位置：source/fonts、source/_data/custom.styl、themes/shokax/source/css/_common/scaffolding/base.styl。

# 2026-05-23

## version20

回退上一版字体子集预加载方案，移除 `QuanHengDuLiang-site.woff2`，恢复权衡度量体完整 woff2 与 `font-display: swap`。
保留此前移动端字体链和分类卡片头图修复，避免影响其他页面样式。
修改位置：`themes/shokax/layout/_partials/head/head.pug`、`themes/shokax/source/css/_common/scaffolding/base.styl`、`source/_data/custom.styl`、`source/fonts/`。

## version19

修复自定义字体首次加载时先显示默认字体的问题：为权衡度量体生成当前站点用字子集 `QuanHengDuLiang-site.woff2`，并在页面头部预加载。
将权衡度量体的 `font-display` 从 `swap` 调整为 `block`，减少 PC 和移动端字体加载完成后的明显跳变。
执行 `npm run clean`、`npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`source/fonts/QuanHengDuLiang-site.woff2`、`themes/shokax/layout/_partials/head/head.pug`、`themes/shokax/source/css/_common/scaffolding/base.styl`、`source/_data/custom.styl`。

## version18

修复分类页卡片头图不显示的问题：为分类卡片补充默认 CSS 变量，避免 `background-image` 因缺省变量整条失效。
分类头图改为复用主题随机图片批量逻辑，每个一级分类生成不同图片；同时将自定义字体转换为 woff2 并优先加载，移除 Google Fonts 外链以减少移动端加载压力。
移动端补充 `StoryScriptLatin` 与 `QuanHengDuLiang` 字体链，确保手机端标题、正文、About 与侧边栏能加载本地字体。
执行 `npm run clean`、`npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`themes/shokax/layout/page.pug`、`themes/shokax/layout/_partials/head/head.pug`、`themes/shokax/source/css/category-cards.styl`、`themes/shokax/source/css/_common/scaffolding/base.styl`、`source/_data/custom.styl`、`source/fonts/`。

## version17

修复移动端字体显示问题，统一文章正文、About 页面、代码块和侧边栏在手机端的字号、行高与字体 fallback。
补充 iOS / Android 浏览器文字自动放大控制，并处理表格、代码块、长英文在移动端的横向溢出。
执行 `npm run clean`、`npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`themes/shokax/source/css/_common/scaffolding/base.styl`、`themes/shokax/source/css/_common/components/post/post.styl`、`themes/shokax/source/css/about-page.styl`、`themes/shokax/source/css/_common/outline/sidebar/author.styl`、`source/_data/custom.styl`。

## version16

修复移动端权衡度量体未优先应用的问题：移动端顶部标题、站名和 About 页面正文改为权衡度量体优先。
保留桌面端英文数字使用 Story Script 的规则，移动端回到更稳的中文字体排版。
执行 `npm run clean`、`npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`themes/shokax/source/css/_common/outline/header/menu.styl`、`brand.styl`、`themes/shokax/source/css/about-page.styl`。

## version15

调整移动端字体适配：收紧移动端顶部站名宽度、字号和字距，避免 Story Script 在窄屏溢出。
优化 About 页面移动端标题、正文、表格字号和换行，提升手机阅读稳定性。
执行 `npm run clean`、`npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`themes/shokax/source/css/_common/outline/header/menu.styl`、`brand.styl`、`themes/shokax/source/css/about-page.styl`。

## version14

修复线上字体不生效问题：字体文件已上传，但旧 CSS 未重新生成，线上缺少 `@font-face` 规则。
将字体声明和导航/About 字体规则写入主题实际参与构建的 Stylus 文件，并执行 `npm run clean` 后重新生成。
执行 `npm run clean`、`npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`themes/shokax/source/css/_common/scaffolding/base.styl`、`themes/shokax/source/css/_common/outline/header/menu.styl`、`brand.styl`、`themes/shokax/source/css/about-page.styl`。

## version13

接入 Story Script 字体，仅用于顶部导航和 About 页面中的英文、数字及常用英文标点。
通过 `unicode-range` 限定字体范围，中文仍保留权衡度量体或原中文字体。
执行 `npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`source/fonts/StoryScript-Regular.ttf`、`source/_data/custom.styl`。

## version12

调整权衡度量体的使用范围，仅用于顶部导航、站点标题和 About 页面正文。
其他 Markdown 文章恢复原有字体栈，避免全站正文被新字体影响。
执行 `npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`source/_data/custom.styl`。

## version11

接入权衡度量体作为站点试用字体，字体文件放入 `source/fonts/`。
保留切换前的样式备份，便于后续回滚到原字体栈。
执行 `npm run build` 检查生成结果，Build passed。
修改位置：`source/_data/custom.styl`、`source/fonts/QuanHengDuLiang-v0.1.ttf`、`docs/backups/custom.before-quanheng-font.styl`。

## version10

修复文章赞赏区二维码显示尺寸不一致的问题。
将微信和支付宝收款码统一为固定显示尺寸，保留原图比例并避免裁切二维码。
执行 `npm run build` 检查生成结果，Build passed。
修改位置：`themes/shokax/source/css/_common/components/post/reward.styl`。

## version9

更新文章赞赏功能收款码，加入微信支付和支付宝收款图片。
赞赏配置继续使用 Shokax 现有 `/wechatpay.png` 与 `/alipay.png` 路径。
执行 `npm run build -- --silent` 检查生成结果，Build passed，并执行 `npx hexo deploy` 发布网页。
修改位置：`source/wechatpay.png`、`source/alipay.png`。

## version8

移除侧边栏 EMAIL 信息，仅保留 LOCATION: NANJING。
将 52MB 的 Python PDF 加入 Hexo ignore，保留源文件但不再生成和上传到 GitHub Pages。
补充白天模式侧边栏显式覆盖，避免浅色主题下 profile card 仍显示深色。
执行 `npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`themes/shokax/layout/_partials/sidebar/overview.pug`、`source/_data/custom.styl`、`_config.yml`。

## version7

调整首页 hero 文案，将首页主句改为“生命是一袭华美的袍，爬满了蚤子。”。
首页简介改为更偏个人表达的版本：整理技术笔记、项目过程、所见所得与所思所想。
执行 `npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`themes/shokax/layout/index.pug`。

## version6

调整侧边栏信息顺序为动态文字、社交图标、位置邮箱、站点统计。
动态打字机速度进一步放慢，每条文字约 15 秒完成展示和切换。
首页副标题改为 `Robotics · Embodied AI · Films · Notes`，并更新豆瓣链接。
执行 `npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`themes/shokax/layout/_partials/sidebar/overview.pug`、`themes/shokax/source/css/_common/outline/sidebar/author.styl`、`state.styl`、`themes/shokax/layout/index.pug`、`_config.shokax.yml`。

## version5

放慢侧边栏动态打字机速度，每条文字约 5 秒完成展示、停留和切换。
执行 `npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`themes/shokax/layout/_partials/sidebar/overview.pug`。

## version4

同步优化侧边栏白天模式配色，改为米白纸张色卡片和低饱和文字层级。
保留夜间模式深蓝黑 profile card，并通过 CSS 变量区分明暗主题。
执行 `npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`source/_data/custom.styl`、`themes/shokax/source/css/_common/outline/sidebar/author.styl`、`state.styl`、`social.styl`、`menu.styl`。

## version3

优化侧边栏个人信息卡片，头像、昵称、统计、社交图标和导航按钮改为更统一的深色矩形分区。
增加侧边栏动态打字机文字，默认显示 `Por Una Cabeza`，并轮换显示 `I’M Zzzzzzzzzzzz`。
执行 `npm run build -- --silent` 检查生成结果，Build passed；执行 `npm run dev` 启动 5000 端口本地预览。
修复 dev 模式下侧边栏 overview partial 解析问题，改用 Pug 原生 include。
修复 `overview.pug` 中 `shokax_inject` 与菜单缩进导致的 Pug 编译问题。
修改位置：`themes/shokax/layout/_mixin/sidebar.pug`、`themes/shokax/layout/_partials/sidebar/overview.pug`、`themes/shokax/source/css/_common/outline/sidebar/author.styl`、`state.styl`、`social.styl`、`menu.styl`、`sidebar.styl`。

## version2

执行 GitHub Pages 发布前检查：源码仓库 `origin` 指向 Shokax 示例仓库，未推送源码到该远程。
按 Hexo deploy 配置发布到 `dying4ever/dying4ever.github.io`。
执行 `npm run build -- --silent` 和 `npx hexo deploy`。
修改位置：`source/_posts/建站日志.md`。

## version1

统一建站日志格式，按 `AGENT.md` 改为日期一级标题、version 二级标题。
精选分类封面改回与置顶文章相同的远程封面池，并由首页统一分配，避免同页分类封面 URL 重复。
About 页面回退到最早的第一版文案。
执行 `npx hexo clean` 和 `npm run build -- --silent` 检查生成结果，Build passed。
修改位置：`source/_posts/建站日志.md`、`source/about/index.md`、`source/_data/custom.styl`、`themes/shokax/layout/index.pug`、`themes/shokax/layout/_mixin/card.pug`、`themes/shokax/scripts/helpers/engine.js`、`_config.shokax.yml`。

# 2026-05-22

## version6

为有图片素材的一级分类生成本地分类头图，减少远程图源视觉重复。
分类卡片优先使用本地头图，缺少素材的分类回退到远程封面池。
执行 `npx hexo generate --silent` 检查生成结果，Build passed。
修改位置：`source/images/category-covers`、`themes/shokax/scripts/generaters/index.js`、`themes/shokax/layout/_mixin/card.pug`、`_config.shokax.yml`。

## version5

优化首页文章和精选分类封面分配逻辑，避免同一页反复出现重复图片。
扩展远程图片池取图规则，并按页面卡片顺序分配封面。
修改位置：`themes/shokax/scripts/helpers/engine.js`、`themes/shokax/layout/index.pug`、`themes/shokax/layout/_mixin/segment.pug`、`themes/shokax/layout/_mixin/card.pug`。

## version4

调整建站日志页面结构：日志版本按最新在上排列，说明信息移动到页面底部。
为日志日期标题增加高亮样式，避免和普通文章标题混在一起。
修改位置：`source/_posts/建站日志.md`、`source/_data/custom.styl`。

## version3

修复本地预览和线上页面的防仿冒弹窗误判问题。
关闭 Shokax 的 `antiFakeWebsite` 配置，并将 `dev/preview` 端口统一到 5000。
修改位置：`_config.shokax.yml`、`package.json`。

## version2

统一建站日志版本格式，排查本地预览未更新问题。
发现 4000 端口被 `FoxitProtect` 占用，当前 Hexo 实时预览使用 5000 端口。
执行 `npm run clean` 和 `npm run build`，Build passed。
修改位置：`source/_posts/建站日志.md`、`D:\Obsidian 笔记目录\know\建站日志.md`。

## version1

完成第一轮页面美化：调整首页入口、About 页面、Projects 页面和基础阅读样式。
执行 `npm run build` 检查生成结果，Build passed。
修改位置：`themes/shokax/layout/index.pug`、`source/about/index.md`、`source/projects/index.md`、`source/_data/custom.styl`、`_config.shokax.yml`。

# 2026-02-28

## version1

拖了许久，完善了置顶发布。

# 2026-02-06

## version1

改善了一些字体 bug，参考了一些自我介绍格式，又测了一次 MBTI。

# 2026-02-04

## version1

经大佬指点，Hugo 框架转用 Hexo 框架，主题框架更加丰富完善。
时间范围：26.2.4-26.2.5。

---

# 当前站点状态

- 博客框架：Hexo
- 当前主题：Shokax
- 文章来源：Obsidian 笔记目录 `D:\Obsidian 笔记目录\know`
- 发布目录：`F:\hugo\hexo\blog\source\_posts`
- 同步方式：真实目录同步，确保 GitHub 能提交真实 Markdown 和图片资源
- 图片规则：每篇文章使用同名 `.assets` 文件夹，Markdown 引用保持 `![](文章名.assets/图片名)` 格式

# 后续维护提醒

- 平时先在 Obsidian 写笔记。
- 图片放到同名 `.assets` 文件夹。
- 发布前运行同步脚本，把 Obsidian 内容同步到 Hexo。
- 本地先运行 `npm run clean`、`npm run build`、`npm run dev` 预览。
- 确认无误后再手动 `git add`、`git commit`、`git push`。


# 本文作者：曾阿牛

@终南山下，活死人墓

本文链接：https://www.dying4ever.cyou

版权声明：本站所有文章除特别声明外，均采用

(CC)BY-NC-SA 许可协议。转载请注明出处！

这里记录这个小站从框架选择、主题调试、内容整理到 Obsidian 工作流接入的过程。它不只是一个部署日志，也会作为以后排查问题、复盘配置和继续折腾博客时的入口。
