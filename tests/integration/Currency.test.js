import assert from 'assert';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FiatUnit } from '../../models/fiatUnit';

jest.setTimeout(90 * 1000);

describe('currency', () => {
  it('fetches exchange rate and saves to AsyncStorage', async () => {
    const currency = require('../../blue_modules/currency');
    await currency.init();
    let cur = await AsyncStorage.getItem(currency.EXCHANGE_RATES);
    cur = JSON.parse(cur);
    assert.ok(Number.isInteger(cur[currency.LAST_UPDATED]));
    assert.ok(cur[currency.LAST_UPDATED] > 0);
    assert.ok(cur.GRS_USD > 0);

    // now, setting other currency as default
    await AsyncStorage.setItem(currency.PREFERRED_CURRENCY, JSON.stringify(FiatUnit.JPY));
    await currency.init(true);
    cur = JSON.parse(await AsyncStorage.getItem(currency.EXCHANGE_RATES));
    assert.ok(cur.GRS_JPY > 0);

    // now setting with a proper setter
    await currency.setPrefferedCurrency(FiatUnit.EUR);
    await currency.init(true);
    const preferred = await currency.getPreferredCurrency();
    assert.strictEqual(preferred.endPointKey, 'EUR');
    cur = JSON.parse(await AsyncStorage.getItem(currency.EXCHANGE_RATES));
    assert.ok(cur.GRS_EUR > 0);

    // test Yadio rate source
    // await currency.setPrefferedCurrency(FiatUnit.ARS);
    // await currency.init(true);
    // cur = JSON.parse(await AsyncStorage.getItem(currency.EXCHANGE_RATES));
    // assert.ok(cur.GRS_ARS > 0);

    // test YadioConvert rate source
    // await currency.setPrefferedCurrency(FiatUnit.LBP);
    // await currency.init(true);
    // cur = JSON.parse(await AsyncStorage.getItem(currency.EXCHANGE_RATES));
    // assert.ok(cur.GRS_LBP > 0);

    // test Exir rate source
    // await currency.setPrefferedCurrency(FiatUnit.IRT);
    // await currency.init(true);
    // cur = JSON.parse(await AsyncStorage.getItem(currency.EXCHANGE_RATES));
    // assert.ok(cur.GRS_IRT > 0);
  });
});
