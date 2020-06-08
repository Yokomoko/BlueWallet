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
    w.setSecret('3E2p6qP9vh4hFfuVQLsxTAziRDDHJ5DnQj');
    await w.fetchBalance();
    assert.ok(w.getBalance() > 16);
  });

  it.skip('can fetch tx', async () => {
    let w = new WatchOnlyWallet();
    w.setSecret('FXbmGth3JXKH3KpAsze62DJWXGFtAhpafc');
    await w.fetchTransactions();
    assert.ok(w.getTransactions().length >= 215, w.getTransactions().length);
    // should be 233 but electrum server cant return huge transactions >.<

    w = new WatchOnlyWallet();
    w.setSecret('Fie2GtRuNdoszcinPVKtMbkK9nVN3D82dt');
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 2);

    // fetch again and make sure no duplicates
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 2);
  });

  it('can fetch TXs with values', async () => {
    let w = new WatchOnlyWallet();
    for (let sec of [
      'grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja',
      'GRS1QCVSK723KTCP3H7S4WSCFDNQ46XA30A4NPJC8JA      ',
      'groestlcoin:grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja',
      'GROESTLCOIN:GRS1QCVSK723KTCP3H7S4WSCFDNQ46XA30A4NPJC8JA',
      'groestlcoin:GRS1QCVSK723KTCP3H7S4WSCFDNQ46XA30A4NPJC8JA',
      'GROESTLCOIN:grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja',
    ]) {
      w.setSecret(sec);
      assert.strictEqual(w.getAddress(), 'grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja');
      assert.strictEqual(await w.getAddressAsync(), 'grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja');
      assert.ok(w.weOwnAddress('grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja'));
      await w.fetchTransactions();

      for (let tx of w.getTransactions()) {
        assert.ok(tx.hash);
        assert.ok(tx.value);
        assert.ok(tx.received);
        assert.ok(tx.confirmations > 1);
      }

      assert.strictEqual(w.getTransactions()[0].value, -100000);
      assert.strictEqual(w.getTransactions()[1].value, 100000);
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

  it.skip('can fetch balance & transactions from zpub HD', async () => {
    let w = new WatchOnlyWallet();
    w.setSecret('zpub6r7jhKKm7BAVx3b3nSnuadY1WnshZYkhK8gKFoRLwK9rF3Mzv28BrGcCGA3ugGtawi1WLb2vyjQAX9ZTDGU5gNk2bLdTc3iEXr6tzR1ipNP');
    await w.fetchBalance();
    assert.strictEqual(w.getBalance(), 200000);
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 4);
    assert.ok((await w.getAddressAsync()).startsWith('bc1'));
  });
});
