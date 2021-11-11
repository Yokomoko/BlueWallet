import {
  HDSegwitElectrumSeedP2WPKHWallet,
  HDLegacyBreadwalletWallet,
  HDSegwitBech32Wallet,
  HDLegacyElectrumSeedP2PKHWallet,
  LegacyWallet,
  SegwitP2SHWallet,
  SegwitBech32Wallet,
  HDLegacyP2PKHWallet,
  HDSegwitP2SHWallet,
  WatchOnlyWallet,
  HDAezeedWallet,
  SLIP39SegwitP2SHWallet,
} from '../../class';
import WalletImport from '../../class/wallet-import';
import React from 'react';
// import Notifications from '../../blue_modules/notifications';
const assert = require('assert');
global.net = require('net'); // needed by Electrum-GRS client. For RN it is proviced in shim.js
global.tls = require('tls'); // needed by Electrum-GRS client. For RN it is proviced in shim.js
const BlueElectrum = require('../../blue_modules/BlueElectrum'); // so it connects ASAP

/** @type HDSegwitBech32Wallet */
let lastImportedWallet;

React.useContext = jest.fn(() => {
  return {
    wallets: [],
    pendingWallets: [],
    setPendingWallets: function () {},
    saveToDisk: function () {},
    addWallet: function (wallet) {
      lastImportedWallet = wallet;
    },
  };
});

jest.mock('../../blue_modules/notifications', () => {
  return {
    majorTomToGroundControl: jest.fn(),
  };
});

jest.mock('../../blue_modules/prompt', () => {
  return jest.fn(() => {
    return 'qwerty';
  });
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

afterAll(async () => {
  // after all tests we close socket so the test suite can actually terminate
  BlueElectrum.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  await BlueElectrum.waitTillConnected();
  WalletImport(); // damn i love javascript
  Notifications(); // damn i love javascript
});

describe('import procedure', function () {
  it('can import BIP84', async () => {
    await WalletImport.processImportText(
      'always direct find escape liar turn differ shy tool gap elder galaxy lawn wild movie fog moon spread casual inner box diagram outdoor tell',
    );
    assert.strictEqual(lastImportedWallet.type, HDSegwitBech32Wallet.type);
    assert.strictEqual(lastImportedWallet._getExternalAddressByIndex(0), 'grs1q5elt7p6rtduftvmv99f5tdpmjml0p8h9369yqm');
    assert.strictEqual(lastImportedWallet.getLabel(), 'Imported HD SegWit (BIP84 Bech32 Native)');
  });

  it('can import Legacy', async () => {
    await WalletImport.processImportText('KztVRmc2EJJBHi599mCdXrxMTsNsGy3NUjc3Fb3FFDSMYyM2skod');
    assert.strictEqual(lastImportedWallet.type, LegacyWallet.type);
    assert.strictEqual(lastImportedWallet.getAddress(), 'FesL5FwNATk2yHryY4tq8CuyNc6p3ctd6S');
    assert.strictEqual(lastImportedWallet.getLabel(), 'Imported Legacy (P2PKH)');
  });

  it('can import Legacy P2SH Segwit', async () => {
    await WalletImport.processImportText('KzDxdwhBKvQTtM1jDBhm8mUbJhfjjJhAa5Towgqx1rjwKFSa8ELd');
    assert.strictEqual(lastImportedWallet.type, SegwitP2SHWallet.type);
    assert.strictEqual(lastImportedWallet.getAddress(), '33otZPRRkbsLK9dnXiP8W6Lrz3PnoPkXi1');
    assert.strictEqual(lastImportedWallet.getLabel(), 'Imported SegWit (P2SH)');
  });

  it('can import Legacy Bech32 Segwit', async () => {
    await WalletImport.processImportText('L3oR81sB4WLS7wNLa3Ct9gChfE52W81BrV4UCK5NiznyPg5XXTKd');
    assert.strictEqual(lastImportedWallet.type, SegwitBech32Wallet.type);
    assert.strictEqual(lastImportedWallet.getAddress(), 'grs1qwrku6kewf5vzu2hq34dsqugt0ljs4xedyqp7dw');
    assert.strictEqual(lastImportedWallet.getLabel(), 'Imported P2 WPKH');
  });

  it('can import BIP44', async () => {
    await WalletImport.processImportText(
      'sting museum endless duty nice riot because swallow brother depth weapon merge woman wish hold finish venture gauge stomach bomb device bracket agent parent',
    );
    assert.strictEqual(lastImportedWallet.type, HDLegacyP2PKHWallet.type);
    assert.strictEqual(lastImportedWallet._getExternalAddressByIndex(0), 'FgfXRKBdCda3zJpqYhuuoZru1cv93YVabY');
    assert.strictEqual(lastImportedWallet.getLabel(), 'Imported HD Legacy (BIP44 P2PKH)');
  });

  it('can import BIP49', async () => {
    await WalletImport.processImportText(
      'believe torch sport lizard absurd retreat scale layer song pen clump combine window staff dream filter latin bicycle vapor anchor put clean gain slush',
    );
    assert.strictEqual(lastImportedWallet.type, HDSegwitP2SHWallet.type);
    assert.strictEqual(lastImportedWallet._getExternalAddressByIndex(0), '37ZhWiHKJPEngxQd43PFz8k4rgKnruEXNX');
    assert.strictEqual(lastImportedWallet.getLabel(), 'Imported HD SegWit (BIP49 P2SH)');
  });

  // TODO: we need a 12 word wallet with transactions
  it.skip('can import HD Legacy Electrum (BIP32 P2PKH)', async () => {
    await WalletImport.processImportText('unknown utility reopen kingdom hill among opinion oxygen secret midnight vivid donate');
    assert.strictEqual(lastImportedWallet.type, HDLegacyElectrumSeedP2PKHWallet.type);
    assert.strictEqual(lastImportedWallet._getExternalAddressByIndex(0), 'FekMsQGoj3TMzxPBeC5nGGyAZ6ndssTAEZ');
    assert.strictEqual(lastImportedWallet.getLabel(), 'Imported HD Legacy Electrum (BIP32 P2PKH)');
  });

  it('can import BreadWallet', async () => {
    await WalletImport.processImportText(
      'tired lesson alert attend giggle fancy nose enter ethics fashion fly dove dutch hidden toe argue save fish catch patient waste gift divorce whisper',
    );
    assert.strictEqual(lastImportedWallet.type, HDLegacyBreadwalletWallet.type);
    assert.strictEqual(lastImportedWallet._getExternalAddressByIndex(0), 'FVtpuWKqUdGB4AGxwXBafVeRvXRSt1boQx');
    assert.strictEqual(lastImportedWallet.getLabel(), 'Imported HD Legacy Breadwallet (P2PKH)');
  });
  // TODO: we need a 24 word wallet with transactions
  it.skip('can import HD Electrum (BIP32 P2WPKH)', async () => {
    await WalletImport.processImportText('noble mimic pipe merry knife screen enter dune crop bonus slice card');
    assert.strictEqual(lastImportedWallet.type, HDSegwitElectrumSeedP2WPKHWallet.type);
    assert.strictEqual(lastImportedWallet._getExternalAddressByIndex(0), 'grs1qzzanxnr3xv9a5ha264kpzpfq260qvuamyprv5a');
    assert.strictEqual(lastImportedWallet.getLabel(), 'Imported HD Electrum (BIP32 P2WPKH)');
  });

  // TODO: we need a 24 word wallet with transactions
  it.skip('can import AEZEED', async () => {
    await WalletImport.processImportText(
      'abstract rhythm weird food attract treat mosquito sight royal actor surround ride strike remove guilt catch filter summer mushroom protect poverty cruel chaos pattern',
    );
    assert.strictEqual(lastImportedWallet.type, HDAezeedWallet.type);
  });

  it('importing empty BIP39 should yield BIP84', async () => {
    const tempWallet = new HDSegwitBech32Wallet();
    await tempWallet.generate();
    await WalletImport.processImportText(tempWallet.getSecret());
    assert.strictEqual(lastImportedWallet.type, HDSegwitBech32Wallet.type);
  });

  it('can import Legacy with uncompressed pubkey', async () => {
    await WalletImport.processImportText('5KE6tf9vhYkzYSbgEL6M7xvkY69GMFHF3WxzYaCFMvwMxmNkoiD');
    assert.strictEqual(lastImportedWallet.getSecret(), '5KE6tf9vhYkzYSbgEL6M7xvkY69GMFHF3WxzYaCFMvwMxmNkoiD');
    assert.strictEqual(lastImportedWallet.type, LegacyWallet.type);
    assert.strictEqual(lastImportedWallet.getAddress(), 'Fm31fYwUEL7gSdfohqh7CNGnNMxyMJ1zUe');
    assert.strictEqual(lastImportedWallet.getLabel(), 'Imported Legacy (P2PKH)');
  });

  // todo: create a bip38 wallet
  it.skip('can import BIP38 encrypted backup', async () => {
    await WalletImport.processImportText('6PnU5voARjBBykwSddwCdcn6Eu9EcsK24Gs5zWxbJbPZYW7eiYQP8XgKbN');
    assert.strictEqual(lastImportedWallet.getSecret(), 'KxqRtpd9vFju297ACPKHrGkgXuberTveZPXbRDiQ3MXZycTMtut3');
    assert.strictEqual(lastImportedWallet.type, LegacyWallet.type);
    assert.strictEqual(lastImportedWallet.getAddress(), 'FaCrwwUieyDgqEc3EWdpHmrmZdWYBAPBZv');
    assert.strictEqual(lastImportedWallet.getLabel(), 'Imported Legacy (P2PKH)');
  });

  it('can import watch-only address', async () => {
    await WalletImport.processImportText('FesL5FwNATk2yHryY4tq8CuyNc6p3ctd6S');
    assert.strictEqual(lastImportedWallet.type, WatchOnlyWallet.type);
    await WalletImport.processImportText('3EoqYYp7hQSHn5nHqRtWzkgqmK3cYrMztd');
    assert.strictEqual(lastImportedWallet.type, WatchOnlyWallet.type);
    await WalletImport.processImportText('grs1qhx36t8easzt7fr7q5fp53tkjgwh9ep33405aet');
    assert.strictEqual(lastImportedWallet.type, WatchOnlyWallet.type);
    await WalletImport.processImportText(
      'zpub6r7jhKKm7BAVx3b3nSnuadY1WnshZYkhK8gKFoRLwK9rF3Mzv28BrGcCGA3ugGtawi1WLb2vyjQAX9ZTDGU5gNk2bLdTc3iEXr6tzQf5TUF',
    );
    assert.strictEqual(lastImportedWallet.type, WatchOnlyWallet.type);
  });

  // TODO: create a slip39 wallet that we can import
  it.skip('can import slip39 wallet', async () => {
    // 2-of-3 slip39 wallet
    // crystal lungs academic acid corner infant satisfy spider alcohol laser golden equation fiscal epidemic infant scholar space findings tadpole belong
    // crystal lungs academic agency class payment actress avoid rebound ordinary exchange petition tendency mild mobile spine robin fancy shelter increase
    // crystal lungs academic always earth satoshi elbow satoshi that pants formal leaf rival texture romantic filter expand regular soul desert
    await WalletImport.processImportText(
      'crystal lungs academic acid corner infant satisfy spider alcohol laser golden equation fiscal epidemic infant scholar space findings tadpole belong\n' +
        'crystal lungs academic agency class payment actress avoid rebound ordinary exchange petition tendency mild mobile spine robin fancy shelter increase',
    );
    assert.strictEqual(lastImportedWallet.type, SLIP39SegwitP2SHWallet.type);
  });

  it('can import watch-only Cobo vault export', async () => {
    await WalletImport.processImportText(
      '{"ExtPubKey":"zpub6riZchHnrWzhhZ3Z4dhCJmesGyafMmZBRC9txhnidR313XJbcv4KiDubderKHhL7rMsqacYd82FQ38e4whgs8Dg7CpsxX3dSGWayXrNBr5H","MasterFingerprint":"7D2F0272","AccountKeyPath":"84\'\\/0\'\\/0\'","CoboVaultFirmwareVersion":"2.6.1(BTC-Only)"}',
    );
    assert.strictEqual(lastImportedWallet.type, WatchOnlyWallet.type);
  });
});
