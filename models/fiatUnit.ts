import untypedFiatUnit from './fiatUnits.json';

export const FiatUnitSource = {
  CoinGecko: 'CoinGecko',
} as const;

const RateExtractors = {
  CoinGecko: async (ticker: string): Promise<number> => {
    let json;
    try {
      const res = await fetch(`https://api.coingecko.com//api/v3/coins/groestlcoin?localization=false&community_data=false&developer_data=false&sparkline=false`);
      json = await res.json();
    } catch (e: any) {
      throw new Error(`Could not update rate for ${ticker}: ${e.message}`);
    }
    let rate = json?.market_data?.current_price?.[ticker.toLowerCase()]; // eslint-disable-line
    if (!rate) throw new Error(`Could not update rate for ${ticker}: data is wrong`);

    const parsedRate = Number(rate);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      throw new Error(`Could not update rate for ${ticker}: data is wrong`);
    }

    return parsedRate;
  },
} as const;

export type TFiatUnit = {
  endPointKey: string;
  symbol: string;
  locale: string;
  country: string;
  source: 'CoinGecko';
};

export type TFiatUnits = {
  [key: string]: TFiatUnit;
};

export const FiatUnit = untypedFiatUnit as TFiatUnits;

export type FiatUnitType = {
  endPointKey: string;
  symbol: string;
  locale: string;
  country: string;
  source: keyof typeof FiatUnitSource;
};

export async function getFiatRate(ticker: string): Promise<number> {
  return await RateExtractors[FiatUnit[ticker].source](ticker);
}
