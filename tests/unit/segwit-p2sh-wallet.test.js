/* global it, describe */
import { SegwitP2SHWallet } from '../../class';
const bitcoin = require('groestlcoinjs-lib');
const assert = require('assert');

describe('Segwit P2SH wallet', () => {
  it('can create transaction', async () => {
    let wallet = new SegwitP2SHWallet();
    wallet.setSecret('L1PfnzGXgSH8gVXYs5RbdtGPDQsUobnEih7uHgWSYg9yR17WMBha');
    assert.strictEqual(wallet.getAddress(), '36CZdzjnFDvdsTvHLqu3Fq64DgTKYqaf4x');
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
      '020000000001010c86eb9013616e38b4752e56e5683e864cb34fcd7fe790bdc006b60c08446ba5000000001716001417427bffe64537aaef0cf4b85f6c55dcf7a0abbfffffffff02905f0100000000001976a914120ad7854152901ebeb269acb6cef20e71b3cf5988ac6f3303000000000017a91431770a459888a2476846e01ac14ba22dc3d4c7d1870247304402204c9396faa5214c985da151c91341a2b57990b925903afbe2088b98d94adffcce0220740ef48f415e8f2f08f9e20d000e94bd7902d7d93496d362bebd59f74e8cc2a50121030dcb34c94f51df032a6f099a62108a375c34944fa4a38a7f275fba7223d4abac00000000',
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
