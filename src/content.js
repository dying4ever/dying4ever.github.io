export const SITE_CONTENT = Object.freeze({
  title: '终南山下，活死人墓',
  titleLines: Object.freeze(['终南山下，', '活死人墓']),
  subtitle: '山云开卷，风雨入页',
  statement: '自此，我要写技术，我要写电影，我要写心路，我要写风月。',
  aboutSummary:
    '我叫曾阿牛。一直喜欢记录，也一直寻找载体；这里留下技术、电影、生活，以及仍在发生的变化。',
  logEntries: Object.freeze([
    {
      date: '2026.06.14',
      title: '修复内容同步链路',
      description: '规范文章 front-matter，让 Obsidian 与 Hexo 继续稳定同行。',
    },
    {
      date: '2026.06.14',
      title: '接入 Obsidian 镜像同步',
      description: '用真实目录同步保留 Markdown 与图片资源。',
    },
    {
      date: '2026.06.09',
      title: '重整首屏素材与字体',
      description: '压缩字体与封面，让第一次抵达更轻、更安静。',
    },
  ]),
  categories: Object.freeze([
    { id: 'notes', label: 'NOTES', zh: '笔记', detail: '技术、论文与学习记录' },
    { id: 'film', label: 'FILM', zh: '影评', detail: '电影与光影观察' },
    { id: 'life', label: 'LIFE', zh: '生活', detail: '日常、行路与片刻' },
    { id: 'projects', label: 'SOME PROJECTS', zh: '项目', detail: '机器人、视觉与博客实践' },
  ]),
});

export function getBlogUrl(pathname, base = 'https://www.dying4ever.cyou/') {
  const normalized = `${pathname}`.replace(/^\/+|\/+$/g, '');
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return new URL(`${normalized}/`, normalizedBase).href;
}

export function getPortalItems(base) {
  return [
    {
      id: 'notes',
      label: 'NOTES',
      zh: '笔记',
      description: '阅读、思考与技术记录',
      href: getBlogUrl('categories', base),
      image: '/images/window-notes.webp',
    },
    {
      id: 'film',
      label: 'FILM',
      zh: '影评',
      description: '光影之间，留下故事',
      href: getBlogUrl('categories', base),
      image: '/images/window-film.webp',
    },
    {
      id: 'life',
      label: 'LIFE',
      zh: '生活',
      description: '行走、日常与片刻',
      href: getBlogUrl('categories', base),
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
