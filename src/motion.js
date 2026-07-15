import { gsap } from 'gsap';
import { createSceneState, reduceScene, shouldOpenFromEvent } from './scene-state.js';

const OPENING_DURATION_MS = 3200;

export function initMotion({
  root = document,
  reducedMotion = false,
} = {}) {
  const html = root.documentElement;
  const view = root.defaultView ?? window;
  const cover = root.querySelector('#cover');
  const coverLandscape = root.querySelector('[data-cover-landscape]');
  const coverTitle = root.querySelector('#cover-title');
  const transitionTitle = root.querySelector('[data-transition-title]');
  const enterButton = root.querySelector('#enter-button');
  const replayButton = root.querySelector('#replay-opening');
  const homeHeading = root.querySelector('[data-home-heading]');
  const homeLandscape = root.querySelector('.home-hero__landscape');
  const homeCopy = root.querySelector('.home-hero__copy');
  const homeCopyDetails = [...root.querySelectorAll('.home-hero__copy > :not(.home-hero__title)')];
  const siteHeader = root.querySelector('.site-header');
  const portalGrid = root.querySelector('#portal-grid');
  const portals = [...root.querySelectorAll('[data-portal]')];
  const homeFog = [...root.querySelectorAll('.home-fog')];
  const panels = [...root.querySelectorAll('[data-panel]')];
  const fogLayers = [...root.querySelectorAll('.fog')];
  let state = createSceneState();
  let timeline = null;
  let fallbackTimer = null;

  if (reducedMotion) {
    html.classList.add('is-reduced-motion');
  }

  const clearHomeAnimationProps = () => {
    gsap.set(
      [
        siteHeader,
        homeCopy,
        ...homeCopyDetails,
        homeHeading,
        portalGrid,
        ...portals,
        homeLandscape,
        ...homeFog,
      ].filter(Boolean),
      { clearProps: 'opacity,visibility,transform,filter' },
    );
  };

  const completeOpening = () => {
    state = reduceScene(state, { type: 'OPEN_COMPLETE' });
    html.classList.add('is-open');
    html.classList.remove('is-opening', 'is-transitioning');
    cover.setAttribute('aria-hidden', 'true');
    cover.inert = true;
    gsap.set(transitionTitle, { autoAlpha: 0 });
    clearHomeAnimationProps();
    homeHeading?.focus({ preventScroll: true });
  };

  const prepareTitleBridge = () => {
    if (!coverTitle || !homeHeading || !transitionTitle) return null;

    const sourceRect = coverTitle.getBoundingClientRect();
    const targetRect = homeHeading.getBoundingClientRect();
    const sourceStyle = view.getComputedStyle(coverTitle);
    const targetStyle = view.getComputedStyle(homeHeading);
    const sourceFontSize = Number.parseFloat(sourceStyle.fontSize) || 1;
    const targetFontSize = Number.parseFloat(targetStyle.fontSize) || sourceFontSize;

    gsap.set(transitionTitle, {
      autoAlpha: 1,
      x: sourceRect.left,
      y: sourceRect.top,
      width: sourceRect.width,
      fontSize: sourceStyle.fontSize,
      lineHeight: sourceStyle.lineHeight,
      letterSpacing: sourceStyle.letterSpacing,
      scale: 1,
    });
    gsap.set(coverTitle, { autoAlpha: 0 });
    gsap.set(homeHeading, { autoAlpha: 0 });

    return {
      x: targetRect.left,
      y: targetRect.top,
      scale: targetFontSize / sourceFontSize,
    };
  };

  const playOpening = () => {
    html.classList.add('is-opening', 'is-transitioning');

    if (reducedMotion) {
      fallbackTimer = view.setTimeout(completeOpening, 220);
      return;
    }

    try {
      gsap.set(homeCopy, { autoAlpha: 1, x: 0 });
      gsap.set(homeCopyDetails, { autoAlpha: 0, y: 22 });
      gsap.set(siteHeader, { autoAlpha: 0, y: -20 });
      gsap.set(portalGrid, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
      gsap.set(portals, { autoAlpha: 0, y: 64, scale: 0.95 });
      gsap.set(homeFog, { opacity: 0 });
      gsap.set(homeLandscape, {
        opacity: 0.2,
        scale: 1.085,
        filter: 'brightness(.56) saturate(.42)',
      });

      const titleTarget = prepareTitleBridge();

      timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: completeOpening,
      });

      timeline
        .addLabel('veil', 0)
        .to('.cover__prompt, .cover__enter, .cover__eyebrow, .cover__subtitle', {
          opacity: 0,
          y: -8,
          duration: 0.42,
          stagger: 0.025,
        }, 'veil')
        .to('.cover__line--left', { xPercent: -128, opacity: 0, duration: 1.35 }, 0.12)
        .to('.cover__line--right', { xPercent: 128, opacity: 0, duration: 1.35 }, 0.12)
        .addLabel('clouds', 0.22)
        .to(fogLayers, {
          xPercent: (index) => (index % 2 ? 82 : -82),
          opacity: 0.08,
          stagger: { amount: 0.18, from: 'center' },
          duration: 1.55,
        }, 'clouds')
        .to('.curtain--left', { xPercent: -112, opacity: 0.1, duration: 1.55 }, 0.38)
        .to('.curtain--right', { xPercent: 112, opacity: 0.1, duration: 1.55 }, 0.38)
        .to(panels, {
          xPercent: (index) => (index < panels.length / 2 ? -34 : 34),
          opacity: 0,
          stagger: { amount: 0.25, from: 'center' },
          duration: 1.45,
        }, 0.42)
        .addLabel('camera', 0.5)
        .to(coverLandscape, {
          scale: 1.105,
          filter: 'brightness(.72) saturate(.45)',
          duration: 2.1,
        }, 'camera')
        .to(homeLandscape, {
          opacity: 0.46,
          scale: 1.02,
          filter: 'brightness(1) saturate(.42)',
          duration: 2.15,
        }, 'camera')
        .to(homeFog, {
          opacity: (index) => (index ? 0.24 : 0.15),
          duration: 1.45,
          stagger: 0.14,
        }, 0.78)
        .to(cover, { opacity: 0, duration: 1.35, ease: 'power2.inOut' }, 1.22)
        .addLabel('title-bridge', 0.88);

      if (titleTarget) {
        timeline
          .to(transitionTitle, {
            x: titleTarget.x,
            y: titleTarget.y,
            scale: titleTarget.scale,
            duration: 1.52,
            ease: 'power4.inOut',
          }, 'title-bridge')
          .to(transitionTitle, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 2.22)
          .to(homeHeading, { autoAlpha: 1, duration: 0.62, ease: 'power2.out' }, 2.1);
      } else {
        timeline.to(homeHeading, { autoAlpha: 1, duration: 0.6 }, 1.9);
      }

      timeline
        .addLabel('windows', 1.56)
        .to(portals, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.94,
          stagger: { amount: 0.34, from: 'random' },
          ease: 'power3.out',
        }, 'windows')
        .to(homeCopyDetails, {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.08,
          ease: 'power2.out',
        }, 2.02)
        .addLabel('navigation', 2.34)
        .to(siteHeader, {
          autoAlpha: 1,
          y: 0,
          duration: 0.66,
          ease: 'power2.out',
        }, 'navigation')
        .to('.home-hero__vertical', { opacity: 1, duration: 0.55 }, 2.48)
        .to({}, { duration: 0.16 });
    } catch (error) {
      console.warn('Opening animation used the fallback transition.', error);
      fallbackTimer = view.setTimeout(completeOpening, OPENING_DURATION_MS);
    }
  };

  const open = () => {
    const nextState = reduceScene(state, { type: 'OPEN_REQUEST' });
    if (nextState === state) return false;
    state = nextState;
    playOpening();
    return true;
  };

  const handleEntryInput = (event) => {
    if (!shouldOpenFromEvent(event)) return;
    const didOpen = open();
    if (!didOpen) return;
    if (event.type === 'wheel' || event.type === 'keydown') {
      event.preventDefault();
    }
  };

  const replay = () => {
    const nextState = reduceScene(state, { type: 'REPLAY' });
    if (nextState === state) return false;
    state = nextState;
    timeline?.kill();
    timeline = null;
    if (fallbackTimer) view.clearTimeout(fallbackTimer);
    html.classList.remove('is-open', 'is-opening', 'is-transitioning');
    gsap.set(
      [
        cover,
        coverLandscape,
        coverTitle,
        transitionTitle,
        ...panels,
        ...fogLayers,
        '.cover__prompt',
        '.cover__enter',
        '.cover__eyebrow',
        '.cover__subtitle',
        '.cover__line--left',
        '.cover__line--right',
        '.curtain--left',
        '.curtain--right',
        '.home-hero__vertical',
      ].filter(Boolean),
      { clearProps: 'all' },
    );
    clearHomeAnimationProps();
    cover.inert = false;
    cover.removeAttribute('aria-hidden');
    view.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    enterButton?.focus({ preventScroll: true });
    return true;
  };

  enterButton?.addEventListener('click', handleEntryInput);
  cover?.addEventListener('pointerup', handleEntryInput);
  root.addEventListener('wheel', handleEntryInput, { passive: false });
  root.addEventListener('keydown', handleEntryInput);
  replayButton?.addEventListener('click', replay);
  html.classList.add('is-ready');

  return {
    open,
    replay,
    destroy() {
      timeline?.kill();
      if (fallbackTimer) view.clearTimeout(fallbackTimer);
      enterButton?.removeEventListener('click', handleEntryInput);
      cover?.removeEventListener('pointerup', handleEntryInput);
      root.removeEventListener('wheel', handleEntryInput);
      root.removeEventListener('keydown', handleEntryInput);
      replayButton?.removeEventListener('click', replay);
    },
  };
}
