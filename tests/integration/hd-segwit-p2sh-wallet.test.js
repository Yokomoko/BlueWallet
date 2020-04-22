/* global it, jasmine, afterAll, beforeAll */
import { HDSegwitP2SHWallet, HDLegacyBreadwalletWallet, HDLegacyP2PKHWallet } from '../../class';
const bitcoin = require('bitcoinjs-lib');
global.crypto = require('crypto'); // shall be used by tests under nodejs CLI, but not in RN environment
let assert = require('assert');
global.net = require('net'); // needed by Electrum client. For RN it is proviced in shim.js
global.tls = require('tls'); // needed by Electrum client. For RN it is proviced in shim.js
let BlueElectrum = require('../../BlueElectrum'); // so it connects ASAP
jasmine.DEFAULT_TIMEOUT_INTERVAL = 300 * 1000;

afterAll(() => {
  // after all tests we close socket so the test suite can actually terminate
  BlueElectrum.forceDisconnect();
});

beforeAll(async () => {
  // awaiting for Electrum to be connected. For RN Electrum would naturally connect
  // while app starts up, but for tests we need to wait for it
  try {
    await BlueElectrum.waitTillConnected();
  } catch (Err) {
    console.log('failed to connect to Electrum:', Err);
    process.exit(2);
  }
});

it('HD (BIP49) can work with a gap', async function() {
  let hd = new HDSegwitP2SHWallet();
  hd._xpub = 'ypub6XRzrn3HB1tjhhvrHbk1vnXCecZEdXohGzCk3GXwwbDoJ3VBzZ34jNGWbC6WrS7idXrYjjXEzcPDX5VqnHEnuNf5VAXgLfSaytMkJ2rwVqy'; // has gap
  await hd.fetchBalance();

  // for (let c = 0; c < 5; c++) {
  //   console.log('internal', c, hd._getInternalAddressByIndex(c));
  // }

  // for (let c = 0; c < 5; c++) {
  //   console.log('external', c, hd._getExternalAddressByIndex(c));
  // }
  await hd.fetchTransactions();
  assert.ok(hd.getTransactions().length >= 3);
});

it('Segwit HD (BIP49) can fetch more data if pointers to last_used_addr are lagging behind', async function() {
  let hd = new HDSegwitP2SHWallet();
  hd._xpub = 'ypub6WZ2c7YJ1SQ1rBYftwMqwV9bBmybXzETFxWmkzMz25bCf6FkDdXjNgR7zRW8JGSnoddNdUH7ZQS7JeQAddxdGpwgPskcsXFcvSn1JdGVcPQ';
  hd.next_free_change_address_index = 40;
  hd.next_free_address_index = 50;
  await hd.fetchBalance();
  await hd.fetchTransactions();
  assert.strictEqual(hd.getTransactions().length, 153);
});

it('HD (BIP49) can create TX', async () => {
  if (!process.env.HD_MNEMONIC_BIP49) {
    console.error('process.env.HD_MNEMONIC_BIP49 not set, skipped');
    return;
  }
  let hd = new HDSegwitP2SHWallet();
  hd.setSecret(process.env.HD_MNEMONIC_BIP49);
  assert.ok(hd.validateMnemonic());

  await hd.fetchBalance();
  await hd.fetchUtxo();
  assert.ok(typeof hd.utxo[0].confirmations === 'number');
  assert.ok(hd.utxo[0].txid);
  assert.ok(hd.utxo[0].vout !== undefined);
  assert.ok(hd.utxo[0].amount);
  assert.ok(hd.utxo[0].address);
  assert.ok(hd.utxo[0].wif);

  let txNew = hd.createTransaction(
    hd.getUtxo(),
    [{ address: '3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK', value: 500 }],
    1,
    hd._getInternalAddressByIndex(hd.next_free_change_address_index),
  );
  let tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
  assert.strictEqual(
    txNew.tx.toHex(),
    '0200000000010187c9acd9d5714845343b18abaa26cb83299be2487c22da9c0e270f241b4d9cfe0000000017160014a239b6a0cbc7aadc2e77643de36306a6167fad150000008002f40100000000000017a914a3a65daca3064280ae072b9d6773c027b30abace87bb6200000000000017a9140acff2c37ed45110baece4bb9d4dcc0c6309dbbd87024830450221008506675a240c6a49fc5daf0332e44245991a1dfa4c8742d56e81687097e5b98b0220042e4bd3f69a842c7ac4013c2fd01151b098cc9bf889d53959475d6c8b47a32101210202ac3bd159e54dc31e65842ad5f9a10b4eb024e83864a319b27de65ee08b2a3900000000',
  );
  assert.strictEqual(tx.ins.length, 1);
  assert.strictEqual(tx.outs.length, 2);
  assert.strictEqual(tx.outs[0].value, 500);
  assert.strictEqual(tx.outs[1].value, 25275);
  let toAddress = bitcoin.address.fromOutputScript(tx.outs[0].script);
  let changeAddress = bitcoin.address.fromOutputScript(tx.outs[1].script);
  assert.strictEqual('3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK', toAddress);
  assert.strictEqual(hd._getInternalAddressByIndex(hd.next_free_change_address_index), changeAddress);

  //

  txNew = hd.createTransaction(
    hd.getUtxo(),
    [{ address: '3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK', value: 25000 }],
    5,
    hd._getInternalAddressByIndex(hd.next_free_change_address_index),
  );
  tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
  assert.strictEqual(tx.ins.length, 1);
  assert.strictEqual(tx.outs.length, 1);
  toAddress = bitcoin.address.fromOutputScript(tx.outs[0].script);
  assert.strictEqual('3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK', toAddress);

  // testing sendMAX

  const utxo = [
    {
      height: 591862,
      value: 26000,
      address: '3C5iv2Hp6nfuhkfTZibb7GJPkXj367eurD',
      vout: 0,
      txid: '2000000000000000000000000000000000000000000000000000000000000000',
      amount: 26000,
      wif: 'L3fg5Jb6tJDVMvoG2boP4u3CxjX1Er3e7Z4zDALQdGgVLLE8zVUr',
      confirmations: 1,
    },
    {
      height: 591862,
      value: 26000,
      address: '3C5iv2Hp6nfuhkfTZibb7GJPkXj367eurD',
      vout: 0,
      txid: '1000000000000000000000000000000000000000000000000000000000000000',
      amount: 26000,
      wif: 'L3fg5Jb6tJDVMvoG2boP4u3CxjX1Er3e7Z4zDALQdGgVLLE8zVUr',
      confirmations: 1,
    },
    {
      height: 591862,
      value: 26000,
      address: '3C5iv2Hp6nfuhkfTZibb7GJPkXj367eurD',
      vout: 0,
      txid: '0000000000000000000000000000000000000000000000000000000000000000',
      amount: 26000,
      wif: 'L3fg5Jb6tJDVMvoG2boP4u3CxjX1Er3e7Z4zDALQdGgVLLE8zVUr',
      confirmations: 1,
    },
  ];

  txNew = hd.createTransaction(
    utxo,
    [{ address: '3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK' }],
    1,
    hd._getInternalAddressByIndex(hd.next_free_change_address_index),
  );
  tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
  assert.strictEqual(tx.outs.length, 1);
  assert.ok(tx.outs[0].value > 77000);
});

it('Segwit HD (BIP49) can fetch balance with many used addresses in hierarchy', async function() {
  if (!process.env.HD_MNEMONIC_BIP49_MANY_TX) {
    console.error('process.env.HD_MNEMONIC_BIP49_MANY_TX not set, skipped');
    return;
  }

  let hd = new HDSegwitP2SHWallet();
  hd.setSecret(process.env.HD_MNEMONIC_BIP49_MANY_TX);
  assert.ok(hd.validateMnemonic());
  let start = +new Date();
  await hd.fetchBalance();
  let end = +new Date();
  const took = (end - start) / 1000;
  took > 15 && console.warn('took', took, "sec to fetch huge HD wallet's balance");
  assert.strictEqual(hd.getBalance(), 51432);

  await hd.fetchUtxo();
  assert.ok(hd.utxo.length > 0);
  assert.ok(hd.utxo[0].txid);
  assert.ok(hd.utxo[0].vout === 0);
  assert.ok(hd.utxo[0].amount);

  await hd.fetchTransactions();
  assert.strictEqual(hd.getTransactions().length, 107);
});

it('can create a Legacy HD (BIP44)', async function() {
  if (!process.env.HD_MNEMONIC_BREAD) {
    console.error('process.env.HD_MNEMONIC_BREAD not set, skipped');
    return;
  }

  let mnemonic = process.env.HD_MNEMONIC_BREAD;
  let hd = new HDLegacyP2PKHWallet();
  hd.setSecret(mnemonic);
  assert.strictEqual(hd.validateMnemonic(), true);
  assert.strictEqual(hd._getExternalAddressByIndex(0), '12eQ9m4sgAwTSQoNXkRABKhCXCsjm2jdVG');
  assert.strictEqual(hd._getExternalAddressByIndex(1), '1QDCFcpnrZ4yrAQxmbvSgeUC9iZZ8ehcR5');
  assert.strictEqual(hd._getInternalAddressByIndex(0), '1KZjqYHm7a1DjhjcdcjfQvYfF2h6PqatjX');
  assert.strictEqual(hd._getInternalAddressByIndex(1), '13CW9WWBsWpDUvLtbFqYziWBWTYUoQb4nU');
  assert.strictEqual(
    hd.getXpub(),
    'xpub6CQdfC3v9gU86eaSn7AhUFcBVxiGhdtYxdC5Cw2vLmFkfth2KXCMmYcPpvZviA89X6DXDs4PJDk5QVL2G2xaVjv7SM4roWHr1gR4xB3Z7Ps',
  );

  assert.strictEqual(hd._getExternalWIFByIndex(0), 'L1hqNoJ26YuCdujMBJfWBNfgf4Jo7AcKFvcNcKLoMtoJDdDtRq7Q');
  assert.strictEqual(hd._getExternalWIFByIndex(1), 'KyyH4h59iatJWwFfiYPnYkw39SP7cBwydC3xzszsBBXHpfwz9cKb');
  assert.strictEqual(hd._getInternalWIFByIndex(0), 'Kx3QkrfemEEV49Mj5oWfb4bsWymboPdstta7eN3kAzop9apxYEFP');
  assert.strictEqual(hd._getInternalWIFByIndex(1), 'Kwfg1EDjFapN9hgwafdNPEH22z3vkd4gtG785vXXjJ6uvVWAJGtr');
  await hd.fetchBalance();
  assert.strictEqual(hd.balance, 0);
  assert.ok(hd._lastTxFetch === 0);
  await hd.fetchTransactions();
  assert.ok(hd._lastTxFetch > 0);
  assert.strictEqual(hd.getTransactions().length, 4);
  assert.strictEqual(hd.next_free_address_index, 1);
  assert.strictEqual(hd.getNextFreeAddressIndex(), 1);
  assert.strictEqual(hd.next_free_change_address_index, 1);

  for (let tx of hd.getTransactions()) {
    assert.ok(tx.value === 1000 || tx.value === 1377 || tx.value === -1377 || tx.value === -1000);
  }

  // checking that internal pointer and async address getter return the same address
  let freeAddress = await hd.getAddressAsync();
  assert.strictEqual(hd._getExternalAddressByIndex(hd.next_free_address_index), freeAddress);
  assert.strictEqual(hd._getExternalAddressByIndex(hd.getNextFreeAddressIndex()), freeAddress);
});

it('Legacy HD (BIP44) can create TX', async () => {
  if (!process.env.HD_MNEMONIC) {
    console.error('process.env.HD_MNEMONIC not set, skipped');
    return;
  }
  let hd = new HDLegacyP2PKHWallet();
  hd.setSecret(process.env.HD_MNEMONIC);
  assert.ok(hd.validateMnemonic());

  await hd.fetchBalance();
  await hd.fetchUtxo();
  assert.strictEqual(hd.getUtxo().length, 4);
  for (let u of hd.getUtxo()) {
    assert.ok(u.txhex); // as required by  PSBT when adding input
    let tx = bitcoin.Transaction.fromHex(u.txhex);
    assert.strictEqual(tx.getId(), u.txid);
  }

  let txNew = hd.createTransaction(
    hd.getUtxo(),
    [{ address: '3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK', value: 80000 }],
    1,
    hd._getInternalAddressByIndex(hd.next_free_change_address_index),
  );
  let tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
  assert.strictEqual(tx.ins.length, 4);
  assert.strictEqual(tx.outs.length, 2);
  assert.strictEqual(tx.outs[0].value, 80000); // payee
  assert.strictEqual(tx.outs[1].value, 19334); // change
  let toAddress = bitcoin.address.fromOutputScript(tx.outs[0].script);
  let changeAddress = bitcoin.address.fromOutputScript(tx.outs[1].script);
  assert.strictEqual('3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK', toAddress);
  assert.strictEqual(hd._getInternalAddressByIndex(hd.next_free_change_address_index), changeAddress);

  // testing sendMax
  txNew = hd.createTransaction(
    hd.getUtxo(),
    [{ address: '3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK' }],
    1,
    hd._getInternalAddressByIndex(hd.next_free_change_address_index),
  );
  tx = bitcoin.Transaction.fromHex(txNew.tx.toHex());
  assert.strictEqual(tx.ins.length, 4);
  assert.strictEqual(tx.outs.length, 1);
  toAddress = bitcoin.address.fromOutputScript(tx.outs[0].script);
  assert.strictEqual('3GcKN7q7gZuZ8eHygAhHrvPa5zZbG5Q1rK', toAddress);
});

it('HD breadwallet works', async function() {
  if (!process.env.HD_MNEMONIC_BREAD) {
    console.error('process.env.HD_MNEMONIC_BREAD not set, skipped');
    return;
  }
  let hdBread = new HDLegacyBreadwalletWallet();
  hdBread.setSecret(process.env.HD_MNEMONIC_BREAD);

  assert.strictEqual(hdBread.validateMnemonic(), true);
  assert.strictEqual(hdBread._getExternalAddressByIndex(0), '1ARGkNMdsBE36fJhddSwf8PqBXG3s4d2KU');
  assert.strictEqual(hdBread._getInternalAddressByIndex(0), '1JLvA5D7RpWgChb4A5sFcLNrfxYbyZdw3V');

  assert.strictEqual(
    hdBread.getXpub(),
    'xpub68nLLEi3KERQY7jyznC9PQSpSjmekrEmN8324YRCXayMXaavbdEJsK4gEcX2bNf9vGzT4xRks9utZ7ot1CTHLtdyCn9udvv1NWvtY7HXroh',
  );
  await hdBread.fetchBalance();
  assert.strictEqual(hdBread.getBalance(), 123456);

  assert.strictEqual(hdBread.next_free_address_index, 11);
  assert.strictEqual(hdBread.getNextFreeAddressIndex(), 11);
  assert.strictEqual(hdBread.next_free_change_address_index, 118);

  // checking that internal pointer and async address getter return the same address
  let freeAddress = await hdBread.getAddressAsync();
  assert.strictEqual(hdBread._getExternalAddressByIndex(hdBread.next_free_address_index), freeAddress);
  assert.strictEqual(hdBread._getExternalAddressByIndex(hdBread.getNextFreeAddressIndex()), freeAddress);
});
