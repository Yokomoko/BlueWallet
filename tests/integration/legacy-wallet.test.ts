import assert from 'assert';

import * as BlueElectrum from '../../blue_modules/BlueElectrum';
import { LegacyWallet, SegwitBech32Wallet, SegwitP2SHWallet } from '../../class';

jest.setTimeout(30 * 1000);

afterAll(async () => {
  // after all tests we close socket so the test suite can actually terminate
  BlueElectrum.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  await BlueElectrum.connectMain();
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

  it('can fetch balance', async () => {
    const w = new LegacyWallet();
    w._address = '3JEmL9KXWK3r6cmd2s4HDNWS61FSj4J3SD'; // hack internals
    assert.ok(w.weOwnAddress('3JEmL9KXWK3r6cmd2s4HDNWS61FSj4J3SD'));
    assert.ok(!w.weOwnAddress('aaa'));
    // @ts-ignore wrong type on purpose
    assert.ok(!w.weOwnAddress(false));
    assert.ok(w.getBalance() === 0);
    assert.ok(w.getUnconfirmedBalance() === 0);
    assert.ok(w._lastBalanceFetch === 0);
    await w.fetchBalance();
    assert.ok(w.getBalance() === 496360);
    assert.ok(w.getUnconfirmedBalance() === 0);
    assert.ok(w._lastBalanceFetch > 0);
  });

  it('can fetch TXs and derive UTXO from them', async () => {
    const w = new LegacyWallet();
    w._address = 'FhZ9dd8WhWRojpSs9cRDrGGqDn8HTyUtvL';
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 1);

    for (const tx of w.getTransactions()) {
      assert.ok(tx.hash);
      assert.ok(tx.value !== undefined);
      assert.ok(tx.received);
      assert.ok(tx.confirmations! > 1);
    }

    assert.ok(w.weOwnTransaction('88705d10a44842ec9e4fb4a74761d0314ec4bd8efce51e21f3cc529d4c740cad'));
    assert.ok(!w.weOwnTransaction('825c12f277d1f84911ac15ad1f41a3de28e9d906868a930b0a7bca61b17c8881'));

    assert.strictEqual(w.getUtxo().length, 1);

    for (const tx of w.getUtxo()) {
      assert.strictEqual(tx.txid, '88705d10a44842ec9e4fb4a74761d0314ec4bd8efce51e21f3cc529d4c740cad');
      assert.strictEqual(tx.vout, 0);
      assert.strictEqual(tx.address, 'FhZ9dd8WhWRojpSs9cRDrGGqDn8HTyUtvL');
      assert.strictEqual(tx.value, 12928680705699 );
      assert.ok(tx.confirmations! > 0);
    }
  });
/*
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
        assert.ok(tx.value !== undefined);
        assert.ok(tx.received);
        assert.ok(tx.confirmations! > 1);
      }
    },
    240000,
  );
  */

  it('can fetch UTXO', async () => {
    const w = new LegacyWallet();
    w._address = '39f9bbx46WGZoLU3CUxRXi8ibXMX9SpyKD';
    await w.fetchUtxo();
    assert.ok(w._utxo.length > 0, 'unexpected empty UTXO');
    assert.ok(w.getUtxo().length > 0, 'unexpected empty UTXO');

    assert.ok(w.getUtxo()[0].value);
    assert.ok(w.getUtxo()[0].vout === 0, JSON.stringify(w.getUtxo()[0]));
    assert.ok(w.getUtxo()[0].txid);
    assert.ok(w.getUtxo()[0].confirmations);
    assert.ok(w.getUtxo()[0].txhex);
  });
});

describe('SegwitP2SHWallet', function () {
  it('can generate segwit P2SH address from WIF', async () => {
    const l = new SegwitP2SHWallet();
    l.setSecret('Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHRsYUJ4');
    assert.ok(l.getAddress() === '34AgLJhwXrvmkZS1o5TrcdeevMt1ywshkh', 'expected ' + l.getAddress());
    assert.ok(l.getAddress() === (await l.getAddressAsync()));
    assert.ok(l.weOwnAddress('34AgLJhwXrvmkZS1o5TrcdeevMt1ywshkh'));
    assert.ok(!l.weOwnAddress('garbage'));
    // @ts-ignore wrong type on purpose
    assert.ok(!l.weOwnAddress(false));
  });
});

describe('SegwitBech32Wallet', function () {
  it('can fetch balance', async () => {
    const w = new SegwitBech32Wallet();
    w._address = 'grs1qphjsj69a65q9uv6ehp65hr84zjtffvw9630pcx';
    assert.ok(w.weOwnAddress('grs1qphjsj69a65q9uv6ehp65hr84zjtffvw9630pcx'));
    assert.ok(w.weOwnAddress('GRS1QPHJSJ69A65Q9UV6EHP65HR84ZJTFFVW9630PCX'));
    assert.ok(!w.weOwnAddress('garbage'));
    // @ts-ignore wrong type on purpose
    assert.ok(!w.weOwnAddress(false));
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

  it('can fetch TXs LegacyWallet', async () => {
    const w = new LegacyWallet();
    w._address = 'grs1qvsf5qwd5xpgftfndc7yncr9ydjer47cvxacd9y';
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 2);

    for (const tx of w.getTransactions()) {
      assert.ok(tx.hash);
      assert.ok(tx.value !== undefined);
      assert.ok(tx.received);
      assert.ok(tx.confirmations! > 1);
    }

    assert.strictEqual(w.getTransactions()[0].value, -178650);
    assert.strictEqual(w.getTransactions()[1].value, 178650);
  });

  it('can fetch TXs SegwitBech32Wallet', async () => {
    const w = new SegwitBech32Wallet();
    w._address = 'grs1q0h03f6hw65yll5a7lnmu6atpdplw7y34752g80';
    assert.ok(w.weOwnAddress('grs1q0h03f6hw65yll5a7lnmu6atpdplw7y34752g80'));
    assert.ok(w.weOwnAddress('GRS1Q0H03F6HW65YLL5A7LNMU6ATPDPLW7Y34752G80'));
    assert.ok(!w.weOwnAddress('garbage'));
    // @ts-ignore wrong type on purpose
    assert.ok(!w.weOwnAddress(false));
    await w.fetchTransactions();
    assert.strictEqual(w.getTransactions().length, 1);
    const tx = w.getTransactions()[1];
    assert.ok(tx.hash);
    assert.strictEqual(tx.value, 0.00189120);
    assert.ok(tx.received);
    assert.ok(tx.confirmations! > 1);

    const tx0 = w.getTransactions()[0];
    assert.ok(tx0.inputs);
    assert.ok(tx0.inputs.length === 1);
    assert.ok(tx0.outputs);
    assert.ok(tx0.outputs.length === 2);

    assert.ok(w.weOwnTransaction('5a77d2cd3d661aa02179310cf8965a23c106c3866c706e3fe49389671f1e2d25'));
    assert.ok(!w.weOwnTransaction('825c12f277d1f84911ac15ad1f41a3de28e9d906868a930b0a7bca61b17c8881'));
  });
});
