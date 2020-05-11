/* global it, describe, jasmine, afterAll, beforeAll  */
import { WatchOnlyWallet } from '../../class';
let assert = require('assert');
global.net = require('net'); // needed by Electrum client. For RN it is proviced in shim.js
global.tls = require('tls'); // needed by Electrum client. For RN it is proviced in shim.js
let BlueElectrum = require('../../BlueElectrum'); // so it connects ASAP

afterAll(async () => {
  // after all tests we close socket so the test suite can actually terminate
  BlueElectrum.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  await BlueElectrum.waitTillConnected();
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 500 * 1000;

describe('Watch only wallet', () => {
  it('can fetch balance', async () => {
    let w = new WatchOnlyWallet();
    w.setSecret('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    await w.fetchBalance();
    assert.ok(w.getBalance() > 16);
  });

  it('can fetch tx', async () => {
    let w = new WatchOnlyWallet();
    w.setSecret('167zK5iZrs1U6piDqubD3FjRqUTM2CZnb8');
    await w.fetchTransactions();
    assert.ok(w.getTransactions().length >= 215, w.getTransactions().length);
    // should be 233 but electrum server cant return huge transactions >.<

    w = new WatchOnlyWallet();
    w.setSecret('1BiJW1jyUaxcJp2JWwbPLPzB1toPNWTFJV');
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 2);

    // fetch again and make sure no duplicates
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 2);
  });

  it('can fetch TXs with values', async () => {
    let w = new WatchOnlyWallet();
    for (let sec of [
      'grs1quhnve8q4tk3unhmjts7ymxv8cd6w9xv8n4ky9d',
      'GRS1QUHNVE8Q4TK3UNHMJTS7YMXV8CD6W9XV8N4KY9D',
      'groestlcoin:grs1quhnve8q4tk3unhmjts7ymxv8cd6w9xv8n4ky9d',
      'GROESTLCOIN:GRS1QUHNVE8Q4TK3UNHMJTS7YMXV8CD6W9XV8N4KY9D',
      'groestlcoin:GRS1QUHNVE8Q4TK3UNHMJTS7YMXV8CD6W9XV8N4KY9D',
      'GROESTLCOIN:grs1quhnve8q4tk3unhmjts7ymxv8cd6w9xv8n4ky9d',
    ]) {
      w.setSecret(sec);
      assert.strictEqual(w.getAddress(), 'grs1quhnve8q4tk3unhmjts7ymxv8cd6w9xv8n4ky9d');
      assert.strictEqual(await w.getAddressAsync(), 'grs1quhnve8q4tk3unhmjts7ymxv8cd6w9xv8n4ky9d');
      assert.ok(w.weOwnAddress('grs1quhnve8q4tk3unhmjts7ymxv8cd6w9xv8n4ky9d'));
      await w.fetchTransactions();

      for (let tx of w.getTransactions()) {
        assert.ok(tx.hash);
        assert.ok(tx.value);
        assert.ok(tx.received);
        assert.ok(tx.confirmations > 1);
      }

      assert.strictEqual(w.getTransactions()[0].value, -892111);
      assert.strictEqual(w.getTransactions()[1].value, 892111);
    }
  });

  it('can fetch complex TXs', async () => {
    let w = new WatchOnlyWallet();
    w.setSecret('3NLnALo49CFEF4tCRhCvz45ySSfz2hjD7w');
    await w.fetchTransactions();
    for (let tx of w.getTransactions()) {
      assert.ok(tx.value, 'incorrect tx.value');
    }
  });

  it('can fetch balance & transactions from zpub HD', async () => {
    let w = new WatchOnlyWallet();
    w.setSecret('zpub6r7jhKKm7BAVx3b3nSnuadY1WnshZYkhK8gKFoRLwK9rF3Mzv28BrGcCGA3ugGtawi1WLb2vyjQAX9ZTDGU5gNk2bLdTc3iEXr6tzR1ipNP');
    await w.fetchBalance();
    assert.strictEqual(w.getBalance(), 200000);
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 4);
    assert.ok((await w.getAddressAsync()).startsWith('bc1'));
  });
});
