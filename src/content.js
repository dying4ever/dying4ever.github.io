export const SITE_CONTENT = Object.freeze({
  title: '终南山下，活死人墓',
  titleLines: Object.freeze(['终南山下，', '活死人墓']),
  subtitle: '山云开卷，风雨入页',
  aboutSummary:
    '我叫曾阿牛。一直喜欢记录，也一直寻找载体；这里留下技术、电影、生活，以及仍在发生的变化。',
  prologueParts: Object.freeze([
    '以前我一直这样想着：等我的书出版了，我要走到每一个报摊上去看看。我要我最喜欢的蓝绿的封面，给报摊子上开一扇夜蓝的小窗户；人们可以在窗口看月亮，看热闹。',
    '我要问报贩，装出不相干的样子：“销路还好吗？——太贵了，这么贵，真还有人买吗？”呵，出名要趁早呀！来得太晚的话，快乐也不那么痛快。',
    '最初在校刊上登两篇文章，也是发了疯似的高兴着，自己读了一遍又一遍，每一次都像是第一次见到。就现在已经没那么容易兴奋了。所以更加要催：快，快，迟了来不及了，来不及了。',
  ]),
  prologueHighlight: '呵，出名要趁早呀！来得太晚的话，快乐也不那么痛快。',
  prologueAttribution: '——张爱玲《传奇》',
  aboutStory:
    '我叫曾阿牛。名字借自张无忌离开冰火岛后使用过的化名。写下这个名字，也是在给互联网上的自己留一个坐标。',
  aboutNotes: Object.freeze([
    '我叫曾阿牛。名字借自张无忌离开冰火岛后使用过的化名，也是在互联网上给自己留一个坐标。',
    '一直喜欢记录，也一直寻找载体。这个博客会慢慢收下技术、电影、生活，以及一路发生的变化。',
  ]),
  aboutPoints: Object.freeze([
    '叫曾阿牛，起自张无忌离开冰火岛、流落蝴蝶谷之后与蛛儿相遇时的化名。',
    '也希望遇见我的蛛儿。',
  ]),
  logEntries: Object.freeze([
    {
      date: '2026.07.16',
      title: '迁移为独立 Markdown 站点',
      description: '首页、分类、归档、About、项目、友链和文章全部由新项目静态生成。',
    },
    {
      date: '2026.07.16',
      title: '完成电影式滚动转场',
      description: '补齐云雾、推镜、飞鸟与明暗桥接，并统一小字号阅读字体。',
    },
    {
      date: '2026.07.16',
      title: '修复分类与归档内容链路',
      description: '分类页显示 Markdown 引言，归档恢复 131 篇文章入口并完善移动端。',
    },
  ]),
  categories: Object.freeze([
    { id: 'notes', label: 'NOTES', zh: '笔记', detail: '技术、论文与学习记录' },
    { id: 'film', label: 'FILM', zh: '影评', detail: '电影与光影观察' },
    { id: 'life', label: 'LIFE', zh: '生活', detail: '日常、行路与片刻' },
    { id: 'projects', label: 'SOME PROJECTS', zh: '项目', detail: '机器人、视觉与博客实践' },
  ]),
});

export function getBlogUrl(
  pathname,
  base = '/',
  origin = 'https://www.dying4ever.cyou/',
) {
  const normalized = `${pathname}`.replace(/^\/+|\/+$/g, '');
  const resolvedBase = new URL(base, origin).href;
  const normalizedBase = resolvedBase.endsWith('/') ? resolvedBase : `${resolvedBase}/`;
  return new URL(`${normalized}/`, normalizedBase).href;
}

export function getPortalItems(base) {
  return [
    {
      id: 'notes',
      label: 'NOTES',
      zh: '笔记',
      description: '阅读、思考与技术记录',
      href: getBlogUrl('notes', base),
      image: '/images/window-notes.webp',
    },
    {
      id: 'film',
      label: 'FILM',
      zh: '影评',
      description: '光影之间，留下故事',
      href: getBlogUrl('film', base),
      image: '/images/window-film.webp',
    },
    {
      id: 'life',
      label: 'LIFE',
      zh: '生活',
      description: '行走、日常与片刻',
      href: getBlogUrl('life', base),
      image: '/images/window-life.webp',
    },
    {
      id: 'projects',
      label: 'SOME PROJECTS',
      zh: '项目',
      description: '灵感、创造与实现',
      href: getBlogUrl('projects', base),
      image: '/images/window-projects.webp',
    },
  ];
}
