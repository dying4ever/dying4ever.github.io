const navigation = document.querySelector('.content-nav');
const menu = document.querySelector('.content-menu');

menu?.addEventListener('click', () => {
  const open = navigation.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', `${open}`);
});

document.querySelector('.article-toc button')?.addEventListener('click', (event) => {
  const toc = event.currentTarget.closest('.article-toc');
  const open = toc.classList.toggle('is-open');
  event.currentTarget.setAttribute('aria-expanded', `${open}`);
});

document.querySelectorAll('.article-toc a').forEach((link) => {
  link.addEventListener('click', () => {
    const toc = link.closest('.article-toc');
    toc?.classList.remove('is-open');
    toc?.querySelector('button')?.setAttribute('aria-expanded', 'false');
  });
});
