/* global it, jasmine */
let assert = require('assert');


it.skip('bip38 decodes', async () => {
  const bip38 = require('../../blue_modules/bip38grs');
  const wif = require('wifgrs');

  let encryptedKey = '6PRVWUbkzq2VVjRuv58jpwVjTeN46MeNmzUHqUjQptBJUHGcBakduhrUNc';
  let decryptedKey = await bip38.decrypt(
    encryptedKey,
    'TestingOneTwoThree',
    () => {},
    { N: 1, r: 8, p: 8 }, // using non-default parameters to speed it up (not-bip38 compliant)
  );

  assert.strictEqual(
    wif.encode(0x80, decryptedKey.privateKey, decryptedKey.compressed),
    '5JEu13zVLWvRLGt7rxrHXSEFJHh2htpXuB7X1ZLRKKqd1QwFuEC',
  );
});


it('bip38 decodes slow', async () => {
  if (process.env.USER === 'burn' || process.env.USER === 'igor' || process.env.USER === 'overtorment') {
    // run only on circleCI
    return;
  }
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  const bip38 = require('../../blue_modules/bip38grs');
  const wif = require('wifgrs');

  let encryptedKey = '6PfL5SWsmnSdYwamdbjtgWPpyrzmTFZVFtP8Xwc1WmSNL53zmMjHgmN3es';
  let callbackWasCalled = false;
  let decryptedKey = await bip38.decrypt(encryptedKey, 'test', () => {
    // callbacks make sense only with pure js scrypt implementation (nodejs and browsers).
    // on RN scrypt is handled by native module and takes ~4 secs
    callbackWasCalled = true;
  });
  assert.ok(callbackWasCalled);

  assert.strictEqual(
    wif.encode(0x80, decryptedKey.privateKey, decryptedKey.compressed),
    '5KVNkLK4DuQqdmtATcQuja9N6Js5BF1gPoqmaHBhsnNx3fe7jG4',
  );

  let wasError = false;
  try {
    await bip38.decrypt(encryptedKey, 'a');
  } catch (_) {
    wasError = true;
  }

  assert.ok(wasError);
});
