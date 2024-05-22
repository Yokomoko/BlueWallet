import assert from 'assert';
import * as bitcoin from 'groestlcoinjs-lib';

import { SegwitBech32Wallet } from '../../class';

describe('Segwit P2SH wallet', () => {
  it('can create transaction', async () => {
    const wallet = new SegwitBech32Wallet();
    wallet.setSecret('L5UqjNxVgACUoDy2hf6gpJrmAyLwVVWvzchFHZ1dwePByBp3uQCt');
    assert.strictEqual(wallet.getAddress(), 'grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja');
    assert.deepStrictEqual(wallet.getAllExternalAddresses(), ['grs1qcvsk723ktcp3h7s4wscfdnq46xa30a4npjc8ja']);
    assert.strictEqual(await wallet.getChangeAddressAsync(), wallet.getAddress());

    const utxos = [
      {
        txid: '57d18bc076b919583ff074cfba6201edd577f7fe35f69147ea512e970f95ffeb',
        vout: 0,
        value: 100000,
      },
    ];

    let txNew = wallet.createTransaction(utxos, [{ value: 90000, address: 'FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs' }], 1, wallet.getAddress());
    let tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
    const satPerVbyte = txNew.fee / tx.virtualSize();
    assert.strictEqual(Math.round(satPerVbyte), 1);
    assert.strictEqual(
      txNew.tx.toHex(),
      '02000000000101ebff950f972e51ea4791f635fef777d5ed0162bacf74f03f5819b976c08bd1570000000000ffffffff02905f0100000000001976a914120ad7854152901ebeb269acb6cef20e71b3cf5988ac2e26000000000000160014c3216f2a365e031bfa15743096cc15d1bb17f6b30248304502210088050131efe80a0c6909ce9f5c13e05315fcf30cfd04d2db9697be96a824e564022079604e393cb075978c876fa03e9002fcb335c8c685bd8a676dfbd3d45e2340a9012102605dc850e6e4e50de76f6d0444ecadf881387f3e7116181bfd77ac082e79f83a00000000',
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

    // batch send + send max
    txNew = wallet.createTransaction(
      utxos,
      [{ address: 'FkgkYHzZ3LvfyBig7NQJkMacvfJsjgYFqk' }, { address: 'FYiGYdi8yNs2qumDZRmofFrU8btFyTuMXa', value: 10000 }],
      1,
      wallet.getAddress(),
    );
    tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
    assert.strictEqual(tx.ins.length, 1);
    assert.strictEqual(tx.outs.length, 2);
    assert.strictEqual('FkgkYHzZ3LvfyBig7NQJkMacvfJsjgYFqk', bitcoin.address.fromOutputScript(tx.outs[0].script)); // to address
    assert.strictEqual('FYiGYdi8yNs2qumDZRmofFrU8btFyTuMXa', bitcoin.address.fromOutputScript(tx.outs[1].script)); // to address
  });

  it('can sign and verify messages', async () => {
    const l = new SegwitBech32Wallet();
    l.setSecret('L4rK1yDtCWekvXuE6oXD9jCYfFNV2cWRpVuPLBcCU2z8TrnZQVUG'); // from groestlcoinjs-message examples

    const signature = l.signMessage('This is an example of a signed message.', l.getAddress());
    assert.strictEqual(signature, 'KOES8hMhdoZFP0QaMJXTExZPmrTneGfbDmJib7Jt3gTaN0CfsYjBLWRvnDtd9aKlTt8BXxV95PYFOYhdiM1x90w=');
    assert.strictEqual(l.verifyMessage('This is an example of a signed message.', l.getAddress(), signature), true);
  });
});
