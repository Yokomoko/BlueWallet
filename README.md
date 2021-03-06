# Groestlcoin BlueWallet - A Groestlcoin & Lightning Wallet

[![GitHub tag](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/Groestlcoin/BlueWallet/master/package.json&query=$.version&label=Version)](https://github.com/Groestlcoin/BlueWallet)
[![CircleCI](https://circleci.com/gh/BlueWallet/BlueWallet.svg?style=svg)](https://circleci.com/gh/Groestlcoin/BlueWallet)
[![e2e on master](https://travis-ci.com/BlueWallet/BlueWallet.svg?branch=master)](https://travis-ci.com/Groestlcoin/BlueWallet)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![](https://img.shields.io/github/license/BlueWallet/BlueWallet.svg)

Thin Groestlcoin Wallet.
Built with React Native and Electrum.

[![Appstore](https://bluewallet.io/img/app-store-badge.svg)](https://itunes.apple.com/us/app/bluewallet-bitcoin-wallet/id1376878040?l=ru&ls=1&mt=8)
[![Playstore](https://bluewallet.io/img/play-store-badge.svg)](https://play.google.com/store/apps/details?id=org.groestlcoin.bluewallet)

Website: [bluewallet.io](https://groestlcoin.org)

Community: [telegram group](https://t.me/Groestlcoin)

* Private keys never leave your device
* Lightning Network supported
* SegWit-first. Replace-By-Fee support
* Encryption. Plausible deniability
* And many more [features...](https://bluewallet.io/features.html)


<img src="https://i.imgur.com/hHYJnMj.png" width="100%">


## BUILD & RUN IT

Please refer to the engines field in package.json file for the minimum required versions of Node and npm. It is preferred that you use an even-numbered version of Node as these are LTS versions.

To view the version of Node and npm in your environment, run the following in your console:

```
node --version && npm --version
```

* In your console:

```
git clone https://github.com/Groestlcoin/BlueWallet.git
cd BlueWallet
npm install
``` 

Please make sure that your console is running the most stable versions of npm and node (even-numbered versions).

* To run on Android:

You will now need to either connect an Android device to your computer or run an emulated Android device using AVD Manager which comes shipped with Android Studio. To run an emulator using AVD Manager:

1. Download and run Android Studio
2. Click on "Open an existing Android Studio Project"
3. Open `build.gradle` file under `BlueWallet/android/` folder
4. Android Studio will take some time to set things up. Once everything is set up, go to `Tools` -> `AVD Manager`
5. Click on "Create Virtual Device..." and go through the steps to create a virtual device
6. Launch your newly created virtual device by clicking the `Play` button under `Actions` column

Once you connected an Android device or launched an emulator, run this:

```
npx react-native run-android
```

The above command will build the app and install it. Once you launch the app it will take some time for all of the dependencies to load. Once everything loads up, you should have the built app running.

* To run on iOS:

```
cd ios
pod install
cd ..
npm start ios
```


## TESTS

```bash
npm run test
```

## QA

Builds automated and tested with BrowserStack

<a href="https://www.browserstack.com/"><img src="https://i.imgur.com/syscHCN.png" width="160px"></a>




## MOTIVATION TO BUILD IT

This is a fork of https://github.com/BlueWallet/BlueWallet


## LICENSE

MIT

## WANT TO CONTRIBUTE?

Grab an issue from [the backlog](https://github.com/Groestlcoin/BlueWallet/projects/1), try to start or submit a PR, any doubts we will try to guide you.

Join us at our [telegram group](https://t.me/Groestlcoin) where we hangout :+1:

## Responsible disclosure

Found critical bugs/vulnerabilities? Please email them bluewallet@bluewallet.io
Thanks!
