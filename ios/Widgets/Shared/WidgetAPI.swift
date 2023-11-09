//
//  WidgetAPI.swift
//  TodayExtension
//
//  Created by Marcos Rodriguez on 11/2/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation

struct CurrencyError: LocalizedError {
  var errorDescription: String = "Failed to parse response"
}

var numberFormatter: NumberFormatter {
  let formatter = NumberFormatter()
  formatter.numberStyle = .decimal
  formatter.maximumFractionDigits = 0
  formatter.locale = Locale.current
  return formatter
}

class WidgetAPI {
  static func fetchPrice(currency: String, completion: @escaping ((WidgetDataStore?, Error?) -> Void)) {
    let currencyToFiatUnit = fiatUnit(currency: currency)
    guard let source = currencyToFiatUnit?.source, let endPointKey = currencyToFiatUnit?.endPointKey else { return }

    var urlString: String
    switch source {
    case "CoinGecko":
      urlString = "https://api.coingecko.com/api/v3/simple/price?ids=groestlcoin&vs_currencies=\(endPointKey.lowercased())"
    default:
      urlString = "https://api.coingecko.com/api/v3/coins/groestlcoin?localization=false&community_data=false&developer_data=false&sparkline=false"
    }

    guard let url = URL(string:urlString) else { return }

    URLSession.shared.dataTask(with: url) { (data, response, error) in
      guard let dataResponse = data,
            let json = (try? JSONSerialization.jsonObject(with: dataResponse, options: .mutableContainers) as? Dictionary<String, Any>),
            error == nil
      else {
        print(error?.localizedDescription ?? "Response Error")
        completion(nil, error)
        return
      }

      var latestRateDataStore: WidgetDataStore?
      switch source {
      case "CoinGecko":
        guard let rateDict = json["groestlcoin"] as? [String: Any],
              let rateDouble = rateDict[endPointKey.lowercased()] as? Double
        else { break }
        let lastUpdatedString = ISO8601DateFormatter().string(from: Date())
        latestRateDataStore = WidgetDataStore(rate: String(rateDouble), lastUpdate: lastUpdatedString, rateDouble: rateDouble)
      default:
        guard let market_data = json["market_data"] as? Dictionary<String, Any>,
              let current_price = market_data["current_price"] as? Dictionary<String, Any>,
              let rateDouble = current_price[endPointKey.lowercased()] as? Double else { break }
              let rateString = String(rateDouble)
              let lastUpdatedString = ISO8601DateFormatter().string(from: Date())
        latestRateDataStore = WidgetDataStore(rate: rateString, lastUpdate: lastUpdatedString, rateDouble: rateDouble)
      }

      if (latestRateDataStore == nil) {
        completion(nil, CurrencyError())
        return
      }

      completion(latestRateDataStore, nil)
    }.resume()
  }

  static func getUserPreferredCurrency() -> String {

    guard let userDefaults = UserDefaults(suiteName: UserDefaultsGroupKey.GroupName.rawValue),
          let preferredCurrency = userDefaults.string(forKey: "preferredCurrency")
    else {
      return "USD"
    }

    if preferredCurrency != WidgetAPI.getLastSelectedCurrency() {
      UserDefaults.standard.removeObject(forKey: WidgetData.WidgetCachedDataStoreKey)
      UserDefaults.standard.removeObject(forKey: WidgetData.WidgetDataStoreKey)
      UserDefaults.standard.synchronize()
    }

    return preferredCurrency
  }

  static func getUserPreferredCurrencyLocale() -> String {
    guard let userDefaults = UserDefaults(suiteName: UserDefaultsGroupKey.GroupName.rawValue),
          let preferredCurrency = userDefaults.string(forKey: "preferredCurrencyLocale")
    else {
      return "en_US"
    }
    return preferredCurrency
  }

  static func getLastSelectedCurrency() -> String {
    guard let userDefaults = UserDefaults(suiteName: UserDefaultsGroupKey.GroupName.rawValue), let dataStore = userDefaults.string(forKey: "currency") else {
      return "USD"
    }

    return dataStore
  }

  static func saveNewSelectedCurrency() {
    UserDefaults.standard.setValue(WidgetAPI.getUserPreferredCurrency(), forKey: "currency")
  }

}
