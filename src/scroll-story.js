import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollStory({ root = document, reducedMotion = false } = {}) {
  const view = root.defaultView ?? window;
  const html = root.documentElement;
  const story = root.querySelector('#scroll-story');
  const stage = root.querySelector('[data-story-stage]');
  const homeHero = root.querySelector('.home-hero');
  const storyWorld = root.querySelector('[data-story-landscape]');
  const storyImage = root.querySelector('.story-world__image');
  const storyStripes = root.querySelector('.story-world__stripes');
  const storyInk = [...root.querySelectorAll('.story-world__ink')];
  const storyFocus = root.querySelector('.story-world__focus');
  const clouds = [...root.querySelectorAll('[data-story-cloud]')];
  const birdFlock = root.querySelector('[data-bird-flock]');
  const prologuePanel = root.querySelector('.prologue-panel');
  const prologueFrame = root.querySelector('.prologue-panel__frame');
  const prologueParts = [...root.querySelectorAll('[data-prologue-part]')];
  const prologueAttribution = root.querySelector('[data-prologue-attribution]');
  const siteHeader = root.querySelector('.site-header');
  const supportsCinematicScroll = view.matchMedia('(min-width: 769px) and (pointer: fine)').matches;

  if (!story || !stage || reducedMotion || !supportsCinematicScroll) {
    html.classList.add('is-story-static');
    return { destroy() {} };
  }

  html.classList.add('has-smooth-story');

  gsap.set(storyWorld, {
    autoAlpha: 0,
    scale: 1.045,
    filter: 'brightness(1) sepia(0) saturate(1)',
  });
  gsap.set(storyStripes, { clipPath: 'inset(100% 0 0 0)' });
  gsap.set(storyFocus, { autoAlpha: 0, y: 42, scale: 0.92 });
  gsap.set(clouds, { autoAlpha: 0 });
  gsap.set(birdFlock, { autoAlpha: 0, xPercent: -115, yPercent: 22 });
  gsap.set(prologuePanel, { autoAlpha: 0 });
  gsap.set(prologueFrame, { scale: 1.05 });
  gsap.set(prologueParts, { autoAlpha: 0, y: 18 });
  gsap.set(prologueAttribution, { autoAlpha: 0, y: 14 });

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: story,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.35,
      invalidateOnRefresh: true,
    },
  });

  timeline
    .to(siteHeader, { autoAlpha: 0, y: -22, duration: 0.07 }, 0)
    .to(homeHero, {
      scale: 0.78,
      borderRadius: '1.3rem',
      boxShadow: '0 3rem 8rem rgba(35, 27, 17, .42)',
      duration: 0.2,
      ease: 'power2.inOut',
    }, 0)
    .to(storyWorld, { autoAlpha: 1, scale: 1, duration: 0.18 }, 0.02)
    .fromTo(storyImage, { scale: 1.12 }, { scale: 1.02, duration: 0.46 }, 0.03)
    .to(storyStripes, { clipPath: 'inset(0% 0 0 0)', duration: 0.24 }, 0.06)
    .to(clouds, {
      autoAlpha: (index) => 0.3 + index * 0.1,
      xPercent: (index) => (index % 2 ? 12 : -11),
      duration: 0.34,
      stagger: 0.025,
    }, 0.08)
    .to(homeHero, {
      scale: 0.36,
      yPercent: -3,
      autoAlpha: 0,
      duration: 0.18,
      ease: 'power2.in',
    }, 0.16)
    .to(storyFocus, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.16,
      ease: 'power2.out',
    }, 0.23)
    .to(birdFlock, {
      autoAlpha: 0.9,
      xPercent: 105,
      yPercent: -18,
      duration: 0.28,
      ease: 'power1.inOut',
    }, 0.22)
    .to(storyFocus, { autoAlpha: 0, y: -28, scale: 0.94, duration: 0.13 }, 0.4)
    .to(storyWorld, {
      scale: 0.92,
      autoAlpha: 0.58,
      filter: 'brightness(.68) sepia(.32) saturate(.85)',
      duration: 0.26,
      ease: 'power2.inOut',
    }, 0.4)
    .to(prologuePanel, { autoAlpha: 1, duration: 0.22 }, 0.43)
    .to(prologueFrame, { scale: 1, duration: 0.24, ease: 'power2.out' }, 0.44)
    .to(prologueParts, { autoAlpha: 0.78, y: 0, duration: 0.1, stagger: 0.015 }, 0.49)
    .to(prologueParts[0], { autoAlpha: 1, duration: 0.09, ease: 'power2.out' }, 0.53)
    .to(prologueParts[0], { autoAlpha: 0.78, duration: 0.06 }, 0.63)
    .to(prologueParts[1], { autoAlpha: 1, duration: 0.09, ease: 'power2.out' }, 0.64)
    .to(prologueParts[1], { autoAlpha: 0.78, duration: 0.06 }, 0.75)
    .to(prologueParts[2], { autoAlpha: 1, duration: 0.1, ease: 'power2.out' }, 0.76)
    .to(prologueAttribution, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.86)
    .to([storyStripes, ...storyInk, birdFlock, storyFocus], {
      autoAlpha: 0,
      duration: 0.08,
    }, 0.9)
    .to(prologueFrame, { scale: 0.96, autoAlpha: 0.22, duration: 0.08 }, 0.91)
    .to(prologuePanel, { autoAlpha: 0, duration: 0.08 }, 0.92)
    .to(storyWorld, {
      autoAlpha: 1,
      scale: 1,
      filter: 'brightness(1) sepia(.12) saturate(.78)',
      duration: 0.08,
    }, 0.92)
    .to(siteHeader, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.94);

  const refresh = () => {
    ScrollTrigger.refresh();
  };

  view.addEventListener('resize', refresh);
  view.addEventListener('immersive:opened', refresh);
  view.requestAnimationFrame(refresh);

  return {
    destroy() {
      timeline.scrollTrigger?.kill();
      timeline.kill();
      view.removeEventListener('resize', refresh);
      view.removeEventListener('immersive:opened', refresh);
      html.classList.remove('has-smooth-story');
    },
  };
}
