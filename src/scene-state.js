const OPEN_KEYS = new Set(['Enter', ' ', 'Spacebar', 'PageDown', 'ArrowDown']);

export const createSceneState = () => ({ phase: 'cover', hasOpened: false });

export function reduceScene(state, event) {
  if (event.type === 'REPLAY' && state.phase === 'home') {
    return createSceneState();
  }

  if (event.type === 'OPEN_REQUEST' && state.phase === 'cover' && !state.hasOpened) {
    return { phase: 'opening', hasOpened: true };
  }

  if (event.type === 'OPEN_COMPLETE' && state.phase === 'opening') {
    return { phase: 'home', hasOpened: true };
  }

  return state;
}

export function shouldOpenFromEvent(event) {
  if (event.type === 'wheel') {
    return Number(event.deltaY) > 8;
  }

  if (event.type === 'keydown') {
    return OPEN_KEYS.has(event.key);
  }

  return event.type === 'click' || event.type === 'pointerup' || event.type === 'touchend';
}
