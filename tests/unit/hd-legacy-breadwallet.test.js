import assert from 'assert';

import { HDLegacyBreadwalletWallet } from '../../class';

describe('HDLegacyBreadwalletWallet', () => {
  it('Legacy HD Breadwallet works', async () => {
    if (!process.env.HD_MNEMONIC_BREAD) {
      console.error('process.env.HD_MNEMONIC_BREAD not set, skipped');
      return;
    }
    const hdBread = new HDLegacyBreadwalletWallet();
    hdBread.setSecret(process.env.HD_MNEMONIC_BREAD);

    assert.strictEqual(hdBread.validateMnemonic(), true);
    assert.strictEqual(hdBread._getExternalAddressByIndex(0), 'FqBCGc2b9WTMy64NNLfa3YeAELzbvbpKZZ');
    assert.strictEqual(hdBread._getInternalAddressByIndex(0), 'FeKA3yYBybHevK7VU6DgAnaCRwkMKL4QcR');
    hdBread._internal_segwit_index = 2;
    hdBread._external_segwit_index = 2;
    assert.ok(hdBread._getExternalAddressByIndex(0).startsWith('1'));
    assert.ok(hdBread._getInternalAddressByIndex(0).startsWith('1'));
    assert.strictEqual(hdBread._getExternalAddressByIndex(2), 'grs1qh0vtrnjn7zs99j4n6xaadde95ctnnveg25rttj');
    assert.strictEqual(hdBread._getInternalAddressByIndex(2), 'grs1qk9hvkxqsqmps6ex3qawr79rvtg8es4ec0cq44w');

    assert.strictEqual(hdBread._getDerivationPathByAddress('FqBCGc2b9WTMy64NNLfa3YeAELzbvbpKZZ'), "m/0'/0/0");
    assert.strictEqual(hdBread._getDerivationPathByAddress('grs1qk9hvkxqsqmps6ex3qawr79rvtg8es4ec0cq44w'), "m/0'/1/2");

    assert.strictEqual(
      hdBread._getPubkeyByAddress(hdBread._getExternalAddressByIndex(0)).toString('hex'),
      '029ba027f3f0a9fa69ce680a246198d56a3b047108f26791d1e4aa2d10e7e7a29a',
    );
    assert.strictEqual(
      hdBread._getPubkeyByAddress(hdBread._getInternalAddressByIndex(0)).toString('hex'),
      '03074225b31a95af63de31267104e07863d892d291a33ef5b2b32d59c772d5c784',
    );

    assert.strictEqual(
      hdBread.getXpub(),
      'xpub68hPk9CrHimZMBQEja43qWRC2TuXmCDdgZcR5YMebr38XatUEPu2Q2oaBViSMshDcyuMDGkGbTS2aqNHFKdcN1sFWaZgK6SLg84dtMn5LLF',
    );

    assert.ok(hdBread.getAllExternalAddresses().includes('FqBCGc2b9WTMy64NNLfa3YeAELzbvbpKZZ'));
    assert.ok(hdBread.getAllExternalAddresses().includes('grs1qh0vtrnjn7zs99j4n6xaadde95ctnnveg25rttj'));
  });

  it('Can use french seed', async () => {
    const hdBread = new HDLegacyBreadwalletWallet();
    hdBread.setSecret('abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abaisser abeille');
    assert.strictEqual(hdBread.validateMnemonic(), true);
    assert.strictEqual(hdBread._getExternalAddressByIndex(0), 'FnRMSrMW1KwKWwfmbKK644GzC8C9WFfhKV');
  });
});
