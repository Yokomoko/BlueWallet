import assert from 'assert';
import bip38 from 'bip38grs';
import wif from 'wifgrs';

jest.setTimeout(180 * 1000);

it('bip38 decodes', async () => {
  const encryptedKey = '6PRVWUbkzq2VVjRuv58jpwVjTeN46MeNmzUHqUjQptBJUHGcBakduhrUNc';
  const decryptedKey = await bip38.decryptAsync(
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

// too slow, even on CI. unskip and manually run it if you need it
// eslint-disable-next-line jest/no-disabled-tests
it.skip('bip38 decodes slow', async () => {
  if (!(process.env.CI || process.env.TRAVIS)) {
    // run only on CI
    return;
  }

  const encryptedKey = '6PfL5SWsmnSdYwamdbjtgWPpyrzmTFZVFtP8Xwc1WmSNL53zmMjHgmN3es';
  let callbackWasCalled = false;
  const decryptedKey = await bip38.decryptAsync(encryptedKey, 'test', () => {
    // callbacks make sense only with pure js scrypt implementation (nodejs and browsers).
    // on RN scrypt is handled by native module and takes ~4 secs
    callbackWasCalled = true;
  });

  assert.ok(callbackWasCalled);

  assert.strictEqual(
    wif.encode(0x80, decryptedKey.privateKey, decryptedKey.compressed),
    '5KVNkLK4DuQqdmtATcQuja9N6Js5BF1gPoqmaHBhsnNx3fe7jG4',
  );

  await assert.rejects(async () => await bip38.decryptAsync(encryptedKey, 'a'), {
    message: 'Incorrect passphrase.',
  });
});
