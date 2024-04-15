import * as bitcoin from 'groestlcoinjs-lib';
import assert from 'assert';
import { SegwitP2SHWallet } from '../../class';

describe('Segwit P2SH wallet', () => {
  it('can create transaction', async () => {
    const wallet = new SegwitP2SHWallet();
    wallet.setSecret('L1PfnzGXgSH8gVXYs5RbdtGPDQsUobnEih7uHgWSYg9yR17WMBha');
    assert.strictEqual(wallet.getAddress(), '36CZdzjnFDvdsTvHLqu3Fq64DgTKYqaf4x');
    assert.deepStrictEqual(wallet.getAllExternalAddresses(), ['36CZdzjnFDvdsTvHLqu3Fq64DgTKYqaf4x']);
    assert.strictEqual(await wallet.getChangeAddressAsync(), wallet.getAddress());
    assert.strictEqual(await wallet.getAddressAsync(), wallet.getAddress());

    const utxos = [
      {
        txid: 'a56b44080cb606c0bd90e77fcd4fb34c863e68e5562e75b4386e611390eb860c',
        vout: 0,
        value: 300000,
      },
    ];

    let txNew = wallet.createTransaction(utxos, [{ value: 90000, address: 'FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs' }], 1, wallet.getAddress());
    let tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
    const satPerVbyte = txNew.fee / tx.virtualSize();
    assert.strictEqual(Math.round(satPerVbyte), 1);
    assert.strictEqual(
      txNew.tx.toHex(),
      '020000000001010c86eb9013616e38b4752e56e5683e864cb34fcd7fe790bdc006b60c08446ba5000000001716001417427bffe64537aaef0cf4b85f6c55dcf7a0abbfffffffff02905f0100000000001976a914120ad7854152901ebeb269acb6cef20e71b3cf5988ac6e3303000000000017a91431770a459888a2476846e01ac14ba22dc3d4c7d187024730440220713bd4143320baaf66cc511887fecb01b790cd55639233540c95a32e7a3b850502203a3945f759035ae7bceb35197158c962a44223000b9b1bd69b6edf18a9f3cdfa0121030dcb34c94f51df032a6f099a62108a375c34944fa4a38a7f275fba7223d4abac00000000',
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

  it('can sign and verify messages', async () => {
    const l = new SegwitP2SHWallet();
    l.setSecret('L4rK1yDtCWekvXuE6oXD9jCYfFNV2cWRpVuPLBcCU2z8TrnZQVUG'); // from groestlcoinjs-message examples

    const signature = l.signMessage('This is an example of a signed message.', l.getAddress());
    assert.strictEqual(signature, 'JOES8hMhdoZFP0QaMJXTExZPmrTneGfbDmJib7Jt3gTaN0CfsYjBLWRvnDtd9aKlTt8BXxV95PYFOYhdiM1x90w=');
    assert.strictEqual(l.verifyMessage('This is an example of a signed message.', l.getAddress(), signature), true);
  });
});
