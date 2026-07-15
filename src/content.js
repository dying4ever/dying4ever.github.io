export const SITE_CONTENT = Object.freeze({
  title: '终南山下，活死人墓',
  subtitle: '山云开卷，风雨入页',
  statement: '自此，我要写技术，我要写电影，我要写心路，我要写风月。',
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
