import assert from 'assert';
import * as bitcoin from 'groestlcoinjs-lib';

import { HDSegwitBech32Wallet } from '../../class';

describe('Bech32 Segwit HD (BIP84)', () => {
  it('can create', async function () {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const hd = new HDSegwitBech32Wallet();
    hd.setSecret(mnemonic);

    assert.strictEqual(true, hd.validateMnemonic());
    assert.strictEqual(
      'zpub6qdhcNVVLJ2t8kLzGLzeaiJv7EahaRBsXmu1yVPyXHvMdFmS4d7JSi5aS6mc1oz5k6DZN781Ffn3GAs3r2FJnCPSw5nti63s3c9EDg2u7MS',
      hd.getXpub(),
    );

    assert.strictEqual(hd._getExternalWIFByIndex(0), 'L4mSsRa7DVFMez7MxcL9cV5ZxeKdMJpJmqJtdcGDz9oJM6sQsNz2');
    assert.strictEqual(hd._getExternalWIFByIndex(1), 'KygxBG82bZ2SrkhaFMLRYPUMLiGmjBANxg7vDCBNVqFhmveTZKWr');
    assert.strictEqual(hd._getInternalWIFByIndex(0), 'L3UPrg3xRSrVm3iHEEVLsyuXK54XJSJ9yZBzyEtrB1HNzAwnarPr');
    assert.ok(hd._getInternalWIFByIndex(0) !== hd._getInternalWIFByIndex(1));

    assert.strictEqual(hd._getExternalAddressByIndex(0), 'grs1qrm2uggqj846nljryvmuga56vtwfey0dtnc4z55');
    assert.strictEqual(hd._getExternalAddressByIndex(1), 'grs1qy2vlj0w9kp408mg74trj9s08azhzschw5ayp2g');
    assert.strictEqual(hd._getInternalAddressByIndex(0), 'grs1q4v3e7r759yegjtcwrevg5spe5vfvwkhhwz2zca');
    assert.ok(hd._getInternalAddressByIndex(0) !== hd._getInternalAddressByIndex(1));

    assert.ok(hd.getAllExternalAddresses().includes('grs1qrm2uggqj846nljryvmuga56vtwfey0dtnc4z55'));
    assert.ok(hd.getAllExternalAddresses().includes('grs1qy2vlj0w9kp408mg74trj9s08azhzschw5ayp2g'));
    assert.ok(!hd.getAllExternalAddresses().includes('grs1q4v3e7r759yegjtcwrevg5spe5vfvwkhhwz2zca')); // not internal

    assert.ok(hd.addressIsChange('grs1q4v3e7r759yegjtcwrevg5spe5vfvwkhhwz2zca'));
    assert.ok(!hd.addressIsChange('grs1qrm2uggqj846nljryvmuga56vtwfey0dtnc4z55'));

    assert.strictEqual(
      hd._getPubkeyByAddress(hd._getExternalAddressByIndex(0)).toString('hex'),
      '02b61ee53e24da178693ef0e7bdf34a250094deb2ec9dbd80b080d7242e54df383',
    );
    assert.strictEqual(
      hd._getPubkeyByAddress(hd._getInternalAddressByIndex(0)).toString('hex'),
      '02af1f15ed1969b0de88bb7858b6f0e3a12440f80534e21ee2422c81d644728650',
    );

    assert.strictEqual(hd._getDerivationPathByAddress(hd._getExternalAddressByIndex(0)), "m/84'/17'/0'/0/0");
    assert.strictEqual(hd._getDerivationPathByAddress(hd._getExternalAddressByIndex(1)), "m/84'/17'/0'/0/1");
    assert.strictEqual(hd._getDerivationPathByAddress(hd._getInternalAddressByIndex(0)), "m/84'/17'/0'/1/0");
    assert.strictEqual(hd._getDerivationPathByAddress(hd._getInternalAddressByIndex(1)), "m/84'/17'/0'/1/1");

    assert.strictEqual(hd.getMasterFingerprintHex(), '73C5DA0A');
  });

  it('can generate addresses only via zpub', function () {
    const zpub = 'zpub6sCLTMQWa1WvTpvrWH1UFLJDeStRkS9R2nvv8aVmNKsSzQfDYw6P58x3ANyQSBDN9yZUL3Lpt17bTpFt4qBKUEEAeCUBd2ez4T5VGJnNy61';
    const hd = new HDSegwitBech32Wallet();
    hd._xpub = zpub;
    assert.strictEqual(hd._getExternalAddressByIndex(0), 'grs1qavkhf67upgdrswpn94fukltcs8ugancp6kqln9');
    assert.strictEqual(hd._getExternalAddressByIndex(1), 'grs1qf2zyhzxphsunp59duhfggk6mnnt2p3pddgj7ts');
    assert.strictEqual(hd._getInternalAddressByIndex(0), 'grs1qcqpmm4hhh2zt6ndl3secyx7p80mjlkeevp2nlr');
    assert.ok(hd._getInternalAddressByIndex(0) !== hd._getInternalAddressByIndex(1));

    assert.ok(hd.getAllExternalAddresses().includes('grs1qavkhf67upgdrswpn94fukltcs8ugancp6kqln9'));
    assert.ok(hd.getAllExternalAddresses().includes('grs1qf2zyhzxphsunp59duhfggk6mnnt2p3pddgj7ts'));
    assert.ok(!hd.getAllExternalAddresses().includes('grs1qcqpmm4hhh2zt6ndl3secyx7p80mjlkeevp2nlr')); // not internal
  });

  it('can generate', async () => {
    const hd = new HDSegwitBech32Wallet();
    const hashmap = {};
    for (let c = 0; c < 1000; c++) {
      await hd.generate();
      const secret = hd.getSecret();
      assert.strictEqual(secret.split(' ').length, 12);
      if (hashmap[secret]) {
        throw new Error('Duplicate secret generated!');
      }
      hashmap[secret] = 1;
      assert.ok(secret.split(' ').length === 12 || secret.split(' ').length === 24);
    }

    const hd2 = new HDSegwitBech32Wallet();
    hd2.setSecret(hd.getSecret());
    assert.ok(hd2.validateMnemonic());
  });

  it('can coin control', async () => {
    const hd = new HDSegwitBech32Wallet();

    // fake UTXO so we don't need to use fetchUtxo
    hd._utxo = [
      { txid: '11111', vout: 0, value: 11111 },
      { txid: '22222', vout: 0, value: 22222 },
    ];

    assert.ok(hd.getUtxo().length === 2);

    // freeze one UTXO and set a memo on it
    hd.setUTXOMetadata('11111', 0, { memo: 'somememo', frozen: true });
    assert.strictEqual(hd.getUTXOMetadata('11111', 0).memo, 'somememo');
    assert.strictEqual(hd.getUTXOMetadata('11111', 0).frozen, true);

    // now .getUtxo() should return a limited UTXO set
    assert.ok(hd.getUtxo().length === 1);
    assert.strictEqual(hd.getUtxo()[0].txid, '22222');

    // now .getUtxo(true) should return a full UTXO set
    assert.ok(hd.getUtxo(true).length === 2);

    // for UTXO with no metadata .getUTXOMetadata() should return an empty object
    assert.ok(Object.keys(hd.getUTXOMetadata('22222', 0)).length === 0);
  });

  it('can sign and verify messages', async () => {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const hd = new HDSegwitBech32Wallet();
    hd.setSecret(mnemonic);
    let signature;

    // external address
    signature = hd.signMessage('vires is numeris', hd._getExternalAddressByIndex(0));
    assert.strictEqual(signature, 'J+FYQZLYRt/7LGMru5pbatyY0Q90Ayn7UnbERvbZTM8FEhqbi+c/BiP3hWivRSegdOsAFcad4q3yGcv/K9KtoOw=');
    assert.strictEqual(hd.verifyMessage('vires is numeris', hd._getExternalAddressByIndex(0), signature), true);

    // internal address
    signature = hd.signMessage('vires is numeris', hd._getInternalAddressByIndex(0));
    assert.strictEqual(signature, 'KDaifh7mBgrWfVEq8yIpLfVY5psZtpKq5EvVJmM86PwuC6ptG5/zc7uSUU3kzlAJGNgk/5k0fBBvuFC4/iMAwPg=');
    assert.strictEqual(hd.verifyMessage('vires is numeris', hd._getInternalAddressByIndex(0), signature), true);

    // multiline message
    signature = hd.signMessage('vires\nis\nnumeris', hd._getExternalAddressByIndex(0));
    assert.strictEqual(signature, 'KMhhd77bg6w6KLTlOazZY28iD9/VXPScSB6xIKC27IAvOCfLN7sPJYKzcp/iBEbhcmXFbQ0cmnlkxRviTHbTo98=');
    assert.strictEqual(hd.verifyMessage('vires\nis\nnumeris', hd._getExternalAddressByIndex(0), signature), true);

    // can't sign if address doesn't belong to wallet
    assert.throws(() => hd.signMessage('vires is numeris', 'FcFxdKVa3aBZQ996pgWMv5BV4Xtg6FtMA1'));

    // can't verify wrong signature
    assert.throws(() => hd.verifyMessage('vires is numeris', hd._getInternalAddressByIndex(0), 'wrong signature'));

    // can verify electrum message signature
    // bech32 segwit (p2wpkh)
    // TODO: need to create these tests
    /*
    assert.strictEqual(
      hd.verifyMessage(
        'vires is numeris',
        'grs1q8c6fshw2dlwun7ekn9qwf37cu2rn755upcp6el',
        'Hya6IaZGbKF83eOmC5i1CX5V42Wqkf+eSMi8S+hvJuJrDmp5F56ivrHgAzcxNIShIpY2lJv76M2LB6zLV70KxWQ=',
      ),
      true,
    );
    // p2sh-segwit (p2wpkh-p2sh)
    assert.strictEqual(
      hd.verifyMessage(
        'vires is numeris',
        '37VucYSaXLCAsxYyAPfbSi9eh4iEcbShgf',
        'IBm8XAd/NdWjjUBXr3pkXdVk1XQBHKPkBy4DCmSG0Ox4IKOLb1O+V7cTXPQ2vm3rcYquF+6iKSPJDiE1TPrAswY=',
      ),
      true,
    );
    // legacy
    assert.strictEqual(
      hd.verifyMessage(
        'vires is numeris',
        '1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA',
        'IDNPawFev2E+W1xhHYi6NKuj7BY2Xe9qvXfddoWL4XZcPridoizzm8pda6jGEIwHlVYe4zrGhYqUR+j2hOsQxD8=',
      ),
      true,
    );
    */
  });

  it('can use mnemonic with passphrase', () => {
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const passphrase = 'super secret passphrase';
    const hd = new HDSegwitBech32Wallet();
    hd.setSecret(mnemonic);
    hd.setPassphrase(passphrase);

    assert.strictEqual(
      hd.getXpub(),
      'zpub6qNvUL1qNQwaReccveprgd4urE2EUvShpcFe7WB9tzf9L4NJNcWhPzJSk4fzNXqBNZdRr6135hBKaqqp5RVvyxZ6eMbZXL6u5iK4zwLW4XA',
    );

    assert.strictEqual(hd._getExternalAddressByIndex(0), 'grs1qgaj3satczjem43pz46ct6r3758twhnnyg4ztkr');
    assert.strictEqual(hd._getInternalAddressByIndex(0), 'grs1qthe7wh5eplzxczslvthyrer36ph3kxpn5z6ftf');
    assert.strictEqual(hd._getExternalWIFByIndex(0), 'L1tfV6fbRjDNwGQdJqHC9fneM9bTHigApnWgoKoU8Jwgziue7d2h');
  });

  it('can create with custom derivation path', async () => {
    const hd = new HDSegwitBech32Wallet();
    hd.setSecret('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    hd.setDerivationPath("m/84'/17'/1'");

    assert.strictEqual(
      hd.getXpub(),
      'zpub6rFR7y4Q2AijF6Gk1bofHLs1d66hKFamhXWdWBup1Em25wfabZqkDqvaieV63fDQFaYmaatCG7jVNUpUiM2hAMo6SAVHcrUpSnHDpPi8zun',
    );

    assert.strictEqual(hd._getExternalAddressByIndex(0), 'grs1qku0qh0mc00y8tk0n65x2tqw4trlspak05zw6sr');
    assert.strictEqual(hd._getInternalAddressByIndex(0), 'grs1qt0x83f5vmnapgl2gjj9r3d67rcghvjaq7a5qph');
    assert.strictEqual(hd._getExternalWIFByIndex(0), 'L4ouJZjss1Ua8LPhsJNkzN8V8uXrQpfADNsqzsaT5JHs1GCXguTr');

    assert.strictEqual(hd._getDerivationPathByAddress(hd._getExternalAddressByIndex(0)), "m/84'/17'/1'/0/0");
    assert.strictEqual(hd._getDerivationPathByAddress(hd._getInternalAddressByIndex(0)), "m/84'/17'/1'/1/0");
  });

  it('can generate ID', () => {
    const hd = new HDSegwitBech32Wallet();
    hd.setSecret('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
    const id1 = hd.getID();
    hd.setPassphrase('super secret passphrase');
    const id2 = hd.getID();
    hd.setDerivationPath("m/84'/17'/1'");
    const id3 = hd.getID();

    assert.notStrictEqual(id1, id2);
    assert.notStrictEqual(id2, id3);
    assert.notStrictEqual(id1, id3);
  });

  it('can createTransaction with a correct feerate (with lenghty segwit address)', () => {
    if (!process.env.HD_MNEMONIC_BIP84) {
      console.error('process.env.HD_MNEMONIC_BIP84 not set, skipped');
      return;
    }
    const hd = new HDSegwitBech32Wallet();
    hd.setSecret(process.env.HD_MNEMONIC_BIP84);
    assert.ok(hd.validateMnemonic());

    const utxo = [
      {
        address: 'grs1q063ctu6jhe5k4v8ka99qac8rcm2tzjjnp8h967',
        vout: 0,
        txid: '8b0ab2c7196312e021e0d3dc73f801693826428782970763df6134457bd2ec20',
        value: 69909,
        wif: '-',
      },
    ];

    const { tx, psbt, outputs } = hd.createTransaction(
      utxo,
      [{ address: 'grs1qtmcfj7lvgjp866w8lytdpap82u7eege58jy52hp4ctk0hsncegyqkycdv9', value: 546 }],
      10,
      'grs1qtmcfj7lvgjp866w8lytdpap82u7eege58jy52hp4ctk0hsncegyqkycdv9',
    );

    assert.strictEqual(outputs.length, 2);

    const actualFeerate = psbt.getFee() / tx.virtualSize();
    assert.strictEqual(
      Math.round(actualFeerate) >= 10 && actualFeerate <= 11,
      true,
      `bad feerate, got ${actualFeerate}, expected at least 10; fee: ${psbt.getFee()}; virsualSize: ${tx.virtualSize()} vbytes; ${tx.toHex()}`,
    );
  });

  it('can createTransaction with OP_RETURN', () => {
    if (!process.env.HD_MNEMONIC_BIP84) {
      console.error('process.env.HD_MNEMONIC_BIP84 not set, skipped');
      return;
    }
    const hd = new HDSegwitBech32Wallet();
    hd.setSecret(process.env.HD_MNEMONIC_BIP84);
    assert.ok(hd.validateMnemonic());

    const utxo = [
      {
        address: 'bc1q063ctu6jhe5k4v8ka99qac8rcm2tzjjnuktyrl',
        vout: 0,
        txid: '8b0ab2c7196312e021e0d3dc73f801693826428782970763df6134457bd2ec20',
        value: 69909,
        wif: '-',
      },
    ];

    const { tx, psbt, outputs } = hd.createTransaction(
      utxo,
      [
        { address: hd._getExternalAddressByIndex(0), value: 546 },
        { script: { hex: '00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff' }, value: 0 },
      ],
      150,
      hd._getInternalAddressByIndex(0),
    );

    assert.strictEqual(outputs.length, 3); // destination, op_return, change
    assert.ok(!outputs[1].address); // should not be there as it should be OP_RETURN

    const decodedTx = bitcoin.Transaction.fromHex(tx.toHex());
    // console.log(decodedTx.outs);

    assert.strictEqual(decodedTx.outs[0].value, 546); // first output - destination
    assert.strictEqual(decodedTx.outs[1].value, 0); // second output - op_return
    assert.ok(decodedTx.outs[2].value > 0); // third output - change

    assert.strictEqual(decodedTx.outs[1].script.toString('hex'), '00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff00ff'); // custom script that we are passing

    // console.log(outputs);

    const actualFeerate = psbt.getFee() / tx.virtualSize();
    assert.strictEqual(
      Math.round(actualFeerate) >= 150 && actualFeerate < 151,
      true,
      `bad feerate, got ${actualFeerate}, expected at least 11; fee: ${psbt.getFee()}; virsualSize: ${tx.virtualSize()} vbytes; ${tx.toHex()}`,
    );
  });

  it('can use french seed', async () => {
    const hd = new HDSegwitBech32Wallet();
    hd.setSecret('abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abeille');

    assert.strictEqual(true, hd.validateMnemonic());
    assert.strictEqual(hd._getExternalAddressByIndex(0), 'grs1q3gsf7a6es9603g9a2k50lqxxxtd7x9ptrjgru3');
    assert.strictEqual(hd._getInternalAddressByIndex(0), 'grs1q3ugpcustjrtt806uc5kqutlv5ue5sv0c5flyge');
  });

  it('can import from standard SeedQR', () => {
    const hd = new HDSegwitBech32Wallet();
    hd.setSecret('008607501025021714880023171503630517020917211425');
    assert.strictEqual(hd.getSecret(), 'approve fruit lens brass ring actual stool coin doll boss strong rate');
    assert.ok(hd.validateMnemonic());

    const hd2 = new HDSegwitBech32Wallet();
    hd2.setSecret('075707570757075700000000043911730136013601360757');
    assert.strictEqual(hd2.getSecret(), 'gadget gadget gadget gadget abandon abandon dad naive baby baby baby gadget');
    assert.ok(hd2.validateMnemonic());

    const hd3 = new HDSegwitBech32Wallet();
    hd3.setSecret('0757075707570757000000000439117301360136013607'); // invalid length
    assert.ok(!hd3.validateMnemonic());

    const hd4 = new HDSegwitBech32Wallet();
    hd4.setSecret('07570757075707abcdef0000043911730136013601360757'); // invalid symbols

    assert.ok(!hd4.validateMnemonic());
  });
});
