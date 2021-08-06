/* global describe, it, jasmine, afterAll, beforeAll */
import { LegacyWallet, SegwitP2SHWallet, SegwitBech32Wallet } from '../../class';
const assert = require('assert');
global.net = require('net'); // needed by Electrum client. For RN it is proviced in shim.js
global.tls = require('tls'); // needed by Electrum client. For RN it is proviced in shim.js
const BlueElectrum = require('../../blue_modules/BlueElectrum'); // so it connects ASAP

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

afterAll(async () => {
  // after all tests we close socket so the test suite can actually terminate
  BlueElectrum.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  await BlueElectrum.waitTillConnected();
});

describe('LegacyWallet', function () {
  it('can serialize and unserialize correctly', () => {
    const a = new LegacyWallet();
    a.setLabel('my1');
    const key = JSON.stringify(a);

    const b = LegacyWallet.fromJson(key);
    assert.strictEqual(b.type, LegacyWallet.type);
    assert.strictEqual(key, JSON.stringify(b));
  });

  it('can validate addresses', () => {
    const w = new LegacyWallet();
    assert.ok(w.isAddressValid('FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs'));
    assert.ok(!w.isAddressValid('12eQ9m4sgAwTSQoNXkRABKhCXCsjm2j'));
    assert.ok(w.isAddressValid('34xp4vRoCGJym3xR7yCVPFHoCNxv7bXcAo'));
    assert.ok(!w.isAddressValid('3BDsBDxDimYgNZzsqszNZobqQq3yeUo'));
    assert.ok(!w.isAddressValid('12345'));
    assert.ok(w.isAddressValid('grs1q44n355j5aatyz78kj5e2es7rdpq690yzlwxlqx'));
    assert.ok(w.isAddressValid('GRS1QLE4ZLJDMPT77DTC98WHYZ90MSAMWJJE8U6D6K5'));
  });

  it('can fetch balance', async () => {
    const w = new LegacyWallet();
    w._address = '3JEmL9KXWK3r6cmd2s4HDNWS61FSj4J3SD'; // hack internals
    assert.ok(w.weOwnAddress('3JEmL9KXWK3r6cmd2s4HDNWS61FSj4J3SD'));
    assert.ok(!w.weOwnAddress('aaa'));
    assert.ok(w.getBalance() === 0);
    assert.ok(w.getUnconfirmedBalance() === 0);
    assert.ok(w._lastBalanceFetch === 0);
    await w.fetchBalance();
    assert.ok(w.getBalance() === 496360);
    assert.ok(w.getUnconfirmedBalance() === 0);
    assert.ok(w._lastBalanceFetch > 0);
  });

  it('can fetch TXs', async () => {
    const w = new LegacyWallet();
    w._address = 'FZi9qkpK2KdxUQ1x6T1vbn8jjSgsZazgo8';
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 2);

    for (const tx of w.getTransactions()) {
      assert.ok(tx.hash);
      assert.ok(tx.value);
      assert.ok(tx.received);
      assert.ok(tx.confirmations > 1);
    }

    assert.ok(w.weOwnTransaction('4924f3a29acdee007ebcf6084d2c9e1752c4eb7f26f7d1a06ef808780bf5fe6d'));
    assert.ok(w.weOwnTransaction('d0432027a86119c63a0be8fa453275c2333b59067f1e559389cd3e0e377c8b96'));
    assert.ok(!w.weOwnTransaction('825c12f277d1f84911ac15ad1f41a3de28e9d906868a930b0a7bca61b17c8881'));
  });

  it.each([
    // Transaction with missing address output https://www.blockchain.com/btc/tx/d45818ae11a584357f7b74da26012d2becf4ef064db015a45bdfcd9cb438929d
    ['addresses for vout missing', 'FbThBimw1krwL3QWf6XEk2Xen6NigyzGBT'],
    // ['txdatas were coming back null from BlueElectrum because of high batchsize', '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo'],
    // skipped because its slow and flaky if being run in pack with other electrum tests. uncomment and run single
    // if you need to debug huge electrum batches
  ])(
    'can fetch TXs when %s',
    async (useCase, address) => {
      const w = new LegacyWallet();
      w._address = address;
      await w.fetchTransactions();

      assert.ok(w.getTransactions().length > 0);
      for (const tx of w.getTransactions()) {
        assert.ok(tx.hash);
        assert.ok(tx.value);
        assert.ok(tx.received);
        assert.ok(tx.confirmations > 1);
      }
    },
    240000,
  );

  it('can fetch UTXO', async () => {
    const w = new LegacyWallet();
    w._address = '39f9bbx46WGZoLU3CUxRXi8ibXMX9SpyKD';
    await w.fetchUtxo();
    assert.ok(w.utxo.length > 0, 'unexpected empty UTXO');
    assert.ok(w.getUtxo().length > 0, 'unexpected empty UTXO');

    assert.ok(w.getUtxo()[0].value);
    assert.ok(w.getUtxo()[0].vout === 1, JSON.stringify(w.getUtxo()[0]));
    assert.ok(w.getUtxo()[0].txid);
    assert.ok(w.getUtxo()[0].confirmations);
  });
});

describe('SegwitP2SHWallet', function () {
  it('can generate segwit P2SH address from WIF', async () => {
    const l = new SegwitP2SHWallet();
    l.setSecret('Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHRsYUJ4');
    assert.ok(l.getAddress() === '34AgLJhwXrvmkZS1o5TrcdeevMt1ywshkh', 'expected ' + l.getAddress());
    assert.ok(l.getAddress() === (await l.getAddressAsync()));
    assert.ok(l.weOwnAddress('34AgLJhwXrvmkZS1o5TrcdeevMt1ywshkh'));
  });
});

describe('SegwitBech32Wallet', function () {
  it('can fetch balance', async () => {
    const w = new SegwitBech32Wallet();
    w._address = 'grs1qphjsj69a65q9uv6ehp65hr84zjtffvw9630pcx';
    assert.ok(w.weOwnAddress('grs1qphjsj69a65q9uv6ehp65hr84zjtffvw9630pcx'));
    await w.fetchBalance();
    assert.strictEqual(w.getBalance(), 0);
  });

  it('can fetch UTXO', async () => {
    const w = new SegwitBech32Wallet();
    w._address = 'grs1q44n355j5aatyz78kj5e2es7rdpq690yzlwxlqx';
    await w.fetchUtxo();
    const l1 = w.getUtxo().length;
    assert.ok(w.getUtxo().length > 0, 'unexpected empty UTXO');

    assert.ok(w.getUtxo()[0].value);
    assert.ok(w.getUtxo()[0].vout === 0);
    assert.ok(w.getUtxo()[0].txid);
    assert.ok(w.getUtxo()[0].confirmations, JSON.stringify(w.getUtxo()[0], null, 2));
    // double fetch shouldnt duplicate UTXOs:
    await w.fetchUtxo();
    const l2 = w.getUtxo().length;
    assert.strictEqual(l1, l2);
  });

  it('can fetch TXs', async () => {
    const w = new LegacyWallet();
    w._address = 'grs1qvsf5qwd5xpgftfndc7yncr9ydjer47cvxacd9y';
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 2);

    for (const tx of w.getTransactions()) {
      assert.ok(tx.hash);
      assert.ok(tx.value);
      assert.ok(tx.received);
      assert.ok(tx.confirmations > 1);
    }

    assert.strictEqual(w.getTransactions()[0].value, -178650);
    assert.strictEqual(w.getTransactions()[1].value, 178650);
  });

  it('can fetch TXs', async () => {
    const w = new LegacyWallet();
    w._address = 'grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj';
    assert.ok(w.weOwnAddress('grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj'));
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 1);

    for (const tx of w.getTransactions()) {
      assert.ok(tx.hash);
      assert.strictEqual(tx.value, 496220);
      assert.ok(tx.received);
      assert.ok(tx.confirmations > 1);
    }

    const tx0 = w.getTransactions()[0];
    assert.ok(tx0.inputs);
    assert.ok(tx0.inputs.length === 1);
    assert.ok(tx0.outputs);
    assert.ok(tx0.outputs.length === 1);

    assert.ok(w.weOwnTransaction('49944e90fe917952e36b1967cdbc1139e60c89b4800b91258bf2345a77a8b888'));
    assert.ok(!w.weOwnTransaction('825c12f277d1f84911ac15ad1f41a3de28e9d906868a930b0a7bca61b17c8881'));
  });
});
