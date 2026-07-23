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
  const prologueTitleChars = [...root.querySelectorAll('.prologue-panel__title-char')];
  const aboutStory = root.querySelector('.about-story');
  const aboutStoryDetails = [
    ...root.querySelectorAll(
      '.about-story__eyebrow, .about-story__portrait, .about-story__name, .about-story__socials',
    ),
  ];
  const journeyAtmosphere = root.querySelector('.journey-atmosphere');
  const journeyClouds = [...root.querySelectorAll('.journey-cloud')];
  const journeyPetals = root.querySelector('[data-atmosphere="petal"]');
  const journeySnow = root.querySelector('[data-atmosphere="snow"]');
  const siteHeader = root.querySelector('.site-header');
  const supportsCinematicScroll = view.matchMedia('(min-width: 769px) and (pointer: fine)').matches;

  if (
    !story
    || !stage
    || !aboutStory
    || !journeyAtmosphere
    || reducedMotion
    || !supportsCinematicScroll
  ) {
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
  gsap.set(prologueTitleChars, { autoAlpha: 0, yPercent: 38 });
  gsap.set(aboutStory, {
    autoAlpha: 0,
    yPercent: 5,
    scale: 1.035,
    filter: 'brightness(.72) sepia(.2)',
  });
  gsap.set(aboutStoryDetails, { autoAlpha: 0, y: 28 });
  gsap.set(journeyAtmosphere, { autoAlpha: 0 });
  gsap.set(journeyClouds, { autoAlpha: 0, xPercent: (index) => (index ? 5 : -6) });
  gsap.set(journeyPetals, { autoAlpha: 0, xPercent: -5, yPercent: -4 });
  gsap.set(journeySnow, { autoAlpha: 0, xPercent: 3, yPercent: -5 });

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
    .to(storyWorld, { autoAlpha: 1, scale: 1, duration: 0.17 }, 0.02)
    .fromTo(storyImage, { scale: 1.12 }, { scale: 1.015, duration: 0.52 }, 0.03)
    .to(storyStripes, { clipPath: 'inset(0% 0 0 0)', duration: 0.24 }, 0.06)
    .to(journeyAtmosphere, { autoAlpha: 1, duration: 0.16 }, 0.06)
    .to(journeyClouds, {
      autoAlpha: (index) => (index ? 0.58 : 0.38),
      xPercent: (index) => (index ? -4 : 6),
      duration: 0.48,
      stagger: 0.02,
    }, 0.07)
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
    .to(storyFocus, { autoAlpha: 0, y: -28, scale: 0.94, duration: 0.12 }, 0.36)
    .to(storyWorld, {
      scale: 0.96,
      autoAlpha: 0.66,
      filter: 'brightness(.68) sepia(.32) saturate(.85)',
      duration: 0.24,
      ease: 'power2.inOut',
    }, 0.36)
    .to(prologuePanel, { autoAlpha: 1, duration: 0.2 }, 0.39)
    .to(prologueFrame, { scale: 1, duration: 0.22, ease: 'power2.out' }, 0.4)
    .to(prologueTitleChars, {
      autoAlpha: 1,
      yPercent: 0,
      duration: 0.13,
      stagger: 0.018,
      ease: 'power2.out',
    }, 0.42)
    .to(journeyPetals, {
      autoAlpha: 0.72,
      xPercent: 4,
      yPercent: 3,
      duration: 0.28,
      ease: 'power1.inOut',
    }, 0.42)
    .to(prologueParts, { autoAlpha: 0.78, y: 0, duration: 0.1, stagger: 0.015 }, 0.46)
    .to(prologueParts[0], { autoAlpha: 1, duration: 0.075, ease: 'power2.out' }, 0.5)
    .to(prologueParts[0], { autoAlpha: 0.78, duration: 0.05 }, 0.57)
    .to(prologueParts[1], { autoAlpha: 1, duration: 0.075, ease: 'power2.out' }, 0.58)
    .to(prologueParts[1], { autoAlpha: 0.78, duration: 0.05 }, 0.65)
    .to(prologueParts[2], { autoAlpha: 1, duration: 0.08, ease: 'power2.out' }, 0.66)
    .to(prologueAttribution, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.53)
    .addLabel('about-bridge', 0.76)
    .to([storyStripes, ...storyInk, birdFlock, storyFocus], {
      autoAlpha: 0,
      duration: 0.11,
    }, 'about-bridge')
    .to(prologueFrame, { scale: 0.985, yPercent: -2, duration: 0.11 }, 'about-bridge')
    .to(prologuePanel, {
      autoAlpha: 0,
      duration: 0.12,
      ease: 'power2.inOut',
    }, 'about-bridge')
    .to(storyWorld, {
      autoAlpha: 0.12,
      scale: 1.055,
      filter: 'brightness(.78) sepia(.26) saturate(.72)',
      duration: 0.15,
      ease: 'power2.inOut',
    }, 'about-bridge')
    .to(journeyPetals, { autoAlpha: 0.16, yPercent: 9, duration: 0.13 }, 'about-bridge')
    .to(journeySnow, { autoAlpha: 0.68, xPercent: -2, yPercent: 2, duration: 0.15 }, 'about-bridge')
    .to(aboutStory, {
      autoAlpha: 1,
      yPercent: 0,
      scale: 1,
      filter: 'brightness(1) sepia(0)',
      duration: 0.16,
      ease: 'power2.out',
    }, 'about-bridge')
    .to(aboutStoryDetails, {
      autoAlpha: 1,
      y: 0,
      duration: 0.12,
      stagger: 0.016,
      ease: 'power2.out',
    }, 0.79)
    .to(journeyClouds, {
      autoAlpha: (index) => (index ? 0.48 : 0.3),
      xPercent: (index) => (index ? 5 : -4),
      duration: 0.2,
    }, 0.8)
    .to(journeySnow, { autoAlpha: 0.22, yPercent: 8, duration: 0.13 }, 0.88)
    .to(journeyPetals, { autoAlpha: 0, duration: 0.08 }, 0.89)
    .to(siteHeader, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.91)
    .to(aboutStory, { autoAlpha: 1, duration: 0.09 }, 0.91);

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
