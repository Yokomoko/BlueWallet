//
//  Handoff.swift
//  BlueWalletWatch Extension
//
//  Created by Admin on 9/27/21.
//  Copyright © 2021 BlueWallet. All rights reserved.
//

import Foundation

enum HandoffIdentifier: String {
  case ReceiveOnchain = "org.groestlcoin.bluewallet123.receiveonchain"
  case Xpub = "org.groestlcoin.bluewallet123.xpub"
  case ViewInBlockExplorer = "org.groestlcoin.bluewallet123.blockexplorer"
}

enum HandOffUserInfoKey: String {
  case ReceiveOnchain = "address"
  case Xpub = "xpub"
}

enum HandOffTitle: String {
  case ReceiveOnchain = "View Address"
  case Xpub = "View XPUB"
}
