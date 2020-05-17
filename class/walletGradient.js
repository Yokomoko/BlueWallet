import { LegacyWallet } from './legacy-wallet';
import { HDSegwitP2SHWallet } from './hd-segwit-p2sh-wallet';
import { LightningCustodianWallet } from './lightning-custodian-wallet';
import { HDLegacyBreadwalletWallet } from './hd-legacy-breadwallet-wallet';
import { HDLegacyP2PKHWallet } from './hd-legacy-p2pkh-wallet';
import { WatchOnlyWallet } from './watch-only-wallet';
import { HDSegwitBech32Wallet } from './hd-segwit-bech32-wallet';
import { PlaceholderWallet } from './placeholder-wallet';
import { SegwitBech32Wallet } from './segwit-bech32-wallet';
import { HDLegacyElectrumSeedP2PKHWallet } from './hd-legacy-electrum-seed-p2pkh-wallet';
import { HDSegwitElectrumSeedP2WPKHWallet } from './hd-segwit-electrum-seed-p2wpkh-wallet';

export default class WalletGradient {
  static hdSegwitP2SHWallet = ['#00A5BD', '#00618F'];
  static hdSegwitBech32Wallet = ['#00A5BD', '#00618F'];
  static segwitBech32Wallet = ['#00A5BD', '#00618F'];
  static watchOnlyWallet = ['#00A5BD', '#00618F'];
  static legacyWallet = ['#00A5BD', '#00618F'];
  static hdLegacyP2PKHWallet = ['#00A5BD', '#00618F'];
  static hdLegacyBreadWallet = ['#00A5BD', '#00618F'];
  static defaultGradients = ['#00A5BD', '#00618F'];
  static lightningCustodianWallet = ['#00A5BD', '#00618F'];
  static createWallet = ['#eef0f4', '#eef0f4'];

  static gradientsFor(type) {
    let gradient;
    switch (type) {
      case WatchOnlyWallet.type:
        gradient = WalletGradient.watchOnlyWallet;
        break;
      case LegacyWallet.type:
        gradient = WalletGradient.legacyWallet;
        break;
      case HDLegacyP2PKHWallet.type:
      case HDLegacyElectrumSeedP2PKHWallet.type:
        gradient = WalletGradient.hdLegacyP2PKHWallet;
        break;
      case HDLegacyBreadwalletWallet.type:
        gradient = WalletGradient.hdLegacyBreadWallet;
        break;
      case HDSegwitP2SHWallet.type:
        gradient = WalletGradient.hdSegwitP2SHWallet;
        break;
      case HDSegwitBech32Wallet.type:
      case HDSegwitElectrumSeedP2WPKHWallet.type:
        gradient = WalletGradient.hdSegwitBech32Wallet;
        break;
      case LightningCustodianWallet.type:
        gradient = WalletGradient.lightningCustodianWallet;
        break;
      case PlaceholderWallet.type:
        gradient = WalletGradient.watchOnlyWallet;
        break;
      case SegwitBech32Wallet.type:
        gradient = WalletGradient.segwitBech32Wallet;
        break;
      case 'CreateWallet':
        gradient = WalletGradient.createWallet;
        break;
      default:
        gradient = WalletGradient.defaultGradients;
        break;
    }
    return gradient;
  }

  static headerColorFor(type) {
    let gradient;
    switch (type) {
      case WatchOnlyWallet.type:
        gradient = WalletGradient.watchOnlyWallet;
        break;
      case LegacyWallet.type:
        gradient = WalletGradient.legacyWallet;
        break;
      case HDLegacyP2PKHWallet.type:
      case HDLegacyElectrumSeedP2PKHWallet.type:
        gradient = WalletGradient.hdLegacyP2PKHWallet;
        break;
      case HDLegacyBreadwalletWallet.type:
        gradient = WalletGradient.hdLegacyBreadWallet;
        break;
      case HDSegwitP2SHWallet.type:
        gradient = WalletGradient.hdSegwitP2SHWallet;
        break;
      case HDSegwitBech32Wallet.type:
      case HDSegwitElectrumSeedP2WPKHWallet.type:
        gradient = WalletGradient.hdSegwitBech32Wallet;
        break;
      case SegwitBech32Wallet.type:
        gradient = WalletGradient.segwitBech32Wallet;
        break;
      case LightningCustodianWallet.type:
        gradient = WalletGradient.lightningCustodianWallet;
        break;
      case 'CreateWallet':
        gradient = WalletGradient.createWallet;
        break;
      default:
        gradient = WalletGradient.defaultGradients;
        break;
    }
    return gradient[0];
  }
}
