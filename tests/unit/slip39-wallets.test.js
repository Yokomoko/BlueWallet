import assert from 'assert';

import { SLIP39LegacyP2PKHWallet, SLIP39SegwitP2SHWallet, SLIP39SegwitBech32Wallet } from '../../class';

global.crypto = require('crypto');

describe('SLIP39 wallets tests', () => {
  it('can validateMnemonic', async () => {
    const w = new SLIP39LegacyP2PKHWallet();
    // not enought shares
    w.setSecret(
      'shadow pistol academic always adequate wildlife fancy gross oasis cylinder mustang wrist rescue view short owner flip making coding armed',
    );
    assert.strictEqual(w.validateMnemonic(), false);

    // wrong words
    w.setSecret('qweasd ewqasd');
    assert.strictEqual(w.validateMnemonic(), false);
  });

  it('can generate ID', () => {
    const w = new SLIP39LegacyP2PKHWallet();
    // not enought shares
    w.setSecret(
      'shadow pistol academic always adequate wildlife fancy gross oasis cylinder mustang wrist rescue view short owner flip making coding armed',
    );

    assert.ok(w.getID());
  });

  it('SLIP39LegacyP2PKHWallet can generate addresses', async () => {
    const w = new SLIP39LegacyP2PKHWallet();
    // 4. Basic sharing 2-of-3 (128 bits)
    w.setSecret(
      'shadow pistol academic always adequate wildlife fancy gross oasis cylinder mustang wrist rescue view short owner flip making coding armed\n' +
        'shadow pistol academic acid actress prayer class unknown daughter sweater depict flip twice unkind craft early superior advocate guest smoking',
    );

    assert.ok(w.validateMnemonic());
    assert.strictEqual(w._getExternalAddressByIndex(0), 'FaRzD8hmNC8BWb82gP4CtTv9WECsjDrzff');
    assert.strictEqual(w._getExternalAddressByIndex(1), 'FpHVN4UDZPPpWGD2e9eyPzT8EjEv3sPBXU');
    assert.strictEqual(w._getInternalAddressByIndex(0), 'Fg78UxZSZLwKjTdaEVWMgVbQZ7cPpJwSUk');
    assert.strictEqual(w._getInternalAddressByIndex(1), 'FmLHb5jCkNRBECCpKdXRMUTrUAF1Z1FVME');
  });

  it('SLIP39SegwitP2SHWallet can generate addresses', async () => {
    const w = new SLIP39SegwitP2SHWallet();
    // 23. Basic sharing 2-of-3 (256 bits)
    w.setSecret(
      'humidity disease academic always aluminum jewelry energy woman receiver strategy amuse duckling lying evidence network walnut tactics forget hairy rebound impulse brother survive clothes stadium mailman rival ocean reward venture always armed unwrap\n' +
        'humidity disease academic agency actress jacket gross physics cylinder solution fake mortgage benefit public busy prepare sharp friar change work slow purchase ruler again tricycle involve viral wireless mixture anatomy desert cargo upgrade',
    );

    assert.ok(w.validateMnemonic());
    assert.strictEqual(w._getExternalAddressByIndex(0), '3F43u8qRCSt4QiBBtnca8hLQbcsYsxcYRU');
    assert.strictEqual(w._getExternalAddressByIndex(1), '33CvG9K57ZBf5j6fGBAGdWUnUHgpJwz2Zm');
    assert.strictEqual(w._getInternalAddressByIndex(0), '3NmgRGScYS1HB51xXq3mwo3SutbyurU9mJ');
    assert.strictEqual(w._getInternalAddressByIndex(1), '32mMdmYmX2ApWVgkE62FBV6MUvXXVSeC4y');
  });

  it('SLIP39SegwitBech32Wallet can generate addresses', async () => {
    const w = new SLIP39SegwitBech32Wallet();
    // 36. Threshold number of groups and members in each group (256 bits, case 1)
    w.setSecret(
      'wildlife deal ceramic round aluminum pitch goat racism employer miracle percent math decision episode dramatic editor lily prospect program scene rebuild display sympathy have single mustang junction relate often chemical society wits estate\n' +
        'wildlife deal decision scared acne fatal snake paces obtain election dryer dominant romp tactics railroad marvel trust helpful flip peanut theory theater photo luck install entrance taxi step oven network dictate intimate listen\n' +
        'wildlife deal ceramic scatter argue equip vampire together ruin reject literary rival distance aquatic agency teammate rebound false argue miracle stay again blessing peaceful unknown cover beard acid island language debris industry idle\n' +
        'wildlife deal ceramic snake agree voter main lecture axis kitchen physics arcade velvet spine idea scroll promise platform firm sharp patrol divorce ancestor fantasy forbid goat ajar believe swimming cowboy symbolic plastic spelling\n' +
        'wildlife deal decision shadow analysis adjust bulb skunk muscle mandate obesity total guitar coal gravity carve slim jacket ruin rebuild ancestor numerous hour mortgage require herd maiden public ceiling pecan pickup shadow club\n',
    );

    assert.ok(w.validateMnemonic());
    assert.strictEqual(w._getExternalAddressByIndex(0), 'grs1qtzaws76ncxta0jzptucyl9qy9cdp7xuuhkhd63');
    assert.strictEqual(w._getExternalAddressByIndex(1), 'grs1qh7wh0neumy3ke42akmfltndw2skyun4g68ru7x');
    assert.strictEqual(w._getInternalAddressByIndex(0), 'grs1qy5v8rlhxqarmkhdq892up3a895pzznv2p8ff7j');
    assert.strictEqual(w._getInternalAddressByIndex(1), 'grs1qmna0p8qhp6cft4pk7d3wss245fhy43gxaftvv5');
  });
});
