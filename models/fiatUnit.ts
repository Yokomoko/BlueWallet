import untypedFiatUnit from './fiatUnits.json';

export const FiatUnitSource = {
  CoinGecko: 'CoinGecko',
  Yadio: 'Yadio',
  BitcoinduLiban: 'BitcoinduLiban',
  Exir: 'Exir',
  wazirx: 'wazirx',
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

    rate = Number(rate);
    if (!(rate >= 0)) throw new Error(`Could not update rate for ${ticker}: data is wrong`);
    return rate;
  },

  Yadio: async (ticker: string): Promise<number> => {
    let json;
    try {
      const res = await fetch(`https://api.yadio.io/json/${ticker}`);
      json = await res.json();
    } catch (e: any) {
      throw new Error(`Could not update rate for ${ticker}: ${e.message}`);
    }
    let rate = json?.[ticker]?.price;
    if (!rate) throw new Error(`Could not update rate for ${ticker}: data is wrong`);

    rate = Number(rate);
    if (!(rate >= 0)) throw new Error(`Could not update rate for ${ticker}: data is wrong`);
    return rate;
  },

  BitcoinduLiban: async (ticker: string): Promise<number> => {
    let json;
    try {
      const res = await fetch('https://bitcoinduliban.org/api.php?key=lbpusd');
      json = await res.json();
    } catch (e: any) {
      throw new Error(`Could not update rate for ${ticker}: ${e.message}`);
    }
    let rate = json?.[`BTC/${ticker}`];
    if (!rate) throw new Error(`Could not update rate for ${ticker}: data is wrong`);

    rate = Number(rate);
    if (!(rate >= 0)) throw new Error(`Could not update rate for ${ticker}: data is wrong`);
    return rate;
  },

  Exir: async (ticker: string): Promise<number> => {
    let json;
    try {
      const res = await fetch('https://api.exir.io/v1/ticker?symbol=btc-irt');
      json = await res.json();
    } catch (e: any) {
      throw new Error(`Could not update rate for ${ticker}: ${e.message}`);
    }
    let rate = json?.last;
    if (!rate) throw new Error(`Could not update rate for ${ticker}: data is wrong`);

    rate = Number(rate);
    if (!(rate >= 0)) throw new Error(`Could not update rate for ${ticker}: data is wrong`);
    return rate;
  },

  wazirx: async (ticker: string): Promise<number> => {
    let json;
    try {
      const res = await fetch(`https://api.wazirx.com/api/v2/tickers/btcinr`);
      json = await res.json();
    } catch (e: any) {
      throw new Error(`Could not update rate for ${ticker}: ${e.message}`);
    }
    let rate = json?.ticker?.buy; // eslint-disable-line
    if (!rate) throw new Error(`Could not update rate for ${ticker}: data is wrong`);

    rate = Number(rate);
    if (!(rate >= 0)) throw new Error(`Could not update rate for ${ticker}: data is wrong`);
    return rate;
  },
} as const;

type FiatUnit = {
  [key: string]: {
    endPointKey: string;
    symbol: string;
    locale: string;
    source: 'CoinDesk' | 'Yadio' | 'Exir' | 'BitcoinduLiban' | 'wazirx';
  };
};
export const FiatUnit = untypedFiatUnit as FiatUnit;

export async function getFiatRate(ticker: string): Promise<number> {
  return await RateExtractors[FiatUnit[ticker].source](ticker);
}
