//
//  WidgetAPI.swift
//  TodayExtension
//
//  Created by Marcos Rodriguez on 11/2/19.

//

import Foundation

var numberFormatter: NumberFormatter {
  let formatter = NumberFormatter()
  formatter.numberStyle = .decimal
  formatter.maximumFractionDigits = 0
  formatter.locale = Locale.current
  return formatter
}

class MarketAPI {

  private static func buildURLString(source: String, endPointKey: String) -> String {
       switch source {
       case "CoinGecko":
           return "https://api.coingecko.com/api/v3/simple/price?ids=groestlcoin&vs_currencies=\(endPointKey.lowercased())"
       default:
           return "https://api.coingecko.com/api/v3/simple/price?ids=groestlcoin&vs_currencies=\(endPointKey.lowercased())"
       }
   }

  private static func handleDefaultData(data: Data, source: String, endPointKey: String, completion: @escaping ((WidgetDataStore?, Error?) -> Void)) {
          guard let json = (try? JSONSerialization.jsonObject(with: data, options: [])) as? Dictionary<String, Any> else {
              completion(nil, CurrencyError(errorDescription: "JSON parsing error."))
              return
          }

          // Parse the JSON based on the source and format the response
          parseJSONBasedOnSource(json: json, source: source, endPointKey: endPointKey, completion: completion)
    }

  private static func parseJSONBasedOnSource(json: Dictionary<String, Any>, source: String, endPointKey: String, completion: @escaping ((WidgetDataStore?, Error?) -> Void)) {
      var latestRateDataStore: WidgetDataStore?

      switch source {
      case "CoinGecko":
          if let bitcoinDict = json["groestlcoin"] as? [String: Any],
             let rateDouble = bitcoinDict[endPointKey.lowercased()] as? Double {
              let lastUpdatedString = ISO8601DateFormatter().string(from: Date())
              latestRateDataStore = WidgetDataStore(rate: String(rateDouble), lastUpdate: lastUpdatedString, rateDouble: rateDouble)
              completion(latestRateDataStore, nil)
          } else {
              completion(nil, CurrencyError(errorDescription: "Data formatting error for source: \(source)"))
          }

      default:
          completion(nil, CurrencyError(errorDescription: "Unsupported data source \(source)"))
      }
  }

  // Handles XML data for BNR source
  private static func handleBNRData(data: Data, completion: @escaping ((WidgetDataStore?, Error?) -> Void)) {
      let parser = XMLParser(data: data)
      let delegate = BNRXMLParserDelegate()
      parser.delegate = delegate
      if parser.parse(), let usdToRonRate = delegate.usdRate {
          let coinGeckoUrl = URL(string: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")!
          URLSession.shared.dataTask(with: coinGeckoUrl) { data, _, error in
              guard let data = data, error == nil else {
                  completion(nil, error ?? CurrencyError())
                  return
              }

              do {
                  if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
                     let bitcoinDict = json["bitcoin"] as? [String: Double],
                     let btcToUsdRate = bitcoinDict["usd"] {
                      let btcToRonRate = btcToUsdRate * usdToRonRate
                      let lastUpdatedString = ISO8601DateFormatter().string(from: Date())
                      let latestRateDataStore = WidgetDataStore(rate: String(btcToRonRate), lastUpdate: lastUpdatedString, rateDouble: btcToRonRate)
                      completion(latestRateDataStore, nil)
                  } else {
                      completion(nil, CurrencyError())
                  }
              } catch {
                  completion(nil, error)
              }
          }.resume()
      } else {
          completion(nil, CurrencyError(errorDescription: "XML parsing error."))
      }
  }

  static func fetchPrice(currency: String, completion: @escaping ((WidgetDataStore?, Error?) -> Void)) {
         let currencyToFiatUnit = fiatUnit(currency: currency)
         guard let source = currencyToFiatUnit?.source, let endPointKey = currencyToFiatUnit?.endPointKey else {
             completion(nil, CurrencyError(errorDescription: "Invalid currency unit or endpoint."))
             return
         }

         let urlString = buildURLString(source: source, endPointKey: endPointKey)
         guard let url = URL(string: urlString) else {
             completion(nil, CurrencyError(errorDescription: "Invalid URL."))
             return
         }

         URLSession.shared.dataTask(with: url) { data, response, error in
             guard let data = data, error == nil else {
                 completion(nil, error ?? CurrencyError(errorDescription: "Network error or data not found."))
                 return
             }

             if source == "BNR" {
                 handleBNRData(data: data, completion: completion)
             } else {
                 handleDefaultData(data: data, source: source, endPointKey: endPointKey, completion: completion)
             }
         }.resume()
     }

}
