import React, { Component } from 'react';
import { ScrollView, View } from 'react-native';
import { BlueLoading, BlueSpacing20, SafeBlueArea, BlueCard, BlueText, BlueNavigationStyle } from '../BlueComponents';
import PropTypes from 'prop-types';
import { SegwitP2SHWallet, LegacyWallet, HDSegwitP2SHWallet, HDSegwitBech32Wallet } from '../class';
const bitcoin = require('groestlcoinjs-lib');
const BlueCrypto = require('react-native-blue-crypto');
let encryption = require('../encryption');
let BlueElectrum = require('../BlueElectrum');

export default class Selftest extends Component {
  static navigationOptions = () => ({
    ...BlueNavigationStyle(),
    title: 'Self test',
  });

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  async componentDidMount() {
    let errorMessage = '';
    let isOk = true;

    try {
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        let uniqs = {};
        let w = new SegwitP2SHWallet();
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
        let addr4elect = '3JEmL9KXWK3r6cmd2s4HDNWS61FSj4J3SD';
        let electrumBalance = await BlueElectrum.getBalanceByAddress(addr4elect);
        if (electrumBalance.confirmed !== 496360)
          throw new Error('BlueElectrum getBalanceByAddress failure, got ' + JSON.stringify(electrumBalance));

        let electrumTxs = await BlueElectrum.getTransactionsByAddress(addr4elect);
        if (electrumTxs.length !== 1) throw new Error('BlueElectrum getTransactionsByAddress failure, got ' + JSON.stringify(electrumTxs));
      } else {
        // skipping RN-specific test'
      }

      //

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
      let txBitcoin = bitcoin.Transaction.fromHex(txNew.tx.toHex());
      console.log(txNew.tx.toHex())
      assertStrictEqual(
        txNew.tx.toHex(),
        '0200000001ddd0967859e29901501b177549b0b929677a2432426bcdf53229c8cb1871b983000000006a47304402201aaa66f8c8ec462c366885a4ba192c48ac985debc60a54768421c80e59558ee4022028f01505c8b78582f4801f646ced4286ad462320d03a3dd1548a233be8a1908e012103a371ab521dfdefefb6bce17ef9d066cbadd33cfb061e2482ac496c065ecddb45ffffffff02905f0100000000001976a914120ad7854152901ebeb269acb6cef20e71b3cf5988ac2f260000000000001976a9144506c5cf10815e05a318e94fba6be7604d485ccc88ac00000000',
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

      let wallet = new SegwitP2SHWallet();
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
      let tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
      assertStrictEqual(
        txNew.tx.toHex(),
        '020000000001010c86eb9013616e38b4752e56e5683e864cb34fcd7fe790bdc006b60c08446ba50000000017160014928d55aca4d60ec0fb6d5b379befdecc59ba4a46ffffffff02905f0100000000001976a914120ad7854152901ebeb269acb6cef20e71b3cf5988ac6f3303000000000017a914b3d8fb042ed64b6cdf94b556ae46af2f5ca7d05e870247304402202195785bcde62bb934d7b0320bd9e054fd0c22f6ad880f5171796d7fda7f47f1022076d33289496cb23f0110072af3b251923f2eb7a98a01da39e96d5da4ec860e06012103ba358af62e085e166801cba8865e771a4cfb1bda000c3e053dc54c3ebe0c050f00000000',
      );
      assertStrictEqual(tx.ins.length, 1);
      assertStrictEqual(tx.outs.length, 2);
      assertStrictEqual('FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs', bitcoin.address.fromOutputScript(tx.outs[0].script)); // to address
      assertStrictEqual(bitcoin.address.fromOutputScript(tx.outs[1].script), wallet.getAddress()); // change address

      //

      const data2encrypt = 'really long data string';
      let crypted = encryption.encrypt(data2encrypt, 'password');
      let decrypted = encryption.decrypt(crypted, 'password');

      if (decrypted !== data2encrypt) {
        throw new Error('encryption lib is not ok');
      }

      //

      let bip39 = require('bip39');
      let mnemonic =
        'honey risk juice trip orient galaxy win situate shoot anchor bounce remind horse traffic exotic since escape mimic ramp skin judge owner topple erode';
      let seed = bip39.mnemonicToSeed(mnemonic);
      let root = bitcoin.bip32.fromSeed(seed);

      let path = "m/49'/17'/0'/0/0";
      let child = root.derivePath(path);
      let address = bitcoin.payments.p2sh({
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
        let hd = new HDSegwitP2SHWallet();
        let hashmap = {};
        for (let c = 0; c < 1000; c++) {
          await hd.generate();
          let secret = hd.getSecret();
          if (hashmap[secret]) {
            throw new Error('Duplicate secret generated!');
          }
          hashmap[secret] = 1;
          if (secret.split(' ').length !== 12 && secret.split(' ').length !== 24) {
            throw new Error('mnemonic phrase not ok');
          }
        }

        let hd2 = new HDSegwitP2SHWallet();
        hd2.setSecret(hd.getSecret());
        if (!hd2.validateMnemonic()) {
          throw new Error('mnemonic phrase validation not ok');
        }

        //

        /* 
        let hd4 = new HDSegwitBech32Wallet();
        hd4._xpub = 'zprvAWgYBBk7JR8Gjj9qZn1mqjxvk7SJE6tLwAcLJfj6Aavip7ATa36jUhYzJHoQJ8fSRuLXbYhNKVCNtjx6aNF6nNFVLmXZwQpruv9ov7JuWdB';
        await hd4.fetchBalance();
        if (hd4.getBalance() !== 0) throw new Error('Could not fetch HD Bech32 balance');
        await hd4.fetchTransactions();
        if (hd4.getTransactions().length !== 0) throw new Error('Could not fetch HD Bech32 transactions');
        */
      } else {
        // skipping RN-specific test
      }

      //

      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        const hex = await BlueCrypto.scrypt('717765727479', '4749345a22b23cf3', 64, 8, 8, 32); // using non-default parameters to speed it up (not-bip38 compliant)
        if (hex.toUpperCase() !== 'F36AB2DC12377C788D61E6770126D8A01028C8F6D8FE01871CE0489A1F696A90')
          throw new Error('react-native-blue-crypto is not ok');
      }

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
      <SafeBlueArea forceInset={{ horizontal: 'always' }} style={{ flex: 1 }}>
        <BlueCard>
          <ScrollView>
            <BlueSpacing20 />

            {(() => {
              if (this.state.isOk) {
                return (
                  <View style={{ alignItems: 'center' }}>
                    <BlueText testID="SelfTestOk" h4>
                      OK
                    </BlueText>
                  </View>
                );
              } else {
                return (
                  <View style={{ alignItems: 'center' }}>
                    <BlueText h4 numberOfLines={0}>
                      {this.state.errorMessage}
                    </BlueText>
                  </View>
                );
              }
            })()}
          </ScrollView>
        </BlueCard>
      </SafeBlueArea>
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
