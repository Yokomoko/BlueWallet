import BIP47Factory from '@spsina/bip47';
import ecc from 'tiny-secp256k1';
import assert from 'assert';

import { HDSegwitBech32Wallet, WatchOnlyWallet } from '../../class';
import { ECPairFactory } from 'ecpairgrs';
import * as bitcoin from 'groestlcoinjs-lib';

const ECPair = ECPairFactory(ecc);

describe('Bech32 Segwit HD (BIP84) with BIP47', () => {
  it('should work', async () => {
    const bobWallet = new HDSegwitBech32Wallet();
    // @see https://gist.github.com/SamouraiDev/6aad669604c5930864bd
    bobWallet.setSecret('reward upper indicate eight swift arch injury crystal super wrestle already dentist');

    expect(bobWallet.getBIP47PaymentCode()).toEqual(
      'PM8TJJsC1EW1Fa1KquT9UDrnFfXxUjA4ZhRsoVFg72XXPUcjc5sC1Gp9D32NgpKMGa6RjQKPthBZAuCvXncSLf4v91dEwuc7n5aKB9VUyZh684NUaXVv',
    );

    const bip47 = BIP47Factory(ecc).fromBip39Seed(bobWallet.getSecret(), undefined, '');
    const bobNotificationAddress = bip47.getNotificationAddress();

    expect(bobNotificationAddress).toEqual('FbDERRx7sE5pzFcENr3p43anc2DsDK4mpW'); // our notif address

    assert.ok(!bobWallet.weOwnAddress('FiF33hy7E5C2ee5dxicrq6oWJmNth8EigV')); // alice notif address, we dont own it
  });

  it('getters, setters, flags work', async () => {
    const w = new HDSegwitBech32Wallet();
    await w.generate();

    expect(w.allowBIP47()).toEqual(true);

    expect(w.isBIP47Enabled()).toEqual(false);
    w.switchBIP47(true);
    expect(w.isBIP47Enabled()).toEqual(true);
    w.switchBIP47(false);
    expect(w.isBIP47Enabled()).toEqual(false);

    // checking that derived watch-only does not support that:
    const ww = new WatchOnlyWallet();
    ww.setSecret(w.getXpub());
    expect(ww.allowBIP47()).toEqual(false);
  });

  it('should work (samurai)', async () => {
    if (!process.env.BIP47_HD_MNEMONIC) {
      console.error('process.env.BIP47_HD_MNEMONIC not set, skipped');
      return;
    }

    const w = new HDSegwitBech32Wallet();
    w.setSecret(process.env.BIP47_HD_MNEMONIC.split(':')[0]);
    w.setPassphrase('1');

    expect(w.getBIP47PaymentCode()).toEqual(
      'PM8TJXuZNUtSibuXKFM6bhCxpNaSye6r4px2GXRV5v86uRdH9Raa8ZtXEkG7S4zLREf4ierjMsxLXSFTbRVUnRmvjw9qnc7zZbyXyBstSmjcb7uVcDYF',
    );

    expect(w._getExternalAddressByIndex(0)).toEqual('grs1q07l355j4yd5kyut36vjxn2u60d3dknnpkqe2r9');

    const bip47 = BIP47Factory(ecc).fromBip39Seed(w.getSecret(), undefined, w.getPassphrase());
    const ourNotificationAddress = bip47.getNotificationAddress();

    const publicBip47 = BIP47Factory(ecc).fromPaymentCode(w.getBIP47PaymentCode());
    expect(ourNotificationAddress).toEqual(publicBip47.getNotificationAddress());

    expect(ourNotificationAddress).toEqual('Fit6UfBDWsWy9P9UGTkLLx3AEfzA676Z2u'); // our notif address

    // since we dont do network calls in unit test we cant get counterparties payment codes from our notif address,
    // and thus, dont know collaborative addresses with our payers. lets hardcode our counterparty payment code to test
    // this functionality

    assert.deepStrictEqual(w.getBIP47SenderPaymentCodes(), []);

    w._sender_payment_codes = [
      'PM8TJi1RuCrgSHTzGMoayUf8xUW6zYBGXBPSWwTiMhMMwqto7G6NA4z9pN5Kn8Pbhryo2eaHMFRRcidCGdB3VCDXJD4DdPD2ZyG3ScLMEvtStAetvPMo',
    ];

    assert.deepStrictEqual(w.getBIP47SenderPaymentCodes(), [
      'PM8TJi1RuCrgSHTzGMoayUf8xUW6zYBGXBPSWwTiMhMMwqto7G6NA4z9pN5Kn8Pbhryo2eaHMFRRcidCGdB3VCDXJD4DdPD2ZyG3ScLMEvtStAetvPMo',
    ]);

    assert.ok(w.weOwnAddress('grs1q57nwf9vfq2qsl80q37wq5h0tjytsk95v4ru5sc'));
    const pubkey = w._getPubkeyByAddress('grs1q57nwf9vfq2qsl80q37wq5h0tjytsk95v4ru5sc');
    const path = w._getDerivationPathByAddress('grs1q57nwf9vfq2qsl80q37wq5h0tjytsk95v4ru5sc');
    assert.ok(pubkey);
    assert.ok(path);

    const keyPair2 = ECPair.fromWIF(w._getWIFbyAddress('grs1q57nwf9vfq2qsl80q37wq5h0tjytsk95v4ru5sc') || '');
    const address = bitcoin.payments.p2wpkh({
      pubkey: keyPair2.publicKey,
    }).address;

    assert.strictEqual(address, 'grs1q57nwf9vfq2qsl80q37wq5h0tjytsk95v4ru5sc');
  });

  it('should work (sparrow)', async () => {
    if (!process.env.BIP47_HD_MNEMONIC) {
      console.error('process.env.BIP47_HD_MNEMONIC not set, skipped');
      return;
    }

    const w = new HDSegwitBech32Wallet();
    w.setSecret(process.env.BIP47_HD_MNEMONIC.split(':')[1]);

    assert.strictEqual(
      w.getXpub(),
      'zpub6r4KaQRsLuhHSGx8b9wGHh18UnawBs49jtiDzZYh9DSgKGwD72jWR3v54fkyy1UKVxt9HvCkYHmMAUe2YjKefofWzYp9YD62sUp6nHGA1bj',
    );

    expect(w.getBIP47PaymentCode()).toEqual(
      'PM8TJi1RuCrgSHTzGMoayUf8xUW6zYBGXBPSWwTiMhMMwqto7G6NA4z9pN5Kn8Pbhryo2eaHMFRRcidCGdB3VCDXJD4DdPD2ZyG3ScLMEvtStAetvPMo',
    );

    const bip47 = BIP47Factory(ecc).fromBip39Seed(w.getSecret(), undefined, w.getPassphrase());
    const ourNotificationAddress = bip47.getNotificationAddress();

    const publicBip47 = BIP47Factory(ecc).fromPaymentCode(w.getBIP47PaymentCode());
    expect(ourNotificationAddress).toEqual(publicBip47.getNotificationAddress());

    expect(ourNotificationAddress).toEqual('Fb87MbKEWqgSpEiLnCWfoozC1i8QxUWU8o'); // our notif address
  });
});
