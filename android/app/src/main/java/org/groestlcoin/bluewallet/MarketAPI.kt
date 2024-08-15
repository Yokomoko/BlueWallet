package org.groestlcoin.bluewallet

import android.content.Context
import android.util.Log
import org.json.JSONObject
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

object MarketAPI {

    private const val TAG = "MarketAPI"

    var baseUrl: String? = null

    fun fetchPrice(context: Context, currency: String): String? {
        return try {
            // Load the JSON data from the assets
            val fiatUnitsJson = context.assets.open("fiatUnits.json").bufferedReader().use { it.readText() }
            val json = JSONObject(fiatUnitsJson)
            val currencyInfo = json.getJSONObject(currency)
            val source = currencyInfo.getString("source")
            val endPointKey = currencyInfo.getString("endPointKey")

            val urlString = buildURLString(source, endPointKey)
            Log.d(TAG, "Fetching price from URL: $urlString")

            val url = URL(urlString)
            val urlConnection = url.openConnection() as HttpURLConnection
            urlConnection.requestMethod = "GET"
            urlConnection.connect()

            val responseCode = urlConnection.responseCode
            if (responseCode != 200) {
                Log.e(TAG, "Failed to fetch price. Response code: $responseCode")
                return null
            }

            val reader = InputStreamReader(urlConnection.inputStream)
            val jsonResponse = StringBuilder()
            val buffer = CharArray(1024)
            var read: Int
            while (reader.read(buffer).also { read = it } != -1) {
                jsonResponse.append(buffer, 0, read)
            }

            parseJSONBasedOnSource(jsonResponse.toString(), source, endPointKey)
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching price", e)
            null
        }
    }

    private fun buildURLString(source: String, endPointKey: String): String {
        return if (baseUrl != null) {
            baseUrl + endPointKey
        } else {
            when (source) {
                "CoinGecko" -> "https://api.coingecko.com/api/v3/simple/price?ids=groestlcoin&vs_currencies=${endPointKey.lowercase()}"
                else -> "https://api.coingecko.com/api/v3/simple/price?ids=groestlcoin&vs_currencies=${endPointKey.lowercase()}"
            }
        }
    }

    private fun parseJSONBasedOnSource(jsonString: String, source: String, endPointKey: String): String? {
        return try {
            val json = JSONObject(jsonString)
            when (source) {
                "CoinGecko" -> json.getJSONObject("groestlcoin").getString(endPointKey.lowercase())
                else -> null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing price", e)
            null
        }
    }
}
