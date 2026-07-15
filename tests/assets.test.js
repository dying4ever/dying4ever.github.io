import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';

test('serves a lightweight WebP mountain background', async () => {
  const asset = await stat(new URL('../public/images/mountain-cover.webp', import.meta.url));
  assert.ok(asset.size < 900_000, `mountain background is ${asset.size} bytes`);
});
