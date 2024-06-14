package org.groestlcoin.bluewallet;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;

public class MarketAPI {

    private static final String HARD_CODED_JSON = "{\n" +
            "    \"USD\": {\n" +
            "        \"endPointKey\": \"USD\",\n" +
            "        \"locale\": \"en-US\",\n" +
            "        \"source\": \"Kraken\",\n" +
            "        \"symbol\": \"$\",\n" +
            "        \"country\": \"United States (US Dollar)\"\n" +
            "    }\n" +
            "}";

    public static String fetchPrice(String currency) {
        try {
            JSONObject json = new JSONObject(HARD_CODED_JSON);
            JSONObject currencyInfo = json.getJSONObject(currency);
            String source = currencyInfo.getString("source");
            String endPointKey = currencyInfo.getString("endPointKey");

            String urlString = buildURLString(source, endPointKey);
            URI uri = new URI(urlString);
            URL url = uri.toURL();
            HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
            urlConnection.setRequestMethod("GET");
            urlConnection.connect();

            int responseCode = urlConnection.getResponseCode();
            if (responseCode != 200) {
                return null;
            }

            InputStreamReader reader = new InputStreamReader(urlConnection.getInputStream());
            StringBuilder jsonResponse = new StringBuilder();
            int read;
            char[] buffer = new char[1024];
            while ((read = reader.read(buffer)) != -1) {
                jsonResponse.append(buffer, 0, read);
            }

            return parseJSONBasedOnSource(jsonResponse.toString(), source, endPointKey);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private static String buildURLString(String source, String endPointKey) {
        switch (source) {
            case "CoinGecko":
                return "https://api.coingecko.com/api/v3/simple/price?ids=groestlcoin&vs_currencies=" + endPointKey.toLowerCase();
            default:
                return "https://api.coingecko.com/api/v3/simple/price?ids=groestlcoin&vs_currencies=" + endPointKey.toLowerCase();
        }
    }

    private static String parseJSONBasedOnSource(String jsonString, String source, String endPointKey) {
        try {
            JSONObject json = new JSONObject(jsonString);
            switch (source) {
                case "CoinGecko":
                    JSONObject bitcoinDict = json.getJSONObject("groestlcoin");
                    return bitcoinDict.getString(endPointKey.toLowerCase());
                default:
                    return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
