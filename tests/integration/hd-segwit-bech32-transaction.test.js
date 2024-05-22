import assert from 'assert';
import * as bitcoin from 'groestlcoinjs-lib';

import * as BlueElectrum from '../../blue_modules/BlueElectrum';
import { HDSegwitBech32Transaction, HDSegwitBech32Wallet, SegwitBech32Wallet, SegwitP2SHWallet } from '../../class';

jest.setTimeout(150 * 1000);

afterAll(async () => {
  // after all tests we close socket so the test suite can actually terminate
  BlueElectrum.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  await BlueElectrum.connectMain();
});

let _cachedHdWallet = false;

/**
 * @returns {Promise<HDSegwitBech32Wallet>}
 * @private
 */
async function _getHdWallet() {
  if (_cachedHdWallet) return _cachedHdWallet;
  _cachedHdWallet = new HDSegwitBech32Wallet();
  _cachedHdWallet.setSecret(process.env.HD_MNEMONIC_BIP84);
  await _cachedHdWallet.fetchBalance();
  await _cachedHdWallet.fetchTransactions();
  return _cachedHdWallet;
}

describe('HDSegwitBech32Transaction', () => {
  it('can decode & check sequence', async function () {
    let T = new HDSegwitBech32Transaction(null, '7fc65dc0c1134d5e704947c2fd75c4a7df450153a1063f3e7846409fd053cdef');
    assert.strictEqual(await T.getMaxUsedSequence(), 0xfffffffe);
    assert.strictEqual(await T.isSequenceReplaceable(), true);

    // 881c54edd95cbdd1583d6b9148eb35128a47b64a2e67a5368a649d6be960f08e
    T = new HDSegwitBech32Transaction(
      '020000000001016f3d295f9f7b34a60daed79b328b787619f0057e10641830afb89f22890da7bc0000000000feffffff0226fa25010000000016001468dbccf9102b9bc1fa11855dbfc40bf9d616bfbba08601000000000022002076330e00e9d04d7708cae57d01f818e6ff4e068b4873c474defaaac705be23060247304402203e5599d40b564bb57db60d3997f6f797167eb05d69a1cf702d8e0be7eb243b7a022061c6c13a1266b55efcd2b09ce445333852a247ce6127ec4ad25d93aa8b1a18070121039f9616e13a10d7d9de4d6fb0ee41d08e39c56695c473dbb86dfff1388a3d441a00000000',
    );
    assert.strictEqual(await T.getMaxUsedSequence(), 0xfffffffe);
    assert.strictEqual(await T.isSequenceReplaceable(), true);

    assert.ok((await T.getRemoteConfirmationsNum()) >= 292);
  });

  it('can tell if its our transaction', async function () {
    if (!process.env.HD_MNEMONIC_BIP84) {
      console.error('process.env.HD_MNEMONIC_BIP84 not set, skipped');
      return;
    }

    const hd = await _getHdWallet();

    let tt = new HDSegwitBech32Transaction(null, '881c54edd95cbdd1583d6b9148eb35128a47b64a2e67a5368a649d6be960f08e', hd);

    assert.ok(await tt.isOurTransaction());

    tt = new HDSegwitBech32Transaction(null, '89bcff166c39b3831e03257d4bcc1034dd52c18af46a3eb459e72e692a88a2d8', hd);

    assert.ok(!(await tt.isOurTransaction()));
  });

  it('can tell tx info', async function () {
    if (!process.env.HD_MNEMONIC_BIP84) {
      console.error('process.env.HD_MNEMONIC_BIP84 not set, skipped');
      return;
    }

    const hd = await _getHdWallet();

    const tt = new HDSegwitBech32Transaction(null, '881c54edd95cbdd1583d6b9148eb35128a47b64a2e67a5368a649d6be960f08e', hd);

    const { fee, feeRate, targets, changeAmount, utxos } = await tt.getInfo();
    assert.strictEqual(fee, 4464);
    assert.strictEqual(changeAmount, 103686);
    assert.strictEqual(feeRate, 21);
    assert.strictEqual(targets.length, 1);
    assert.strictEqual(targets[0].value, 200000);
    assert.strictEqual(targets[0].address, '3NLnALo49CFEF4tCRhCvz45ySSfz2hjD7w');
    assert.strictEqual(
      JSON.stringify(utxos),
      JSON.stringify([
        {
          vout: 1,
          value: 108150,
          txid: 'f3d7fb23248168c977e8085b6bd5381d73c85da423056a47cbf734b5665615f1',
          address: 'grs1qahhgjtxexjx9t0e5pjzqwtjnxexzl6f5an38hq',
        },
        {
          vout: 0,
          value: 200000,
          txid: '89bcff166c39b3831e03257d4bcc1034dd52c18af46a3eb459e72e692a88a2d8',
          address: 'grs1qvh44cwd2v7zld8ef9ld5rs5zafmejuslp6yd73',
        },
      ]),
    );
  });

  it('can do RBF - cancel tx', async function () {
    if (!process.env.HD_MNEMONIC_BIP84) {
      console.error('process.env.HD_MNEMONIC_BIP84 not set, skipped');
      return;
    }

    const hd = await _getHdWallet();

    const tt = new HDSegwitBech32Transaction(null, '881c54edd95cbdd1583d6b9148eb35128a47b64a2e67a5368a649d6be960f08e', hd);

    assert.strictEqual(await tt.canCancelTx(), true);

    const { tx } = await tt.createRBFcancelTx(25);

    const createdTx = bitcoin.Transaction.fromHex(tx.toHex());
    assert.strictEqual(createdTx.ins.length, 2);
    assert.strictEqual(createdTx.outs.length, 1);
    const addr = SegwitBech32Wallet.scriptPubKeyToAddress(createdTx.outs[0].script);
    assert.ok(hd.weOwnAddress(addr));

    const actualFeerate = (108150 + 200000 - createdTx.outs[0].value) / tx.virtualSize();
    assert.strictEqual(Math.round(actualFeerate), 25);

    const tt2 = new HDSegwitBech32Transaction(tx.toHex(), null, hd);
    assert.strictEqual(await tt2.canCancelTx(), false); // newly created cancel tx is not cancellable anymore
  });

  it('can do RBF - bumpfees tx', async function () {
    if (!process.env.HD_MNEMONIC_BIP84) {
      console.error('process.env.HD_MNEMONIC_BIP84 not set, skipped');
      return;
    }

    const hd = await _getHdWallet();

    const tt = new HDSegwitBech32Transaction(null, '881c54edd95cbdd1583d6b9148eb35128a47b64a2e67a5368a649d6be960f08e', hd);

    assert.strictEqual(await tt.canCancelTx(), true);
    assert.strictEqual(await tt.canBumpTx(), true);

    const { tx } = await tt.createRBFbumpFee(27);

    const createdTx = bitcoin.Transaction.fromHex(tx.toHex());
    assert.strictEqual(createdTx.ins.length, 2);
    assert.strictEqual(createdTx.outs.length, 2);
    const addr0 = SegwitP2SHWallet.scriptPubKeyToAddress(createdTx.outs[0].script);
    assert.ok(!hd.weOwnAddress(addr0));
    assert.strictEqual(addr0, '3NLnALo49CFEF4tCRhCvz45ySSfz2hjD7w'); // dest address
    const addr1 = SegwitBech32Wallet.scriptPubKeyToAddress(createdTx.outs[1].script);
    assert.ok(hd.weOwnAddress(addr1));

    const actualFeerate = (108150 + 200000 - (createdTx.outs[0].value + createdTx.outs[1].value)) / tx.virtualSize();
    assert.strictEqual(Math.round(actualFeerate), 28);

    const tt2 = new HDSegwitBech32Transaction(tx.toHex(), null, hd);
    assert.strictEqual(await tt2.canCancelTx(), true); // new tx is still cancellable since we only bumped fees
  });

  it('can do CPFP - bump fees', async function () {
    if (!process.env.HD_MNEMONIC_BIP84) {
      console.error('process.env.HD_MNEMONIC_BIP84 not set, skipped');
      return;
    }

    const hd = await _getHdWallet();

    const tt = new HDSegwitBech32Transaction(null, '2ec8a1d0686dcccffc102ba5453a28d99c8a1e5061c27b41f5c0a23b0b27e75f', hd);
    assert.ok(await tt.isToUsTransaction());
    const { unconfirmedUtxos, fee: oldFee } = await tt.getInfo();

    assert.strictEqual(
      JSON.stringify(unconfirmedUtxos),
      JSON.stringify([
        {
          vout: 0,
          value: 200000,
          txid: '2ec8a1d0686dcccffc102ba5453a28d99c8a1e5061c27b41f5c0a23b0b27e75f',
          address: 'grs1qvlmgrq0gtatanmas0tswrsknllvupq2g844ss2',
        },
      ]),
    );

    const { tx, fee } = await tt.createCPFPbumpFee(20);
    const avgFeeRate = (oldFee + fee) / (tt._txDecoded.virtualSize() + tx.virtualSize());
    assert.ok(Math.round(avgFeeRate) >= 20);
  });
});
