import assert from 'assert';

import * as BlueElectrum from '../../blue_modules/BlueElectrum';
import {
  HDAezeedWallet,
  HDLegacyBreadwalletWallet,
  HDLegacyElectrumSeedP2PKHWallet,
  HDLegacyP2PKHWallet,
  HDSegwitBech32Wallet,
  HDSegwitElectrumSeedP2WPKHWallet,
  HDSegwitP2SHWallet,
  LegacyWallet,
  SegwitBech32Wallet,
  SegwitP2SHWallet,
  SLIP39SegwitBech32Wallet,
  SLIP39SegwitP2SHWallet,
  WatchOnlyWallet,
} from '../../class';
import startImport from '../../class/wallet-import';
const fs = require('fs');

jest.setTimeout(90 * 1000);

afterAll(async () => {
  // after all tests we close socket so the test suite can actually terminate
  BlueElectrum.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  await BlueElectrum.connectMain();
});

const createStore = password => {
  const state = { wallets: [] };
  const history = [];

  const onProgress = data => {
    history.push({ action: 'progress', data });
    state.progress = data;
  };

  const onWallet = data => {
    history.push({ action: 'wallet', data });
    state.wallets.push(data);
  };

  const onPassword = () => {
    history.push({ action: 'password', data: password });
    state.password = password;
    return password;
  };

  return {
    state,
    history,
    callbacks: [onProgress, onWallet, onPassword],
  };
};

describe('import procedure', () => {
  it('can be cancelled', async () => {
    // returns undefined on first call, throws cancel exception on second
    let flag = false;
    const onPassword = async () => {
      if (flag) throw new Error('Cancel Pressed');
      flag = true;
      return undefined;
    };
    const store = createStore();
    store.callbacks[2] = onPassword;
    const { promise } = startImport('6PnU5voARjBBykwSddwCdcn6Eu9EcsK24Gs5zWxbJbPZYW7eiYQP8XgKbN', false, false, ...store.callbacks);
    const imprt = await promise;
    assert.strictEqual(store.state.wallets.length, 0);
    assert.strictEqual(imprt.cancelled, true);
  });

  it('can be stopped', async () => {
    const store = createStore();
    const { promise, stop } = startImport('KztVRmc2EJJBHi599mCdXrxMTsNsGy3NUjc3Fb3FFDSMYyM2skod', false, false, ...store.callbacks);
    stop();
    await assert.doesNotReject(async () => await promise);
    const imprt = await promise;
    assert.strictEqual(imprt.stopped, true);
  });

  it('can import multiple wallets', async () => {
    const store = createStore();
    const { promise } = startImport(
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      false,
      true,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets.length > 3, true);
  });

  it('can import BIP84', async () => {
    const store = createStore();
    const { promise } = startImport(
      'always direct find escape liar turn differ shy tool gap elder galaxy lawn wild movie fog moon spread casual inner box diagram outdoor tell',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDSegwitBech32Wallet.type);
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'grs1qth9qxvwvdthqmkl6x586ukkq8zvumd38whlw77');
  });

  it('can import BIP84 with passphrase', async () => {
    const store = createStore('BlueWallet');
    const { promise } = startImport(
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
      true,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDSegwitBech32Wallet.type);
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'grs1qe8q660wfj6uvqg7zyn86jcsux36natklaz4v6e');
  });

  it('can import Legacy', async () => {
    const store = createStore();
    const { promise } = startImport('KztVRmc2EJJBHi599mCdXrxMTsNsGy3NUjc3Fb3FFDSMYyM2skod', false, false, ...store.callbacks);
    await promise;
    assert.strictEqual(store.state.wallets[0].type, LegacyWallet.type);
    assert.strictEqual(store.state.wallets[0].getAddress(), 'FesL5FwNATk2yHryY4tq8CuyNc6p3ctd6S');
  });

  it('can import P2SH Segwit', async () => {
    const store = createStore();
    const { promise } = startImport('L3NxFnYoBGjJ5PhxrxV6jorvjnc8cerYJx71vXU6ta8BXQxHVZya', false, false, ...store.callbacks);
    await promise;
    assert.strictEqual(store.state.wallets[0].type, SegwitP2SHWallet.type);
    assert.strictEqual(store.state.wallets[0].getAddress(), '3KM9VfdsDf9uT7uwZagoKgVn8z35iBK2sH');
    assert.strictEqual(store.state.wallets[1].type, LegacyWallet.type);
    assert.strictEqual(store.state.wallets[1].getAddress(), 'FpGtDNBh9erC6nfFvnJ5hwFbopudPnPFWW');
  });

  it('can import Bech32 Segwit', async () => {
    const store = createStore();
    const { promise } = startImport('L1T6FfKpKHi8JE6eBKrsXkenw34d5FfFzJUZ6dLs2utxkSwQHDyp', false, false, ...store.callbacks);
    await promise;
    assert.strictEqual(store.state.wallets[0].type, SegwitBech32Wallet.type);
    assert.strictEqual(store.state.wallets[0].getAddress(), 'grs1q763rf54hzuncmf8dtlz558uqe4f247mqv5ln4z');
    assert.strictEqual(store.state.wallets[1].type, LegacyWallet.type);
    assert.strictEqual(store.state.wallets[1].getAddress(), 'FsenzPpr511eHuvSkUGZN3uPtJK4gdZQ7i');
  });

  it('can import Legacy/P2SH/Bech32 from an empty wallet', async () => {
    const store = createStore();
    const { promise } = startImport('L36mabzoQyMZoHHsBFVNB7PUBXgXTynwY6yR7kYZ82EkS7q2o3ks', false, false, ...store.callbacks);
    await promise;
    assert.strictEqual(store.state.wallets[0].type, SegwitBech32Wallet.type);
    assert.strictEqual(store.state.wallets[0].getAddress(), 'grs1q8dkdgpaq9sd2xwptsjhe7krwp0k595w02uhhsz');
    assert.strictEqual(store.state.wallets[1].type, SegwitP2SHWallet.type);
    assert.strictEqual(store.state.wallets[1].getAddress(), '3QNykAevvcnyw8S85wn4U8tsH2nkpY9VB9');
    assert.strictEqual(store.state.wallets[2].type, LegacyWallet.type);
    assert.strictEqual(store.state.wallets[2].getAddress(), 'FaavgkGFnGFHCjgBkCU8Vk61PN6q85XLvm');
  });

  it('can import BIP44', async () => {
    const store = createStore();
    const { promise } = startImport(
      'sting museum endless duty nice riot because swallow brother depth weapon merge woman wish hold finish venture gauge stomach bomb device bracket agent parent',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDLegacyP2PKHWallet.type);
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'Fiqw3rPTM2VhCPphPc6FwcATfPazqP56aA');
  });

  it('can import BIP44 with mnemonic in french', async () => {
    const store = createStore();
    const { promise } = startImport(
      'abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abeille',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDLegacyP2PKHWallet.type);
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'FnRMSrMW1KwKWwfmbKK644GzC8C9WFfhKV');
  });

  it('can import BIP49', async () => {
    const store = createStore();
    const { promise } = startImport(
      'believe torch sport lizard absurd retreat scale layer song pen clump combine window staff dream filter latin bicycle vapor anchor put clean gain slush',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDSegwitP2SHWallet.type);
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), '3EoqYYp7hQSHn5nHqRtWzkgqmK3cYrMztd');
  });

  it('can import HD Legacy Electrum (BIP32 P2PKH)', async () => {
    const store = createStore();
    const { promise } = startImport(
      'eight derive blast guide smoke piece coral burden lottery flower tomato flame',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDLegacyElectrumSeedP2PKHWallet.type);
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'FjrD7CoabnerwvDBqr2ZfEbS1drvdizjGB');
  });

  it('can import HD Legacy Electrum (BIP32 P2PKH) with passphrase', async () => {
    const store = createStore('super secret passphrase');
    const { promise } = startImport(
      'receive happy wash prosper update pet neck acid try profit proud hungry',
      true,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDLegacyElectrumSeedP2PKHWallet.type);
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'FY37Nnb3yrp5ACaVAzYzqMHXxZ4LDJf1fQ');
  });

  it('can import BreadWallet', async () => {
    const store = createStore();
    const { promise } = startImport(
      'become salmon motor battle sweet merit romance ecology age squirrel oblige awesome',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDLegacyBreadwalletWallet.type);
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'FkFcC9dt5DYXZmH6sxa8uC4HaV9PXvJJfJ');
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(1), 'grs1q5gslp44fkfdkq6r255utxpq85c9n02m32prurx');
  });

  it('can import HD Electrum (BIP32 P2WPKH)', async () => {
    const store = createStore();
    const { promise } = startImport(
      'noble mimic pipe merry knife screen enter dune crop bonus slice card',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDSegwitElectrumSeedP2WPKHWallet.type);
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'grs1qzzanxnr3xv9a5ha264kpzpfq260qvuamyprv5a');
  });

  it('can import HD Electrum (BIP32 P2WPKH) with passphrase', async () => {
    const UNICODE_HORROR = '₿ 😀 😈     う けたま わる w͢͢͝h͡o͢͡ ̸͢k̵͟n̴͘ǫw̸̛s͘ ̀́w͘͢ḩ̵a҉̡͢t ̧̕h́o̵r͏̵rors̡ ̶͡͠lį̶e͟͟ ̶͝in͢ ͏t̕h̷̡͟e ͟͟d̛a͜r̕͡k̢̨ ͡h̴e͏a̷̢̡rt́͏ ̴̷͠ò̵̶f̸ u̧͘ní̛͜c͢͏o̷͏d̸͢e̡͝?͞';
    const store = createStore(UNICODE_HORROR);
    const { promise } = startImport(
      'bitter grass shiver impose acquire brush forget axis eager alone wine silver',
      true,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDSegwitElectrumSeedP2WPKHWallet.type);
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'grs1qx94dutas7ysn2my645cyttujrms5d9p5rcxuy6');
  });

  it('can import AEZEED', async () => {
    const store = createStore();
    const { promise } = startImport(
      'abstract rhythm weird food attract treat mosquito sight royal actor surround ride strike remove guilt catch filter summer mushroom protect poverty cruel chaos pattern',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDAezeedWallet.type);
  });

  it('can import AEZEED with password', async () => {
    const store = createStore('strongPassword');
    const { promise } = startImport(
      'able mix price funny host express lawsuit congress antique float pig exchange vapor drip wide cup style apple tumble verb fix blush tongue market',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDAezeedWallet.type);
  });

  it('importing empty BIP39 should yield BIP84', async () => {
    const store = createStore();
    const tempWallet = new HDSegwitBech32Wallet();
    await tempWallet.generate();
    const { promise } = startImport(tempWallet.getSecret(), false, false, ...store.callbacks);
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDSegwitBech32Wallet.type);
  });

  it('can import Legacy with uncompressed pubkey', async () => {
    const store = createStore();
    const { promise } = startImport('5KE6tf9vhYkzYSbgEL6M7xvkY69GMFHF3WxzYaCFMvwMxmNkoiD', false, false, ...store.callbacks);
    await promise;
    assert.strictEqual(store.state.wallets[0].getSecret(), '5KE6tf9vhYkzYSbgEL6M7xvkY69GMFHF3WxzYaCFMvwMxmNkoiD');
    assert.strictEqual(store.state.wallets[0].type, LegacyWallet.type);
    assert.strictEqual(store.state.wallets[0].getAddress(), 'Fm31fYwUEL7gSdfohqh7CNGnNMxyMJ1zUe');
  });

  it('can import BIP38 encrypted backup', async () => {
    const store = createStore('qwerty');
    const { promise } = startImport('6PnU5voARjBBykwSddwCdcn6Eu9EcsK24Gs5zWxbJbPZYW7eiYQP8XgKbN', false, false, ...store.callbacks);
    await promise;
    assert.strictEqual(store.state.wallets[0].getSecret(), 'KxqRtpd9vFju297ACPKHrGkgXuberTveZPXbRDiQ3MXZycTMtut3');
    assert.strictEqual(store.state.wallets[0].type, SegwitBech32Wallet.type);
    assert.strictEqual(store.state.wallets[0].getAddress(), 'grs1qxaqgapg7sugyvq3zh0re8plqkgrvrxzr8p06ez');
    assert.strictEqual(store.state.wallets[1].getSecret(), 'KxqRtpd9vFju297ACPKHrGkgXuberTveZPXbRDiQ3MXZycTMtut3');
    assert.strictEqual(store.state.wallets[1].type, SegwitP2SHWallet.type);
    assert.strictEqual(store.state.wallets[1].getAddress(), '3ANCYnBvFPJyc4sxNFWnLkVBfDrKD5EoqK');
    assert.strictEqual(store.state.wallets[2].getSecret(), 'KxqRtpd9vFju297ACPKHrGkgXuberTveZPXbRDiQ3MXZycTMtut3');
    assert.strictEqual(store.state.wallets[2].type, LegacyWallet.type);
    assert.strictEqual(store.state.wallets[2].getAddress(), 'FaCrwwUieyDgqEc3EWdpHmrmZdWYBAPBZv');
  });

  it('can import watch-only address', async () => {
    const store1 = createStore();
    const { promise: promise1 } = startImport('FesL5FwNATk2yHryY4tq8CuyNc6p3ctd6S', false, false, ...store1.callbacks);
    await promise1;
    assert.strictEqual(store1.state.wallets[0].type, WatchOnlyWallet.type);

    const store2 = createStore();
    const { promise: promise2 } = startImport('3EoqYYp7hQSHn5nHqRtWzkgqmK3cYrMztd', false, false, ...store2.callbacks);
    await promise2;
    assert.strictEqual(store2.state.wallets[0].type, WatchOnlyWallet.type);

    const store3 = createStore();
    const { promise: promise3 } = startImport('grs1q8j4lk4qlhun0n7h5ahfslfldc8zhlxgywcavtt', false, false, ...store3.callbacks);
    await promise3;
    assert.strictEqual(store3.state.wallets[0].type, WatchOnlyWallet.type);

    const store4 = createStore();
    const { promise: promise4 } = startImport(
      'zpub6r7jhKKm7BAVx3b3nSnuadY1WnshZYkhK8gKFoRLwK9rF3Mzv28BrGcCGA3ugGtawi1WLb2vyjQAX9ZTDGU5gNk2bLdTc3iEXr6tzQf5TUF',
      false,
      false,
      ...store4.callbacks,
    );
    await promise4;
    assert.strictEqual(store4.state.wallets[0].type, WatchOnlyWallet.type);
  });

  it.skip('can import slip39 wallet', async () => {
    const store = createStore();
    // 2-of-3 slip39 wallet
    // crystal lungs academic acid corner infant satisfy spider alcohol laser golden equation fiscal epidemic infant scholar space findings tadpole belong
    // crystal lungs academic agency class payment actress avoid rebound ordinary exchange petition tendency mild mobile spine robin fancy shelter increase
    // crystal lungs academic always earth satoshi elbow satoshi that pants formal leaf rival texture romantic filter expand regular soul desert
    const { promise } = startImport(
      'crystal lungs academic acid corner infant satisfy spider alcohol laser golden equation fiscal epidemic infant scholar space findings tadpole belong\n' +
        'crystal lungs academic agency class payment actress avoid rebound ordinary exchange petition tendency mild mobile spine robin fancy shelter increase',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, SLIP39SegwitP2SHWallet.type);
  });

  it('can import slip39 wallet with password', async () => {
    const store = createStore('BlueWallet');
    // 2-of-3 slip39 wallet
    // crystal lungs academic acid corner infant satisfy spider alcohol laser golden equation fiscal epidemic infant scholar space findings tadpole belong
    // crystal lungs academic agency class payment actress avoid rebound ordinary exchange petition tendency mild mobile spine robin fancy shelter increase
    // crystal lungs academic always earth satoshi elbow satoshi that pants formal leaf rival texture romantic filter expand regular soul desert
    const { promise } = startImport(
      'crystal lungs academic acid corner infant satisfy spider alcohol laser golden equation fiscal epidemic infant scholar space findings tadpole belong\n' +
        'crystal lungs academic agency class payment actress avoid rebound ordinary exchange petition tendency mild mobile spine robin fancy shelter increase',
      true,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, SLIP39SegwitBech32Wallet.type);
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'grs1q5k23fle53w8a3982m82e9f6hqlnrh3mvfpe3rr');
  });

  it('can import watch-only Cobo vault export', async () => {
    const store = createStore();
    const { promise } = startImport(
      '{"ExtPubKey":"zpub6riZchHnrWzhhZ3Z4dhCJmesGyafMmZBRC9txhnidR313XJbcv4KiDubderKHhL7rMsqacYd82FQ38e4whgs8Dg7CpsxX3dSGWayXrNBr5H","MasterFingerprint":"7D2F0272","AccountKeyPath":"84\'\\/17\'\\/0\'","CoboVaultFirmwareVersion":"2.6.1(BTC-Only)"}',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, WatchOnlyWallet.type);
    assert.strictEqual(store.state.wallets[0].getDerivationPath(), "m/84'/17'/0'");
    assert.strictEqual(store.state.wallets[0].getMasterFingerprintHex(), '7d2f0272');
  });

  it('can import watch-only Cobo vault export 2', async () => {
    const store = createStore();
    const { promise } = startImport(
      `[{"ExtPubKey":"zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AHsbxPu","MasterFingerprint":"73C5DA0A","AccountKeyPath":"m/84'/17'/0'"},{"ExtPubKey":"ypub6Ww3ibxVfGzLrAH1PNcjyAWenMTbbAosGNB6VvmSEgytSER9azLDWCxoJwW7Ke7icmizBMXrzBx9979FfaHxHcrArf3zbeJJJUZPf6zU4Ru","MasterFingerprint":"73C5DA0A","AccountKeyPath":"m/49'/0'/0'"},{"ExtPubKey":"xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39QFUjw4","MasterFingerprint":"73C5DA0A","AccountKeyPath":"m/44'/17'/0'"}]`,
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, WatchOnlyWallet.type);
    assert.strictEqual(store.state.wallets[0].getDerivationPath(), "m/84'/17'/0'");
    assert.strictEqual(store.state.wallets[0].getMasterFingerprintHex(), '73c5da0a');
    assert.strictEqual(
      store.state.wallets[0].getSecret(),
      'zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AHsbxPu',
    );

    assert.strictEqual(store.state.wallets[1].type, WatchOnlyWallet.type);
    assert.strictEqual(store.state.wallets[1].getDerivationPath(), "m/49'/17'/0'");
    assert.strictEqual(store.state.wallets[1].getMasterFingerprintHex(), '73c5da0a');
    assert.strictEqual(
      store.state.wallets[1].getSecret(),
      'ypub6Ww3ibxVfGzLrAH1PNcjyAWenMTbbAosGNB6VvmSEgytSER9azLDWCxoJwW7Ke7icmizBMXrzBx9979FfaHxHcrArf3zbeJJJUZPf6zU4Ru',
    );

    assert.strictEqual(store.state.wallets[2].type, WatchOnlyWallet.type);
    assert.strictEqual(store.state.wallets[2].getDerivationPath(), "m/44'/17'/0'");
    assert.strictEqual(store.state.wallets[2].getMasterFingerprintHex(), '73c5da0a');
    assert.strictEqual(
      store.state.wallets[2].getSecret(),
      'xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39QFUjw4',
    );
  });

  it('can import watch-only Keystone vault export', async () => {
    const store = createStore();
    const { promise } = startImport(
      '{"ExtPubKey":"zpub6qT7amLcp2exr4mU4AhXZMjD9CFkopECVhUxc9LHW8pNsJG2B9ogs5sFbGZpxEeT5TBjLmc7EFYgZA9EeWEM1xkJMFLefzZc8eigREDQF9H","MasterFingerprint":"01EBDA7D","AccountKeyPath":"m/84\'/17\'/0\'"}',
      false,
      false,
      ...store.callbacks,
    );
    await promise;
    assert.strictEqual(store.state.wallets[0].type, WatchOnlyWallet.type);
    assert.strictEqual(store.state.wallets[0].getDerivationPath(), "m/84'/17'/0'");
  });

  it('can import BIP39 wallets with truncated words', async () => {
    // 12 words
    const store1 = createStore();
    const { promise: promise1 } = startImport(
      'trip ener cloc puls hams ghos inha crow inju vibr seve chro',
      false,
      false,
      ...store1.callbacks,
    );
    await promise1;
    assert.strictEqual(
      store1.state.wallets[0].getSecret(),
      'trip energy clock pulse hamster ghost inhale crowd injury vibrant seven chronic',
    );

    // 16 words
    const store2 = createStore();
    const { promise: promise2 } = startImport(
      'docu gosp razo chao nort ches nomi fati swam firs deca boy icon virt gap prep seri anch',
      false,
      false,
      ...store2.callbacks,
    );
    await promise2;
    assert.strictEqual(
      store2.state.wallets[0].getSecret(),
      'document gospel razor chaos north chest nominee fatigue swamp first decade boy icon virtual gap prepare series anchor',
    );

    // 24 words
    const store3 = createStore();
    const { promise: promise3 } = startImport(
      'rece own flig sent tide hood sile bunk deri mana wink belt loud apol mons pill raw gate hurd matc nigh wish todd achi',
      false,
      false,
      ...store3.callbacks,
    );
    await promise3;
    assert.strictEqual(
      store3.state.wallets[0].getSecret(),
      'receive own flight sentence tide hood silent bunker derive manage wink belt loud apology monster pill raw gate hurdle match night wish toddler achieve',
    );
  });

  it('can import BIP47 wallet that only has notification transaction', async () => {
    if (!process.env.BIP47_HD_MNEMONIC) {
      console.error('process.env.BIP47_HD_MNEMONIC not set, skipped');
      return;
    }

    const store = createStore('1');
    const { promise } = startImport(process.env.BIP47_HD_MNEMONIC.split(':')[0], true, false, ...store.callbacks);
    await promise;
    assert.strictEqual(store.state.wallets[0].type, HDLegacyP2PKHWallet.type);
    assert.strictEqual(store.state.wallets[1].type, HDSegwitBech32Wallet.type);
    assert.strictEqual(store.state.wallets.length, 2);
  });

  it('can import coldcard mk4 descriptor.txt', async () => {
    const store = createStore();
    const { promise } = startImport(
      fs.readFileSync('tests/unit/fixtures/coldcardmk4/descriptor.txt').toString('utf8'),
      false,
      false,
      ...store.callbacks,
    );
    await promise;

    assert.strictEqual(store.state.wallets.length, 1);
    assert.strictEqual(store.state.wallets[0].type, WatchOnlyWallet.type);
    assert.strictEqual(store.state.wallets[0].getMasterFingerprintHex(), '086ee178');
    assert.strictEqual(store.state.wallets[0].getDerivationPath(), "m/84'/0'/0'");
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'bc1q5y4r767v5fzx74ez4nw36hjqrhr4ayeyut5px6');
  });

  it('can import coldcard mk4 new-wasabi.json', async () => {
    const store = createStore();
    const { promise } = startImport(
      fs.readFileSync('tests/unit/fixtures/coldcardmk4/new-wasabi.json').toString('utf8'),
      false,
      false,
      ...store.callbacks,
    );
    await promise;

    assert.strictEqual(store.state.wallets.length, 1);
    assert.strictEqual(store.state.wallets[0].type, WatchOnlyWallet.type);
    assert.strictEqual(store.state.wallets[0].getMasterFingerprintHex(), '086ee178');
    assert.strictEqual(store.state.wallets[0].getDerivationPath(), "m/84'/0'/0'");
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'bc1q5y4r767v5fzx74ez4nw36hjqrhr4ayeyut5px6');
  });

  it('can import coldcard mk4 sparrow-export.json', async () => {
    const store = createStore();
    const { promise } = startImport(
      fs.readFileSync('tests/unit/fixtures/coldcardmk4/sparrow-export.json').toString('utf8'),
      false,
      false,
      ...store.callbacks,
    );
    await promise;

    assert.strictEqual(store.state.wallets.length, 1);
    assert.strictEqual(store.state.wallets[0].type, WatchOnlyWallet.type);
    assert.strictEqual(store.state.wallets[0].getMasterFingerprintHex(), '086ee178');
    assert.strictEqual(store.state.wallets[0].getDerivationPath(), "m/84'/0'/0'");
    assert.strictEqual(store.state.wallets[0]._getExternalAddressByIndex(0), 'bc1q5y4r767v5fzx74ez4nw36hjqrhr4ayeyut5px6');
  });
});
