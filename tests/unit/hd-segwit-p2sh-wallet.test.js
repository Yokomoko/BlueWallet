/* global it */
import { SegwitP2SHWallet, SegwitBech32Wallet, HDSegwitP2SHWallet, HDLegacyP2PKHWallet, LegacyWallet } from '../../class';
let assert = require('assert');

it('can create a Segwit HD (BIP49)', async function() {
  let mnemonic =
    'honey risk juice trip orient galaxy win situate shoot anchor bounce remind horse traffic exotic since escape mimic ramp skin judge owner topple erode';
  let hd = new HDSegwitP2SHWallet();
  hd.setSecret(mnemonic);
  assert.strictEqual('395AFhKYJCYGGR7P4rwvgqBTTfQukiHrWy', hd._getExternalAddressByIndex(0));
  assert.strictEqual('37547yv9AQUsE9abAoJqqdFZw8C2zj9k8E', hd._getExternalAddressByIndex(1));
  assert.strictEqual('38DBbhHEBFWbwm9abjjUVdTV2zs4FDRcp5', hd._getInternalAddressByIndex(0));
  assert.strictEqual(true, hd.validateMnemonic());

  assert.strictEqual(
    hd._getPubkeyByAddress(hd._getExternalAddressByIndex(0)).toString('hex'),
    '02c3beeba8bbf24bfa336e03749683b1208b4aea13290337b00262d5afbe5f15c7',
  );
  assert.strictEqual(
    hd._getPubkeyByAddress(hd._getInternalAddressByIndex(0)).toString('hex'),
    '03c3ff5233bc11fa0273b508d42a144e5e475a7e5f17473d211d40d035db9da483',
  );

  assert.strictEqual(hd._getDerivationPathByAddress(hd._getExternalAddressByIndex(0)), "m/84'/17'/0'/0/0"); // wrong, FIXME
  assert.strictEqual(hd._getDerivationPathByAddress(hd._getInternalAddressByIndex(0)), "m/84'/17'/0'/1/0"); // wrong, FIXME

  assert.strictEqual('KzoosK4MqjwBBNANduQn9PpL2Y4a9sxEJNyAiQPzNArQ7XrPcPN7', hd._getExternalWIFByIndex(0));
  assert.strictEqual(
    'ypub6XnFnMGmSrB2RyVTUQk7NDyZQ4Aq4KyevntuMmRsNnJMyYmWopWYGp7aE21wQ6mXrxYH4dRHFfiqC5Sv9HLro5A4VoLjswSmGNZju8AhhLQ',
    hd.getXpub(),
  );
});

it('can convert witness to address', () => {
  let address = SegwitP2SHWallet.witnessToAddress('035c618df829af694cb99e664ce1b34f80ad2c3b49bcd0d9c0b1836c66b2d25fd8');
  assert.strictEqual(address, '34ZVGb3gT8xMLT6fpqC6dNVqJtJmuXR3Tf');

  address = SegwitP2SHWallet.scriptPubKeyToAddress('a914e286d58e53f9247a4710e51232cce0686f16873c87');
  assert.strictEqual(address, '3NLnALo49CFEF4tCRhCvz45ySSfz2hjD7w');

  address = SegwitBech32Wallet.witnessToAddress('035c618df829af694cb99e664ce1b34f80ad2c3b49bcd0d9c0b1836c66b2d25fd8');
  assert.strictEqual(address, 'grs1quhnve8q4tk3unhmjts7ymxv8cd6w9xv8n4ky9d');

  address = SegwitBech32Wallet.scriptPubKeyToAddress('00144d757460da5fcaf84cc22f3847faaa1078e84f6a');
  assert.strictEqual(address, 'grs1qf46hgcx6tl90snxz9uuy0742zpuwsnm2r4vvwl');

  address = LegacyWallet.scriptPubKeyToAddress('76a914d0b77eb1502c81c4093da9aa6eccfdf560cdd6b288ac');
  assert.strictEqual(address, 'FpCJpFznxu1zTmWbXr3nbqvCSCiQ38hvNz');
});

it('Segwit HD (BIP49) can generate addressess only via ypub', function() {
  let ypub = 'ypub6X46SconPpL9QhXPnMGuPLB9jYai7nrHz7ki4zq3awHb462iPSG5eV19oBWv22RWt69npsi75XGcANsevtTWE8YFgqpygrGUPnEKp6vty5v';
  let hd = new HDSegwitP2SHWallet();
  hd._xpub = ypub;
  assert.strictEqual('3299Qf2x9BnzLaZu4HCLvm26RbBB3ZRf4u', hd._getExternalAddressByIndex(0));
  assert.strictEqual('37WFkjwMYBkJrpnSA92iHjtFcXneDcQFTW', hd._getExternalAddressByIndex(1));
  assert.strictEqual('34e4had5XuUMLhqSoHakxoU9Kg9teFWW3R', hd._getInternalAddressByIndex(0));
});

it('can generate Segwit HD (BIP49)', async () => {
  let hd = new HDSegwitP2SHWallet();
  let hashmap = {};
  for (let c = 0; c < 1000; c++) {
    await hd.generate();
    let secret = hd.getSecret();
    if (hashmap[secret]) {
      throw new Error('Duplicate secret generated!');
    }
    hashmap[secret] = 1;
    assert.ok(secret.split(' ').length === 12 || secret.split(' ').length === 24);
  }

  let hd2 = new HDSegwitP2SHWallet();
  hd2.setSecret(hd.getSecret());
  assert.ok(hd2.validateMnemonic());
});

it('can work with malformed mnemonic', () => {
  let mnemonic =
    'honey risk juice trip orient galaxy win situate shoot anchor bounce remind horse traffic exotic since escape mimic ramp skin judge owner topple erode';
  let hd = new HDSegwitP2SHWallet();
  hd.setSecret(mnemonic);
  let seed1 = hd.getMnemonicToSeedHex();
  assert.ok(hd.validateMnemonic());

  mnemonic = 'hell';
  hd = new HDSegwitP2SHWallet();
  hd.setSecret(mnemonic);
  assert.ok(!hd.validateMnemonic());

  // now, malformed mnemonic

  mnemonic =
    '    honey  risk   juice    trip     orient      galaxy win !situate ;; shoot   ;;;   anchor Bounce remind\nhorse \n traffic exotic since escape mimic ramp skin judge owner topple erode ';
  hd = new HDSegwitP2SHWallet();
  hd.setSecret(mnemonic);
  let seed2 = hd.getMnemonicToSeedHex();
  assert.strictEqual(seed1, seed2);
  assert.ok(hd.validateMnemonic());
});

it('Legacy HD (BIP44) can generate addressess based on xpub', async function() {
  let xpub = 'xpub6D1UJDwSYnrC6811wgE7QztbeciyL7zZs8r9a1kurTXiYgQUk9LibZ6mq6BPGgewxQvNXKmg8g6eqmiHofVUyX3nED1iACybAETVpzdzTGG';
  let hd = new HDLegacyP2PKHWallet();
  hd._xpub = xpub;
  assert.strictEqual(hd._getExternalAddressByIndex(0), 'FYN8Svwh3NpWta7UDVmHADgX5i6gpHKBG4');
  assert.strictEqual(hd._getInternalAddressByIndex(0), 'FmqnRqTe1nd7V9Bnm1WNMQnHxgb2yTBFXT');
  assert.strictEqual(hd._getExternalAddressByIndex(1), 'FYgX5ujkspKchM8cgpgeiBMxjv7EMmsvio');
  assert.strictEqual(hd._getInternalAddressByIndex(1), 'Fpe3XJo1gj9jkXh4UxHPdoXNDMVvaHNiYt');
});
