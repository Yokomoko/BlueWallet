/* global it, describe */
import { SegwitP2SHWallet } from '../../class';
const bitcoin = require('groestlcoinjs-lib');
const assert = require('assert');

describe('Segwit P2SH wallet', () => {
  it('can create transaction', async () => {
    let wallet = new SegwitP2SHWallet();
    wallet.setSecret('KzZkF328XWmjWPoBbHa7EudptPjXEqMXJuu4CTef1LAEofSuFBRe');
    assert.strictEqual(wallet.getAddress(), '351nZtSWaDwMFxQo3xTAgsDc3QAJGCxPLj');
    assert.strictEqual(await wallet.getChangeAddressAsync(), wallet.getAddress());

    let utxos = [
      {
        txid: 'a56b44080cb606c0bd90e77fcd4fb34c863e68e5562e75b4386e611390eb860c',
        vout: 0,
        value: 300000,
      },
    ];

    let txNew = wallet.createTransaction(utxos, [{ value: 90000, address: 'FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs' }], 1, wallet.getAddress());
    let tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
    assert.strictEqual(
      txNew.tx.toHex(),
      '020000000001010c86eb9013616e38b4752e56e5683e864cb34fcd7fe790bdc006b60c08446ba50000000017160014f4436ffe8041cdf97b217aa1a0836e3bd5786b8affffffff02905f0100000000001976a914120ad7854152901ebeb269acb6cef20e71b3cf5988ac6f3303000000000017a914247521a8d1aa867aa2fd1d331e84174b2a4f77ee87024730440220625292fcf01c2d8ea1cfafd139b9d44229b9cddc0635650c5fe0afc38a579f6b02205b8cc23978c571e62a96c3cf0e64724bbfa51fb5863c5236d4cdf1dd1f58e0870121036a47812eec720bf18843458c374dc3561ffcd94b3dcd395c9105359c78b519ba00000000',
    );
    assert.strictEqual(tx.ins.length, 1);
    assert.strictEqual(tx.outs.length, 2);
    assert.strictEqual('FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs', bitcoin.address.fromOutputScript(tx.outs[0].script)); // to address
    assert.strictEqual(bitcoin.address.fromOutputScript(tx.outs[1].script), wallet.getAddress()); // change address

    // sendMax
    txNew = wallet.createTransaction(utxos, [{ address: 'FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs' }], 1, wallet.getAddress());
    tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
    assert.strictEqual(tx.ins.length, 1);
    assert.strictEqual(tx.outs.length, 1);
    assert.strictEqual('FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs', bitcoin.address.fromOutputScript(tx.outs[0].script)); // to address
  });
});
