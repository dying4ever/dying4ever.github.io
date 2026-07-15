import { gsap } from 'gsap';
import { createSceneState, reduceScene, shouldOpenFromEvent } from './scene-state.js';

const OPENING_DURATION_MS = 1900;

export function initMotion({
  root = document,
  reducedMotion = false,
} = {}) {
  const html = root.documentElement;
  const cover = root.querySelector('#cover');
  const enterButton = root.querySelector('#enter-button');
  const replayButton = root.querySelector('#replay-opening');
  const homeHeading = root.querySelector('[data-home-heading]');
  const panels = [...root.querySelectorAll('[data-panel]')];
  const fogLayers = [...root.querySelectorAll('.fog')];
  const titleParts = [...root.querySelectorAll('.title-slice')];
  let state = createSceneState();
  let timeline = null;
  let fallbackTimer = null;

  if (reducedMotion) {
    html.classList.add('is-reduced-motion');
  }

  const completeOpening = () => {
    state = reduceScene(state, { type: 'OPEN_COMPLETE' });
    html.classList.remove('is-opening');
    html.classList.add('is-open');
    cover.setAttribute('aria-hidden', 'true');
    cover.inert = true;
    homeHeading?.focus({ preventScroll: true });
  };

  const playOpening = () => {
    html.classList.add('is-opening');

    if (reducedMotion) {
      fallbackTimer = window.setTimeout(completeOpening, 220);
      return;
    }

    try {
      timeline = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: completeOpening,
      });
      timeline
        .to('.cover__prompt, .cover__enter', { opacity: 0, duration: 0.2 })
        .to(
          titleParts,
          {
            xPercent: (index) => (index % 2 ? 22 : -22),
            opacity: 0,
            stagger: 0.035,
            duration: 0.58,
          },
          0,
        )
        .to('.cover__line--left', { xPercent: -125, duration: 1.25 }, 0.12)
        .to('.cover__line--right', { xPercent: 125, duration: 1.25 }, 0.12)
        .to(
          panels,
          {
            xPercent: (index) => (index < panels.length / 2 ? -112 : 112),
            stagger: { amount: 0.26, from: 'center' },
            duration: 1.42,
          },
          0.24,
        )
        .to(
          fogLayers,
          {
            xPercent: (index) => (index % 2 ? 76 : -76),
            opacity: 0.12,
            duration: 1.3,
          },
          0.22,
        )
        .to('.curtain--left', { xPercent: -104, duration: 1.25 }, 0.36)
        .to('.curtain--right', { xPercent: 104, duration: 1.25 }, 0.36)
        .fromTo(
          '#home',
          { scale: 1.035, filter: 'brightness(.55)' },
          { scale: 1, filter: 'brightness(1)', duration: 1.35 },
          0.3,
        );
    } catch (error) {
      console.warn('Opening animation used the fallback transition.', error);
      fallbackTimer = window.setTimeout(completeOpening, OPENING_DURATION_MS);
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
    if (event.type === 'wheel' || event.type === 'keydown') {
      event.preventDefault();
    }
    open();
  };

  const replay = () => {
    const nextState = reduceScene(state, { type: 'REPLAY' });
    if (nextState === state) return false;
    state = nextState;
    timeline?.kill();
    timeline = null;
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    gsap.set(
      [
        ...panels,
        ...fogLayers,
        ...titleParts,
        '.cover__prompt',
        '.cover__enter',
        '.cover__line--left',
        '.cover__line--right',
        '.curtain--left',
        '.curtain--right',
        '#home',
      ],
      { clearProps: 'all' },
    );
    cover.inert = false;
    cover.removeAttribute('aria-hidden');
    html.classList.remove('is-open', 'is-opening');
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
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
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      enterButton?.removeEventListener('click', handleEntryInput);
      cover?.removeEventListener('pointerup', handleEntryInput);
      root.removeEventListener('wheel', handleEntryInput);
      root.removeEventListener('keydown', handleEntryInput);
      replayButton?.removeEventListener('click', replay);
    },
  };
}
