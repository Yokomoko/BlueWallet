/* global it, describe */
import { SegwitBech32Wallet } from '../../class';
const bitcoin = require('groestlcoinjs-lib');
const assert = require('assert');

describe('Segwit P2SH wallet', () => {
  it('can create transaction', async () => {
    let wallet = new SegwitBech32Wallet();
    wallet.setSecret('L5UqjNxVgACUoDy2hf6gpJrmAyLwVVWvzchFHZ1dwePByBp3uQCt');
    assert.strictEqual(wallet.getAddress(), 'grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja');
    assert.strictEqual(await wallet.getChangeAddressAsync(), wallet.getAddress());

    let utxos = [
      {
        txid: '57d18bc076b919583ff074cfba6201edd577f7fe35f69147ea512e970f95ffeb',
        vout: 0,
        value: 100000,
      },
    ];

    let txNew = wallet.createTransaction(utxos, [{ value: 90000, address: 'FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs' }], 1, wallet.getAddress());
    let tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
    assert.strictEqual(
      txNew.tx.toHex(),
      '02000000000101ebff950f972e51ea4791f635fef777d5ed0162bacf74f03f5819b976c08bd1570000000000ffffffff02905f0100000000001976a914120ad7854152901ebeb269acb6cef20e71b3cf5988ac2f26000000000000160014c3216f2a365e031bfa15743096cc15d1bb17f6b30247304402202e6126de23374685f0fb2a2be62b629ced64151e85895eb5c5dc903dfa42827102206e2fcd97a5a58f574f27d6c68993ceea1d6450b54ab5cb4f9deacfe0e1380f56012102605dc850e6e4e50de76f6d0444ecadf881387f3e7116181bfd77ac082e79f83a00000000',
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
