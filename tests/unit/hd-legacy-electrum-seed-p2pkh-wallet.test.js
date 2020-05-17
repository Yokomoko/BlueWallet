/* global describe, it */
import { HDLegacyElectrumSeedP2PKHWallet } from '../../class';
let assert = require('assert');

describe('HDLegacyElectrumSeedP2PKHWallet', () => {
  it('can import mnemonics and generate addresses and WIFs', async function() {
    let hd = new HDLegacyElectrumSeedP2PKHWallet();
    hd.setSecret('hurdle alien first stock mail blade business ill mistake dust stereo van');
    assert.ok(hd.validateMnemonic());
    assert.strictEqual(
      hd.getXpub(),
      'xpub661MyMwAqRbcG6vx5SspHUzrhRtPKyeGp41JJLBi3kgeMCFkR6mzGkhEttBHTZg6FYYij52pqD2cW7XsutiZrRukXNLqeo87mZAV5k5bC22',
    );

    let address = hd._getExternalAddressByIndex(0);
    assert.strictEqual(address, 'FcBN63fFz8riqokAUszsTgVJrngFdndrNQ');

    address = hd._getInternalAddressByIndex(0);
    assert.strictEqual(address, 'FaRBsD6VgZFSikR6U9uhSUwZSggZrxGjbg');

    let wif = hd._getExternalWIFByIndex(0);
    assert.strictEqual(wif, 'KxDRPw1TQvgjyVLsYFsUoAssxKPF6UTwBzCfjVCykxscwSDFjDWu');

    wif = hd._getInternalWIFByIndex(0);
    assert.strictEqual(wif, 'KwWUeGpzvxHRUfhLJuvHX9aPkMqRJ6Ezp5KEe2QabHDDapqz2p3v');

    assert.strictEqual(
      hd._getPubkeyByAddress(hd._getExternalAddressByIndex(0)).toString('hex'),
      '02756a43892624fc7713b8346bee48001be71adedaf3a965be75018ba77a5b2d94',
    );
    assert.strictEqual(
      hd._getPubkeyByAddress(hd._getInternalAddressByIndex(0)).toString('hex'),
      '0344708260d2a832fd430285a0b915859d73e6ed4c6c6a9cb73e9069a9de56fb23',
    );

    hd.setSecret('bs');
    assert.ok(!hd.validateMnemonic());
  });
});
