import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePin,
  validateCaption,
  validateComment,
  validatePostMedia,
  validateInvite,
  isPostNew,
  generateInviteCode,
} from './validators.js';

test('validatePin accepts 6 digits and rejects invalid inputs with plain messages', () => {
  assert.equal(validatePin('123456'), null);
  assert.match(validatePin('12345'), /6-digit PIN/);
  assert.match(validatePin('12ab56'), /6-digit PIN/);
});

test('validateCaption and validateComment enforce required text and 300 char limit', () => {
  assert.match(validateCaption('   '), /write a short caption/i);
  assert.equal(validateCaption('Sunday lunch in the garden'), null);
  assert.match(validateCaption('a'.repeat(301)), /300 characters/);

  assert.match(validateComment(''), /write a short message/i);
  assert.equal(validateComment('Love this photo!'), null);
  assert.match(validateComment('b'.repeat(301)), /300 characters/);
});

test('validatePostMedia enforces 1..6 items and max 1 video <= 15s', () => {
  assert.match(validatePostMedia([]), /at least one/);
  assert.match(validatePostMedia(Array(7).fill({ kind: 'photo' })), /up to 6 items/);
  assert.match(
    validatePostMedia([{ kind: 'video', durationSeconds: 5 }, { kind: 'video', durationSeconds: 5 }]),
    /only one video/,
  );
  assert.match(validatePostMedia([{ kind: 'video', durationSeconds: 18 }]), /15 seconds/);
  assert.equal(
    validatePostMedia([{ kind: 'photo' }, { kind: 'video', durationSeconds: 12 }]),
    null,
  );
});

test('validateInvite rejects missing, used, and expired codes', () => {
  const now = new Date('2026-11-12T12:00:00Z');
  assert.match(validateInvite(null, now), /not found/i);
  assert.match(validateInvite({ used_by: 'u1', expires_at: '2026-11-18T12:00:00Z' }, now), /already been used/i);
  assert.match(validateInvite({ used_by: null, expires_at: '2026-11-10T12:00:00Z' }, now), /expired/i);
  assert.equal(validateInvite({ used_by: null, expires_at: '2026-11-18T12:00:00Z' }, now), null);
});

test('isPostNew compares timestamps accurately', () => {
  const lastSeen = '2026-11-11T10:00:00Z';
  assert.equal(isPostNew({ created_at: '2026-11-11T11:00:00Z' }, lastSeen), true);
  assert.equal(isPostNew({ created_at: '2026-11-11T09:00:00Z' }, lastSeen), false);
});

test('generateInviteCode produces KIN-XXXX-XXXX format', () => {
  assert.match(generateInviteCode(), /^KIN-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
});
