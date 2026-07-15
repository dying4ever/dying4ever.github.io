import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSceneState,
  reduceScene,
  shouldOpenFromEvent,
} from '../src/scene-state.js';

test('opens the cover only once while transition is active', () => {
  const cover = createSceneState();
  const opening = reduceScene(cover, { type: 'OPEN_REQUEST' });
  assert.deepEqual(opening, { phase: 'opening', hasOpened: true });
  assert.equal(reduceScene(opening, { type: 'OPEN_REQUEST' }), opening);
});

test('finishes and can explicitly replay', () => {
  const home = reduceScene(
    { phase: 'opening', hasOpened: true },
    { type: 'OPEN_COMPLETE' },
  );
  assert.deepEqual(home, { phase: 'home', hasOpened: true });
  assert.deepEqual(reduceScene(home, { type: 'REPLAY' }), {
    phase: 'cover',
    hasOpened: false,
  });
});

test('ignores unsupported scene events', () => {
  const cover = createSceneState();
  assert.equal(reduceScene(cover, { type: 'OPEN_COMPLETE' }), cover);
});

test('accepts intentional entry input and rejects incidental movement', () => {
  assert.equal(shouldOpenFromEvent({ type: 'wheel', deltaY: 24 }), true);
  assert.equal(shouldOpenFromEvent({ type: 'wheel', deltaY: -24 }), false);
  assert.equal(shouldOpenFromEvent({ type: 'wheel', deltaY: 3 }), false);
  assert.equal(shouldOpenFromEvent({ type: 'keydown', key: 'Enter' }), true);
  assert.equal(shouldOpenFromEvent({ type: 'keydown', key: 'Escape' }), false);
  assert.equal(shouldOpenFromEvent({ type: 'click' }), true);
});
