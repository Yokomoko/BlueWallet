import assert from 'assert';

import * as BlueElectrum from '../../blue_modules/BlueElectrum';
import { WatchOnlyWallet } from '../../class';

jest.setTimeout(500 * 1000);

afterAll(async () => {
  // after all tests we close socket so the test suite can actually terminate
  BlueElectrum.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  await BlueElectrum.connectMain();
});

describe('Watch only wallet', () => {
  it('can fetch balance', async () => {
    const w = new WatchOnlyWallet();
    w.setSecret('3E2p6qP9vh4hFfuVQLsxTAziRDDHJ5DnQj');
    await w.fetchBalance();
    assert.ok(w.getBalance() > 16);
  });

  it.skip('can fetch tx', async () => {
    let w = new WatchOnlyWallet();
    w.setSecret('FXbmGth3JXKH3KpAsze62DJWXGFtAhpafc');
    await w.fetchTransactions();
    assert.ok(w.getTransactions().length >= 215, w.getTransactions().length);
    // should be 233 but electrum-grs server cant return huge transactions >.<

    w = new WatchOnlyWallet();
    w.setSecret('Fie2GtRuNdoszcinPVKtMbkK9nVN3D82dt');
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 2);

    // fetch again and make sure no duplicates
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 2);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('can fetch tx from huge wallet', async () => {
    const w = new WatchOnlyWallet();
    w.setSecret('1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s'); // binance wallet
    await w.fetchTransactions();
    assert.ok(w.getTransactions().length === 0, w.getTransactions().length); // not yet kek but at least we dont crash
  });

  it('can fetch TXs with values', async () => {
    const w = new WatchOnlyWallet();
    for (const sec of [
      'grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja',
      'GRS1QCVSK723KTCP3H7S4WSCFDNQ46XA30A4NPJC8JA',
      'groestlcoin:grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja',
      'GROESTLCOIN:GRS1QCVSK723KTCP3H7S4WSCFDNQ46XA30A4NPJC8JA',
      'groestlcoin:GRS1QCVSK723KTCP3H7S4WSCFDNQ46XA30A4NPJC8JA',
      'GROESTLCOIN:grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja',
    ]) {
      w.setSecret(sec);
      assert.strictEqual(w.getAddress(), 'grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja');
      assert.strictEqual(await w.getAddressAsync(), 'grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja');
      assert.ok(w.weOwnAddress('grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja'));
      assert.ok(w.weOwnAddress('GRS1QCVSK723KTCP3H7S4WSCFDNQ46XA30A4NPJC8JA'));
      assert.ok(!w.weOwnAddress('garbage'));
      assert.ok(!w.weOwnAddress(false));
      await w.fetchTransactions();

      for (const tx of w.getTransactions()) {
        assert.ok(tx.hash);
        assert.ok(tx.value !== undefined);
        assert.ok(tx.received);
        assert.ok(tx.confirmations > 1);
      }

      assert.strictEqual(w.getTransactions()[0].value, -100000);
      assert.strictEqual(w.getTransactions()[1].outputs[0].value, 0.00100000);
    }
  });

  it('can fetch complex TXs', async () => {
    const w = new WatchOnlyWallet();
    w.setSecret('3NLnALo49CFEF4tCRhCvz45ySSfz2hjD7w');
    await w.fetchTransactions();
    for (const tx of w.getTransactions()) {
      assert.ok(tx.value, 'incorrect tx.value');
    }
  });

  it.skip('can fetch balance & transactions from zpub HD', async () => {
    const w = new WatchOnlyWallet();
    w.setSecret('zpub6r7jhKKm7BAVx3b3nSnuadY1WnshZYkhK8gKFoRLwK9rF3Mzv28BrGcCGA3ugGtawi1WLb2vyjQAX9ZTDGU5gNk2bLdTc3iEXr6tzR1ipNP');
    await w.fetchBalance();
    assert.strictEqual(w.getBalance(), 200000);
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 4);
    const nextAddress = await w.getAddressAsync();

    assert.strictEqual(w.getNextFreeAddressIndex(), 2);
    assert.strictEqual(nextAddress, 'grs1q6442dedpwvqldldnsyux3cuz27paqks0uckh4g');
    assert.strictEqual(nextAddress, w._getExternalAddressByIndex(w.getNextFreeAddressIndex()));

    const nextChangeAddress = await w.getChangeAddressAsync();
    assert.strictEqual(nextChangeAddress, 'grs1qgltdyjnertcyvdn9hlkfpgr6hc260rjrdpfy99');
  });

  // skipped because its generally rare case
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('can fetch txs for address funded by genesis txs', async () => {
    const w = new WatchOnlyWallet();
    w.setSecret('37jKPSmbEGwgfacCr2nayn1wTaqMAbA94Z');
    await w.fetchBalance();
    await w.fetchTransactions();
    assert.ok(w.getTransactions().length >= 138);
  });
});
