import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, View, StyleSheet, Linking } from 'react-native';
import wif from 'wifgrs';
import * as bip39 from 'bip39';
import bip38 from 'bip38grs';
import BIP32Factory from 'bip32grs';
import * as bitcoin from 'groestlcoinjs-lib';
import BlueCrypto from 'react-native-blue-crypto';
import loc from '../loc';
import { BlueSpacing20, BlueCard, BlueText, BlueLoading } from '../BlueComponents';
import {
  SegwitP2SHWallet,
  LegacyWallet,
  HDSegwitP2SHWallet,
  HDSegwitBech32Wallet,
  HDAezeedWallet,
  SLIP39LegacyP2PKHWallet,
} from '../class';
import ecc from '../blue_modules/noble_ecc';
import Button from '../components/Button';
import SafeArea from '../components/SafeArea';
import presentAlert from '../components/Alert';
import * as encryption from '../blue_modules/encryption';
import * as fs from '../blue_modules/fs';
import SaveFileButton from '../components/SaveFileButton';
import * as BlueElectrum from '../blue_modules/BlueElectrum';

const bip32 = BIP32Factory(ecc);

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },
});

export default class Selftest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  onPressImportDocument = async () => {
    try {
      fs.showFilePickerAndReadFile().then(file => {
        if (file && file.data && file.data.length > 0) {
          presentAlert({ message: file.data });
        } else {
          presentAlert({ message: 'Error reading file' });
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  async componentDidMount() {
    let errorMessage = '';
    let isOk = true;

    try {
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        const uniqs = {};
        const w = new SegwitP2SHWallet();
        for (let c = 0; c < 1000; c++) {
          await w.generate();
          if (uniqs[w.getSecret()]) {
            throw new Error('failed to generate unique private key');
          }
          uniqs[w.getSecret()] = 1;
        }
      } else {
        // skipping RN-specific test
      }

      //

      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        await BlueElectrum.ping();
        await BlueElectrum.waitTillConnected();
        const addr4elect = '3JEmL9KXWK3r6cmd2s4HDNWS61FSj4J3SD';
        const electrumBalance = await BlueElectrum.getBalanceByAddress(addr4elect);
        if (electrumBalance.confirmed !== 496360)
          throw new Error('BlueElectrum getBalanceByAddress failure, got ' + JSON.stringify(electrumBalance));

        const electrumTxs = await BlueElectrum.getTransactionsByAddress(addr4elect);
        if (electrumTxs.length !== 1) throw new Error('BlueElectrum getTransactionsByAddress failure, got ' + JSON.stringify(electrumTxs));
      } else {
        // skipping RN-specific test'
      }

      /*
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        const aezeed = new HDAezeedWallet();
        aezeed.setSecret(
          'abstract rhythm weird food attract treat mosquito sight royal actor surround ride strike remove guilt catch filter summer mushroom protect poverty cruel chaos pattern',
        );
        assertStrictEqual(await aezeed.validateMnemonicAsync(), true, 'Aezeed failed');
        assertStrictEqual(aezeed._getExternalAddressByIndex(0), 'grs1qdjj7lhj9lnjye7xq3dzv3r4z0cta294xy78txn', 'Aezeed failed');
      } else {
        // skipping RN-specific test
      }
      */
      let l = new LegacyWallet();
      l.setSecret('L1NwUPQZKwGuPMS9R36rjezZpxKFYLmugFvDQBZCwYFukJ3pzWdb');
      assertStrictEqual(l.getAddress(), 'FbThBimw1krwL3QWf6XEk2Xen6NigyzGBT');
      let utxos = [
        {
          txid: '83b97118cbc82932f5cd6b4232247a6729b9b04975171b500199e2597896d0dd',
          vout: 0,
          value: 100000,
          txhex:
            '01000000000101a518573c27dc6bfc6fcedbed81957d5ea3acbd50b2014dfbda6e7da925a364820100000017160014a3b2e49860a9e7296e2a769ac7bcdca033f4236ffeffffff0150da1100000000001976a9144506c5cf10815e05a318e94fba6be7604d485ccc88ac024730440220315b6ed73ab1d27bef74c38dff0be000357a0a4f932bfa26bdfdc17aa442bb2e022043b0688e8e6a44c56c6745ac0d298278979a45bec3ad3edeebcfab01e566f160012102957467ae6eb2fa89458dff90b0c3a563e01865aa2a4a603c97c9f7c0f4eb7b2600000000',
        },
      ];

      let txNew = l.createTransaction(utxos, [{ value: 90000, address: 'FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs' }], 1, l.getAddress());
      const txBitcoin = bitcoin.Transaction.fromHex(txNew.tx.toHex());
      assertStrictEqual(
        txNew.tx.toHex(),
        '0200000001ddd0967859e29901501b177549b0b929677a2432426bcdf53229c8cb1871b983000000006b483045022100aa45ad57d62c58a871ff22b7151c5ab80a246dec3a088d71b15040070d2a176e022044e2c255b79fd61a995aa40d3f071c90cad4bedb8b3b1defceb81d3ba28d5f73012103a371ab521dfdefefb6bce17ef9d066cbadd33cfb061e2482ac496c065ecddb45ffffffff02905f0100000000001976a914120ad7854152901ebeb269acb6cef20e71b3cf5988ac2e260000000000001976a9144506c5cf10815e05a318e94fba6be7604d485ccc88ac00000000',
      );
      assertStrictEqual(txBitcoin.ins.length, 1);
      assertStrictEqual(txBitcoin.outs.length, 2);
      assertStrictEqual('FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs', bitcoin.address.fromOutputScript(txBitcoin.outs[0].script)); // to address
      assertStrictEqual(l.getAddress(), bitcoin.address.fromOutputScript(txBitcoin.outs[1].script)); // change address

      //

      l = new SegwitP2SHWallet();
      l.setSecret('L1PfnzGXgSH8gVXYs5RbdtGPDQsUobnEih7uHgWSYg9yR17WMBha');
      if (l.getAddress() !== '36CZdzjnFDvdsTvHLqu3Fq64DgTKYqaf4x') {
        throw new Error('failed to generate segwit P2SH address from WIF');
      }

      //

      const wallet = new SegwitP2SHWallet();
      wallet.setSecret('KwZoFNfgbp62JyQY571j639L5cRJxKcx8AUJr4hBvt3hN82Sg5VV');
      assertStrictEqual(wallet.getAddress(), '3J5xoxEVcoWV9Eam9Af2223nNwuTj36HNw');

      utxos = [
        {
          txid: 'a56b44080cb606c0bd90e77fcd4fb34c863e68e5562e75b4386e611390eb860c',
          vout: 0,
          value: 300000,
        },
      ];

      txNew = wallet.createTransaction(utxos, [{ value: 90000, address: 'FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs' }], 1, wallet.getAddress());
      const tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
      assertStrictEqual(
        txNew.tx.toHex(),
        '020000000001010c86eb9013616e38b4752e56e5683e864cb34fcd7fe790bdc006b60c08446ba50000000017160014928d55aca4d60ec0fb6d5b379befdecc59ba4a46ffffffff02905f0100000000001976a914120ad7854152901ebeb269acb6cef20e71b3cf5988aca73303000000000017a914b3d8fb042ed64b6cdf94b556ae46af2f5ca7d05e870247304402203192f04859d3866a58c67b743e6a6c420c8f71ec035b7627df6dfaefa8714e7e02204f7d1bf215aae5caa96a846176e45cb70026a1122b74bca8cd4afd5c2351bfd1012103ba358af62e085e166801cba8865e771a4cfb1bda000c3e053dc54c3ebe0c050f00000000',
      );
      assertStrictEqual(tx.ins.length, 1);
      assertStrictEqual(tx.outs.length, 2);
      assertStrictEqual('FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs', bitcoin.address.fromOutputScript(tx.outs[0].script)); // to address
      assertStrictEqual(bitcoin.address.fromOutputScript(tx.outs[1].script), wallet.getAddress()); // change address

      //

      const data2encrypt = 'really long data string';
      const crypted = encryption.encrypt(data2encrypt, 'password');
      const decrypted = encryption.decrypt(crypted, 'password');

      if (decrypted !== data2encrypt) {
        throw new Error('encryption lib is not ok');
      }

      //
      const mnemonic =
        'honey risk juice trip orient galaxy win situate shoot anchor bounce remind horse traffic exotic since escape mimic ramp skin judge owner topple erode';
      const seed = bip39.mnemonicToSeedSync(mnemonic);
      const root = bip32.fromSeed(seed);

      const path = "m/49'/17'/0'/0/0";
      const child = root.derivePath(path);
      const address = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          pubkey: child.publicKey,
          network: bitcoin.networks.bitcoin,
        }),
        network: bitcoin.networks.bitcoin,
      }).address;

      if (address !== '395AFhKYJCYGGR7P4rwvgqBTTfQukiHrWy') {
        throw new Error('bip49 is not ok');
      }

      //
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        const hd = new HDSegwitP2SHWallet();
        const hashmap = {};
        for (let c = 0; c < 1000; c++) {
          await hd.generate();
          const secret = hd.getSecret();
          if (hashmap[secret]) {
            throw new Error('Duplicate secret generated!');
          }
          hashmap[secret] = 1;
          if (secret.split(' ').length !== 12 && secret.split(' ').length !== 24) {
            throw new Error('mnemonic phrase not ok');
          }
        }

        const hd2 = new HDSegwitP2SHWallet();
        hd2.setSecret(hd.getSecret());
        if (!hd2.validateMnemonic()) {
          throw new Error('mnemonic phrase validation not ok');
        }

        //
        const hd4 = new HDSegwitBech32Wallet();
        hd4._xpub = 'zpub6rkSL2KXiwrQePLhUkf7gNi4XBKuNP4nXA31jxULPsjYaD4EzYHcMFP3SpEwmz4ya5xtuCWXsRVxYHd4XU2YmZe5i6ovvmwbfuSEqRkig23';
        await hd4.fetchBalance();
        // console.log("selftest balance = " + hd4.getBalance());
        if (hd4.getBalance() === undefined) throw new Error('Could not fetch HD Bech32 balance');
        await hd4.fetchTransactions();
        // console.log("selftest tx count = " + hd4.getTransactions().length);
        if (hd4.getTransactions().length === 0) throw new Error('Could not fetch HD Bech32 transactions');
      } else {
        // skipping RN-specific test
      }

      // BlueCrypto test
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        const hex = await BlueCrypto.scrypt('717765727479', '4749345a22b23cf3', 64, 8, 8, 32); // using non-default parameters to speed it up (not-bip38 compliant)
        if (hex.toUpperCase() !== 'F36AB2DC12377C788D61E6770126D8A01028C8F6D8FE01871CE0489A1F696A90')
          throw new Error('react-native-blue-crypto is not ok');
      }

      // bip38 test
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        let callbackWasCalled = false;
        const decryptedKey = await bip38.decryptAsync(
          '6PYWosLNqFysPwJxhifKSoop7dB4xtYQd9cxsAPzeXjF9kjD6Xhtda1nni',
          'qwerty',
          () => (callbackWasCalled = true),
        );
        assertStrictEqual(
          wif.encode(0x80, decryptedKey.privateKey, decryptedKey.compressed),
          'KxqRtpd9vFju297ACPKHrGkgXuberTveZPXbRDiQ3MXZycTMtut3',
          'bip38 failed',
        );
        // bip38 with BlueCrypto doesn't support progress callback
        assertStrictEqual(callbackWasCalled, false, "bip38 doesn't use BlueCrypto");
      }

      // slip39 test
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        const w = new SLIP39LegacyP2PKHWallet();
        w.setSecret(
          'shadow pistol academic always adequate wildlife fancy gross oasis cylinder mustang wrist rescue view short owner flip making coding armed\n' +
            'shadow pistol academic acid actress prayer class unknown daughter sweater depict flip twice unkind craft early superior advocate guest smoking',
        );
        assertStrictEqual(w._getExternalAddressByIndex(0), 'FaRzD8hmNC8BWb82gP4CtTv9WECsjDrzff', 'SLIP39 failed');
      }

      //
      /*
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        assertStrictEqual(await Linking.canOpenURL('https://github.com/Groestlcoin/BlueWallet/'), true, 'Linking can not open https url');
      } else {
        // skipping RN-specific test'
      }
      */
      //

      assertStrictEqual(Buffer.from('00ff0f', 'hex').reverse().toString('hex'), '0fff00');

      //
    } catch (Err) {
      errorMessage += Err;
      isOk = false;
    }

    this.setState({
      isLoading: false,
      isOk,
      errorMessage,
    });
  }

  render() {
    if (this.state.isLoading) {
      return <BlueLoading />;
    }

    return (
      <SafeArea>
        <BlueCard>
          <ScrollView>
            <BlueSpacing20 />

            {(() => {
              if (this.state.isOk) {
                return (
                  <View style={styles.center}>
                    <BlueText testID="SelfTestOk" h4>
                      OK
                    </BlueText>
                    <BlueSpacing20 />
                    <BlueText>{loc.settings.about_selftest_ok}</BlueText>
                  </View>
                );
              } else {
                return (
                  <View style={styles.center}>
                    <BlueText h4 numberOfLines={0}>
                      {this.state.errorMessage}
                    </BlueText>
                  </View>
                );
              }
            })()}
            <BlueSpacing20 />
            <SaveFileButton fileName="bluewallet-selftest.txt" fileContent={'Success on ' + new Date().toUTCString()}>
              <Button title="Test Save to Storage" />
            </SaveFileButton>
            <BlueSpacing20 />
            <Button title="Test File Import" onPress={this.onPressImportDocument} />
          </ScrollView>
        </BlueCard>
      </SafeArea>
    );
  }
}

function assertStrictEqual(actual, expected, message) {
  if (expected !== actual) {
    if (message) throw new Error(message);
    throw new Error('Assertion failed that ' + JSON.stringify(expected) + ' equals ' + JSON.stringify(actual));
  }
}

Selftest.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    goBack: PropTypes.func,
  }),
};
