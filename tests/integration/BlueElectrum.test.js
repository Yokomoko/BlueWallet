/* global it, describe, afterAll, beforeAll, jasmine */
global.net = require('net');
global.tls = require('tls');
let BlueElectrum = require('../../BlueElectrum');
let assert = require('assert');
jasmine.DEFAULT_TIMEOUT_INTERVAL = 150 * 1000;

afterAll(() => {
  // after all tests we close socket so the test suite can actually terminate
  BlueElectrum.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  try {
    await BlueElectrum.waitTillConnected();
  } catch (err) {
    console.log('failed to connect to Electrum:', err);
    process.exit(1);
  }
});

describe('BlueElectrum', () => {
  it('ElectrumClient can test connection', async () => {
    assert.ok(await BlueElectrum.testConnection('electrum1.groestlcoin.org', '50001'));
    // assert.ok(await BlueElectrum.testConnection('electrum1.groestlcoin.org', false, 443));
  });

  it('ElectrumClient can estimate fees', async () => {
    assert.ok((await BlueElectrum.estimateFee(1)) > 1);
  });

  it('ElectrumClient can request server features', async () => {
    const features = await BlueElectrum.serverFeatures();
    // console.warn({features});
    assert.ok(features.server_version);
    assert.ok(features.protocol_min);
    assert.ok(features.protocol_max);
  });

  it('BlueElectrum can do getBalanceByAddress()', async function() {
    let address = '3JEmL9KXWK3r6cmd2s4HDNWS61FSj4J3SD';
    let balance = await BlueElectrum.getBalanceByAddress(address);
    assert.strictEqual(balance.confirmed, 496360);
    assert.strictEqual(balance.unconfirmed, 0);
    assert.strictEqual(balance.addr, address);
  });

  it('BlueElectrum can do getTransactionsByAddress()', async function() {
    let txs = await BlueElectrum.getTransactionsByAddress('grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj');
    assert.strictEqual(txs.length, 1);
    assert.strictEqual(txs[0].tx_hash, 'd02da628a54fce702e52b10e942a1376091e88ae15bc0789cec78e8210a17043');
    assert.strictEqual(txs[0].height, 3048304);
  });

  it('BlueElectrum can do getTransactionsFullByAddress()', async function() {
    let txs = await BlueElectrum.getTransactionsFullByAddress('grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj');
    for (let tx of txs) {
      assert.ok(tx.address === 'grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj');
      assert.ok(tx.txid);
      assert.ok(tx.confirmations);
      assert.ok(!tx.vin);
      assert.ok(!tx.vout);
      assert.ok(tx.inputs);
      assert.ok(tx.inputs[0].addresses.length > 0);
      assert.ok(tx.inputs[0].value > 0);
      assert.ok(tx.outputs);
      assert.ok(tx.outputs[0].value > 0);
      assert.ok(tx.outputs[0].scriptPubKey);
      assert.ok(tx.outputs[0].addresses.length > 0);
    }
  });

  it('BlueElectrum can do multiGetBalanceByAddress()', async function() {
    let balances = await BlueElectrum.multiGetBalanceByAddress([
      'grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj',
      'grs1q49qls5kklryt95g5xx4p6msycpgjp8ramfc9jq',
      'grs1qphjsj69a65q9uv6ehp65hr84zjtffvw9630pcx',
      'grs1qpzynsk7lzlplr4ahgxtg84r335zy9adewmcpg3',
    ]);

    assert.strictEqual(balances.balance, 664270);
    assert.strictEqual(balances.unconfirmed_balance, 0);
    assert.strictEqual(balances.addresses['grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj'].confirmed, 496220);
    assert.strictEqual(balances.addresses['grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj'].unconfirmed, 0);
    assert.strictEqual(balances.addresses['grs1q49qls5kklryt95g5xx4p6msycpgjp8ramfc9jq'].confirmed, 0);
    assert.strictEqual(balances.addresses['grs1q49qls5kklryt95g5xx4p6msycpgjp8ramfc9jq'].unconfirmed, 0);
    assert.strictEqual(balances.addresses['grs1qphjsj69a65q9uv6ehp65hr84zjtffvw9630pcx'].confirmed, 0);
    assert.strictEqual(balances.addresses['grs1qphjsj69a65q9uv6ehp65hr84zjtffvw9630pcx'].unconfirmed, 0);
    assert.strictEqual(balances.addresses['grs1qpzynsk7lzlplr4ahgxtg84r335zy9adewmcpg3'].confirmed, 168050);
    assert.strictEqual(balances.addresses['grs1qpzynsk7lzlplr4ahgxtg84r335zy9adewmcpg3'].unconfirmed, 0);
  });

  it('BlueElectrum can do multiGetUtxoByAddress()', async () => {
    let utxos = await BlueElectrum.multiGetUtxoByAddress(
      [
        'grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj',
        'grs1q49qls5kklryt95g5xx4p6msycpgjp8ramfc9jq',
        'grs1qphjsj69a65q9uv6ehp65hr84zjtffvw9630pcx',
        'grs1qpzynsk7lzlplr4ahgxtg84r335zy9adewmcpg3',
      ],
      3,
    );

    assert.strictEqual(Object.keys(utxos).length, 4);
    assert.strictEqual(
      utxos['grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj'][0].txId,
      'd02da628a54fce702e52b10e942a1376091e88ae15bc0789cec78e8210a17043',
    );
    assert.strictEqual(utxos['grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj'][0].vout, 0);
    assert.strictEqual(utxos['grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj'][0].value, 496220);
    assert.strictEqual(utxos['grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj'][0].address, 'grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj');
  });

  it('ElectrumClient can do multiGetHistoryByAddress()', async () => {
    let histories = await BlueElectrum.multiGetHistoryByAddress(
      [
        'grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj',
        'grs1q49qls5kklryt95g5xx4p6msycpgjp8ramfc9jq',
        'grs1qphjsj69a65q9uv6ehp65hr84zjtffvw9630pcx',
        'grs1qpzynsk7lzlplr4ahgxtg84r335zy9adewmcpg3',
        'grs1qpzynsk7lzlplr4ahgxtg84r335zy9adewmcpg3', // duplicate intended
      ],
      3,
    );

    assert.ok(
      histories['grs1qksxm6s3v7k4x28rsth6ptdteghckqc7jd57gjj'][0]['tx_hash'] ===
        'd02da628a54fce702e52b10e942a1376091e88ae15bc0789cec78e8210a17043',
    );
    assert.ok(
      histories['grs1qpzynsk7lzlplr4ahgxtg84r335zy9adewmcpg3'][0]['tx_hash'] ===
        'c234a9c73c533284b63e24a670b381e218c888c62a0d218b871c45684f544ec9',
    );
    assert.ok(Object.keys(histories).length === 4);
  });

  it('ElectrumClient can do multiGetTransactionByTxid()', async () => {
    let txdatas = await BlueElectrum.multiGetTransactionByTxid(
      [
        'd02da628a54fce702e52b10e942a1376091e88ae15bc0789cec78e8210a17043',
        '042c9e276c2d06b0b84899771a7f218af90dd60436947c49a844a05d7c104b26',
        '2cf439be65e7cc7c6e4db721b1c8fcb1cd95ff07cde79a52a73b3d15a12b2eb6',
        'c234a9c73c533284b63e24a670b381e218c888c62a0d218b871c45684f544ec9',
        'c234a9c73c533284b63e24a670b381e218c888c62a0d218b871c45684f544ec9', // duplicate intended
      ],
      3,
    );

    assert.ok(
      txdatas['d02da628a54fce702e52b10e942a1376091e88ae15bc0789cec78e8210a17043'].txid ===
        'd02da628a54fce702e52b10e942a1376091e88ae15bc0789cec78e8210a17043',
    );
    assert.ok(
      txdatas['c234a9c73c533284b63e24a670b381e218c888c62a0d218b871c45684f544ec9'].txid ===
        'c234a9c73c533284b63e24a670b381e218c888c62a0d218b871c45684f544ec9',
    );
    assert.ok(txdatas['c234a9c73c533284b63e24a670b381e218c888c62a0d218b871c45684f544ec9'].size);
    assert.ok(txdatas['c234a9c73c533284b63e24a670b381e218c888c62a0d218b871c45684f544ec9'].vin);
    assert.ok(txdatas['c234a9c73c533284b63e24a670b381e218c888c62a0d218b871c45684f544ec9'].vout);
    assert.ok(txdatas['c234a9c73c533284b63e24a670b381e218c888c62a0d218b871c45684f544ec9'].blocktime);
    assert.ok(Object.keys(txdatas).length === 4);
  });

  it('multiGetTransactionByTxid() can work with big batches', async () => {
    // eslint-disable-next-line
    let vinTxids = ["063094fd5303c1f461e88ac1e654459a20715d108a35de677c39f8bb1f3a115f",
      "1f18dc7f1d44b4dd2f2d5c511c981cb707dc8a2ba1a88b9ea10b14b9d07bac58",
      "aff5ba0f3b9a1d4d8af05ef86aa2ec5f4262830e7dab0eb4ea65eb50a72f0e2f",
      "d3c474f883ca895542242ef9b1c253746ed8970b362e0595bd4fb716e2484cdd",
      "a33d863c4ff7d8e0718575973d8d96484b2cf06823b079eac3ec41a4f1956019",
      "cbb135b9f61434b3f5dafb2ff1f86e3b0dee033f2fb828df08ad6d936501e7c7",
      "5b0f9bda166d194688a87c31a252dc30452b9f33b0e8e43ebf93081b178f8cd3",
      "c69bb07f076dac74353c4529a6447d9db0391cd677e9dbd092d4bae55888ec96",
      "e6aa2a2a047c54b099bbb79badcc37c052347ac044538b38585cb695dbce37ff",
      "c5b0f74d6ef75c9dd4d824780a433da183cd714c315c84b87eb4b8e5907450d2",
      "480ba7b00d527e4228f3112271ed71c270a202378fe33b6f2877263e9cfb44fa",
      "ef6883158692221913fc0eb3d4411bd7f2be568b1e8587a6460301f1c26cca6e",
      "786e2ea59907fbf3c6b020c6dac5064fc6d4cf1453e3632dd16bcecbb41ecdf2",
      "744cd20d6d36e6a61e19952b00569173d35e5aa977d201124f28f74ba6d21151",
      "7cb77edb8c3e85ddbe6bbe10cc6e8264aece3b518ab2ed9855cf8d683b291ab9",
      "1c6bc43cecd635cb0d05bdd0d0a71067d222334ce03f1a16604f51609b9c12b0",
      "9376198fa2fdd6b3edcbd9cee6fab57492be75d172ec3c2ac54962ebdcefa1f9",
      "7fc65dc0c1134d5e704947c2fd75c4a7df450153a1063f3e7846409fd053cdef",
      "bca70d89229fb8af301864107e05f01976788b329bd7ae0da6347b9f5f293d6f",
      "b770c524453c1a94ef040198ce8526831e3df88d17b116b9a226eb67ddb2ec3c",
      "b44447956583ef038ac7299442e381dec1bd6cf58b3f866359b7573d1ad0f70f",
      "33d3f54ce38db2bf8ba4503c395aa59e69cef370091db8ab1d960e11dc23e895",
      "c2a8be9340a94a0041a53721050b5142d4bf87abd7c3c970808aad061d4b0af0",
      "e3eaa41ae2dafc5ffe7a2fa43bc3493e3df2f8be85063c7231f1d0dd40cb215c",
      "27307b282db60f2d188464b5540ff9fa83a50f430998c292a33de3f3bb0447c9",
      "3fd026b475f07b02617a2bb79bca56c8335ba29092b0628fb44e3d1318d2d2d8",
      "e2ff5a0efe5454118d8aa279292ebc37dbcddc05bc5b949912b6225c6f271c18",
      "d0e243147f29dbc94b45961e4c79700dc0c07942d2651154106de452304d45d6",
      "712507bbe69e7ed9c647ad9e47a108309257aadda0f32b339292ebb8f2a49eaf",
      "6e689a4f55393b01b2f6174aff201e4641f32f94c227ee3d7d11ef1f06d66344",
      "c5dda15b5d1d4332dc4975874fc95294b8605ec0a74612cb3071a9e5e6389e88",
      "063094fd5303c1f461e88ac1e654459a20715d108a35de677c39f8bb1f3a115f",
      "fd568a4a665d0492da34a8c9d5942fa4cd24fa10e7104f40e92eb0cf47d0f143",
      "119f14fcc32b3199a597362efe012c424de29de9cfb10eab5797810b882bf8ec",
      "56c5501b7d996713671934bbaaa3289d75543dac17b7ac9c3aeaabb3b0e99eeb",
      "aba4bd7c54e8fc1b06b61ba793e894554008b98cdbf23dfb6c3ba24c0cadb995",
      "968c84b796a7533d551b665b1727c7b63452b554977b303377c48c4187b8b2e8",
      "bb0138cba362207ab347a2a7e1adfd4e29c0f8d3adf8785da964a0f61b0fbe9d",
      "c234a9c73c533284b63e24a670b381e218c888c62a0d218b871c45684f544ec9",
      "d02da628a54fce702e52b10e942a1376091e88ae15bc0789cec78e8210a17043",];
    let vintxdatas = await BlueElectrum.multiGetTransactionByTxid(vinTxids);
    assert.ok(vintxdatas['968c84b796a7533d551b665b1727c7b63452b554977b303377c48c4187b8b2e8']);
  });

  it.skip('multiGetTransactionByTxid() can work with huge tx', async () => {
    // electrum cant return verbose output because of "response too large (over 1,000,000 bytes"
    // for example:
    // echo '[{"jsonrpc":"2.0","method":"blockchain.transaction.get","params":["484a11c5e086a281413b9192b4f60c06abf745f08c2c28c4b4daefe6df3b9e5c", true],"id":1}]' | nc bitkoins.nl  50001 -i 1
    // @see https://electrumx.readthedocs.io/en/latest/protocol-methods.html#blockchain-transaction-get
    //
    // possible solution: fetch it without verbose and decode locally. unfortunatelly it omits such info as confirmations, time etc
    // so whoever uses it should be prepared for this.
    // tbh consumer wallets dont usually work with such big txs, so probably we dont need it
    let txdatas = await BlueElectrum.multiGetTransactionByTxid(['484a11c5e086a281413b9192b4f60c06abf745f08c2c28c4b4daefe6df3b9e5c']);
    assert.ok(txdatas['484a11c5e086a281413b9192b4f60c06abf745f08c2c28c4b4daefe6df3b9e5c']);
  });

  it('ElectrumClient can do multiGetHistoryByAddress() to obtain txhex', async () => {
    let txdatas = await BlueElectrum.multiGetTransactionByTxid(
      ['7fc65dc0c1134d5e704947c2fd75c4a7df450153a1063f3e7846409fd053cdef'],
      3,
      false,
    );

    assert.strictEqual(
      txdatas['7fc65dc0c1134d5e704947c2fd75c4a7df450153a1063f3e7846409fd053cdef'],
      '020000000001016f3d295f9f7b34a60daed79b328b787619f0057e10641830afb89f22890da7bc0000000000feffffff0226fa25010000000016001468dbccf9102b9bc1fa11855dbfc40bf9d616bfbba08601000000000022002076330e00e9d04d7708cae57d01f818e6ff4e068b4873c474defaaac705be23060247304402203e5599d40b564bb57db60d3997f6f797167eb05d69a1cf702d8e0be7eb243b7a022061c6c13a1266b55efcd2b09ce445333852a247ce6127ec4ad25d93aa8b1a18070121039f9616e13a10d7d9de4d6fb0ee41d08e39c56695c473dbb86dfff1388a3d441a00000000',
    );
  });
});
