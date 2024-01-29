import assert from 'assert';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FiatUnit } from '../../models/fiatUnit';
import {
  EXCHANGE_RATES_STORAGE_KEY,
  LAST_UPDATED,
  PREFERRED_CURRENCY_STORAGE_KEY,
  getPreferredCurrency,
  initCurrencyDaemon,
  setPreferredCurrency,
} from '../../blue_modules/currency';

jest.setTimeout(90 * 1000);

describe('currency', () => {
  it('fetches exchange rate and saves to AsyncStorage', async () => {
    await initCurrencyDaemon();
    let cur = await AsyncStorage.getItem(EXCHANGE_RATES_STORAGE_KEY);
    cur = JSON.parse(cur);
    assert.ok(Number.isInteger(cur[LAST_UPDATED]));
    assert.ok(cur[LAST_UPDATED] > 0);
    assert.ok(cur.GRS_USD > 0);

    // now, setting other currency as default
    await AsyncStorage.setItem(PREFERRED_CURRENCY_STORAGE_KEY, JSON.stringify(FiatUnit.JPY));
    await initCurrencyDaemon(true);
    cur = JSON.parse(await AsyncStorage.getItem(EXCHANGE_RATES_STORAGE_KEY));
    assert.ok(cur.GRS_JPY > 0);

    // now setting with a proper setter
    await setPreferredCurrency(FiatUnit.EUR);
    await initCurrencyDaemon(true);
    const preferred = await getPreferredCurrency();
    assert.strictEqual(preferred.endPointKey, 'EUR');
    cur = JSON.parse(await AsyncStorage.getItem(EXCHANGE_RATES_STORAGE_KEY));
    assert.ok(cur.GRS_EUR > 0);

    // test Yadio rate source
    // await setPreferredCurrency(FiatUnit.ARS);
    // await initCurrencyDaemon(true);
    // cur = JSON.parse(await AsyncStorage.getItem(EXCHANGE_RATES_STORAGE_KEY));
    // assert.ok(cur.GRS_ARS > 0);

    // test YadioConvert rate source
    // await setPreferredCurrency(FiatUnit.LBP);
    // await initCurrencyDaemon(true);
    // cur = JSON.parse(await AsyncStorage.getItem(EXCHANGE_RATES_STORAGE_KEY));
    // assert.ok(cur.GRS_LBP > 0);

    // test Exir rate source
    // await setPreferredCurrency(FiatUnit.IRT);
    // await initCurrencyDaemon(true);
    // cur = JSON.parse(await AsyncStorage.getItem(EXCHANGE_RATES_STORAGE_KEY));
    // assert.ok(cur.GRS_IRT > 0);
  });
});
