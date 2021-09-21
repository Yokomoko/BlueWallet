//
//  FiatUnit.swift
//  BlueWallet
//
//  Created by Marcos Rodriguez on 11/20/20.
//  Copyright © 2020 BlueWallet. All rights reserved.
//
import Foundation

typealias FiatUnits = [FiatUnit]
struct FiatUnit: Codable {
  let endPointKey: String
  let symbol: String
  let locale: String
  let dataSource: String?
  let rateKey: String?
  
  var rateURL: URL? {
    if let dataSource = dataSource {
         return URL(string: "\(dataSource)/\(endPointKey)")
       } else {
        return URL(string:"https://api.coingecko.com//api/v3/coins/groestlcoin?localization=false&community_data=false&developer_data=false&sparkline=false");
       }
  }
  func currentRate(json: Dictionary<String, Any>) -> WidgetDataStore? {
    if dataSource == nil {
      guard let market_data = json["market_data"] as? Dictionary<String, Any>, 
        let current_price = market_data["current_price"] as? Dictionary<String, Any>, 
        let rateString = current_price[endPointKey.toLowerCase()] as? String, 
        let rateDouble = rateString as? Double else { 
        return nil
      }
      let date = Date()
      let dateFormatter = DateFormatter.dateFormat(fromTemplate: "yyyyMMdd HH:mm:ss", options: 0, locale: Locale.current)
      let lastUpdateString = dateFormatter.string(from: date)
      return WidgetDataStore(rate: rateString, lastUpdate: lastUpdateString, rateDouble: rateDouble)
  } else {
    guard let rateKey = rateKey, 
      let rateDict = json[rateKey] as? [String: Any], 
      let rateDouble = rateDict["price"] as? Double, 
      let lastUpdated = json["timestamp"] as? Int else {
      return nil
    }
    return WidgetDataStore(rate: String(rateDouble), lastUpdate: String(lastUpdated), rateDouble: rateDouble)
    }
  }
}


func fiatUnit(currency: String) -> FiatUnit? {
  guard let file = Bundle.main.path(forResource: "FiatUnits", ofType: "plist") else {
    return nil
  }
  let fileURL: URL = URL(fileURLWithPath: file)
  var fiatUnits: FiatUnits?

  if let data = try? Data(contentsOf: fileURL) {
    let decoder = PropertyListDecoder()
    fiatUnits = try? decoder.decode(FiatUnits.self, from: data)
  }
  return fiatUnits?.first(where: {$0.endPointKey == currency})

}
