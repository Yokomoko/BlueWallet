import Frisbee from 'frisbee';

export const FiatUnitSource = Object.freeze({
  CoinGecko: 'CoinGecko',
  Yadio: 'Yadio',
  BitcoinduLiban: 'BitcoinduLiban',
  Exir: 'Exir',
});

const RateExtractors = Object.freeze({
  CoinGecko: async ticker => {
    const api = new Frisbee({ baseURI: 'https://api.coingecko.com' });
    const res = await api.get(`/api/v3/coins/groestlcoin?localization=false&community_data=false&developer_data=false&sparkline=false`);
    if (res.err) throw new Error(`Could not update rate for ${ticker}: ${res.err}`);

    let json;
    try {
      json = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
    } catch (e) {
      throw new Error(`Could not update rate for ${ticker}: ${e.message}`);
    }
    let rate = json?.market_data?.current_price?.[ticker.toLowerCase()]; // eslint-disable-line
    if (!rate) throw new Error(`Could not update rate for ${ticker}: data is wrong`);

    rate = Number(rate);
    if (!(rate >= 0)) throw new Error(`Could not update rate for ${ticker}: data is wrong`);
    return rate;
  },
  Yadio: async ticker => {
    const api = new Frisbee({ baseURI: 'https://api.yadio.io/json' });
    const res = await api.get(`/${ticker}`);
    if (res.err) throw new Error(`Could not update rate for ${ticker}: ${res.err}`);

    let json;
    try {
      json = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
    } catch (e) {
      throw new Error(`Could not update rate for ${ticker}: ${e.message}`);
    }
    let rate = json?.[ticker]?.price;
    if (!rate) throw new Error(`Could not update rate for ${ticker}: data is wrong`);

    rate = Number(rate);
    if (!(rate >= 0)) throw new Error(`Could not update rate for ${ticker}: data is wrong`);
    return rate;
  },
  BitcoinduLiban: async ticker => {
    const api = new Frisbee({ baseURI: 'https://bitcoinduliban.org' });
    const res = await api.get('/api.php?key=lbpusd');
    if (res.err) throw new Error(`Could not update rate for ${ticker}: ${res.err}`);

    let json;
    try {
      json = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
    } catch (e) {
      throw new Error(`Could not update rate for ${ticker}: ${e.message}`);
    }
    let rate = json?.[`BTC/${ticker}`];
    if (!rate) throw new Error(`Could not update rate for ${ticker}: data is wrong`);

    rate = Number(rate);
    if (!(rate >= 0)) throw new Error(`Could not update rate for ${ticker}: data is wrong`);
    return rate;
  },
  Exir: async ticker => {
    const api = new Frisbee({ baseURI: 'https://api.exir.io' });
    const res = await api.get('/v1/ticker?symbol=btc-irt');
    if (res.err) throw new Error(`Could not update rate for ${ticker}: ${res.err}`);

    let json;
    try {
      json = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
    } catch (e) {
      throw new Error(`Could not update rate for ${ticker}: ${e.message}`);
    }
    let rate = json?.last;
    if (!rate) throw new Error(`Could not update rate for ${ticker}: data is wrong`);

    rate = Number(rate);
    if (!(rate >= 0)) throw new Error(`Could not update rate for ${ticker}: data is wrong`);
    return rate;
  },
});

export const FiatUnit = require('./fiatUnit.json');

export async function getFiatRate(ticker) {
  return await RateExtractors[FiatUnit[ticker].source](ticker);
}
