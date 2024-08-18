import assert from 'assert';

import { LightningCustodianWallet } from '../../class';

jest.setTimeout(200 * 1000);
const baseUri = 'https://lndhub-staging.herokuapp.com';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('LightningCustodianWallet', () => {
  const l1 = new LightningCustodianWallet();
  l1.setBaseURI(baseUri);
  l1.init();

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('issue credentials', async () => {
    assert.ok(l1.refill_addressess.length === 0);
    assert.ok(l1._refresh_token_created_ts === 0);
    assert.ok(l1._access_token_created_ts === 0);
    l1.balance = 'FAKE';

    await l1.createAccount(false);
    await l1.authorize();

    assert.ok(l1.access_token);
    assert.ok(l1.refresh_token);
    assert.ok(l1._refresh_token_created_ts > 0);
    assert.ok(l1._access_token_created_ts > 0);
    console.log(l1.getSecret());
  });

  it('can create, auth and getbtc', async () => {
    assert.ok(l1.refill_addressess.length === 0);
    assert.ok(l1._refresh_token_created_ts === 0);
    assert.ok(l1._access_token_created_ts === 0);
    l1.balance = 'FAKE';

    await l1.createAccount(true);
    await l1.authorize();
    await l1.fetchBtcAddress();
    await l1.fetchBalance();
    await l1.fetchInfo();
    await l1.fetchTransactions();
    await l1.fetchPendingTransactions();

    assert.ok(l1.access_token);
    assert.ok(l1.refresh_token);
    assert.ok(l1._refresh_token_created_ts > 0);
    assert.ok(l1._access_token_created_ts > 0);
    assert.ok(l1.refill_addressess.length > 0);
    assert.ok(l1.balance === 0);
    assert.ok(l1.info_raw);
    assert.ok(l1.pending_transactions_raw.length === 0);
    assert.ok(l1.transactions_raw.length === 0);
    assert.ok(l1.transactions_raw.length === l1.getTransactions().length);
  });

  it('can refresh token', async () => {
    const oldRefreshToken = l1.refresh_token;
    const oldAccessToken = l1.access_token;
    await l1.refreshAcessToken();
    assert.ok(oldRefreshToken !== l1.refresh_token);
    assert.ok(oldAccessToken !== l1.access_token);
    assert.ok(l1.access_token);
    assert.ok(l1.refresh_token);
  });

  it('can use existing login/pass', async () => {
    if (!process.env.BLITZHUB) {
      console.error('process.env.BLITZHUB not set, skipped');
      return;
    }
    const l2 = new LightningCustodianWallet();
    l2.setSecret(process.env.BLITZHUB);
    l2.setBaseURI(baseUri);
    l2.init();
    await l2.authorize();
    await l2.fetchPendingTransactions();
    await l2.fetchTransactions();

    assert.ok(l2.pending_transactions_raw.length === 0);
    assert.ok(l2.transactions_raw.length > 0);
    assert.ok(l2.transactions_raw.length === l2.getTransactions().length);
    for (const tx of l2.getTransactions()) {
      assert.ok(typeof tx.fee !== 'undefined');
      assert.ok(tx.value);
      assert.ok(tx.timestamp);
      assert.ok(tx.description || tx.memo, JSON.stringify(tx));
      assert.ok(!isNaN(tx.value));
      assert.ok(tx.type === 'bitcoind_tx' || tx.type === 'paid_invoice', 'unexpected tx type ' + tx.type);
    }
    await l2.fetchBalance();
    assert.ok(l2.getBalance() > 0);
  });

  it('can decode & check invoice', async () => {
    if (!process.env.BLITZHUB) {
      console.error('process.env.BLITZHUB not set, skipped');
      return;
    }
    const l2 = new LightningCustodianWallet();
    l2.setSecret(process.env.BLITZHUB);
    l2.setBaseURI(baseUri);
    l2.init();
    await l2.authorize();

    let invoice =
      'lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm';
    const decoded = l2.decodeInvoice(invoice);

    assert.ok(decoded.payment_hash);
    assert.ok(decoded.description);
    assert.ok(decoded.num_satoshis);
    assert.strictEqual(parseInt(decoded.num_satoshis, 10) * 1000, parseInt(decoded.num_millisatoshis, 10));

    // checking that bad invoice cant be decoded
    invoice = 'gsom';
    let error = false;
    try {
      l2.decodeInvoice(invoice);
    } catch (Err) {
      error = true;
    }
    assert.ok(error);
  });

  it('decode can handle zero gros but present msats', async () => {
    const l = new LightningCustodianWallet();
    const decoded = l.decodeInvoice(
      'lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm',
    );
    assert.strictEqual(decoded.num_satoshis, '100000');
  });

  it('can decode invoice locally & remotely', async () => {
    if (!process.env.BLITZHUB) {
      console.error('process.env.BLITZHUB not set, skipped');
      return;
    }
    const l2 = new LightningCustodianWallet();
    l2.setSecret(process.env.BLITZHUB);
    l2.setBaseURI(baseUri);
    l2.init();
    await l2.authorize();
    const invoice =
      'lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm';
    const decodedLocally = l2.decodeInvoice(invoice);
    const decodedRemotely = await l2.decodeInvoiceRemote(invoice);
    assert.strictEqual(decodedLocally.destination, decodedRemotely.destination);
    assert.strictEqual(decodedLocally.num_satoshis, decodedRemotely.num_satoshis);
    assert.strictEqual(decodedLocally.timestamp, decodedRemotely.timestamp);
    assert.strictEqual(decodedLocally.expiry, decodedRemotely.expiry);
    assert.strictEqual(decodedLocally.payment_hash, decodedRemotely.payment_hash);
    assert.strictEqual(decodedLocally.description, decodedRemotely.description);
    assert.strictEqual(decodedLocally.cltv_expiry, decodedRemotely.cltv_expiry);
  });

  it('can pay invoice from opennode', async () => {
    if (!process.env.BLITZHUB) {
      console.error('process.env.BLITZHUB not set, skipped');
      return;
    }
    if (!process.env.OPENNODE) {
      console.error('process.env.OPENNODE not set, skipped');
      return;
    }

    const response = await fetch('https://api.opennode.co/v1/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.OPENNODE,
      },
      body: JSON.stringify({
        amount: '0.01',
        currency: 'USD',
      }),
    });

    const res = await response.json();
    if (!res.data || !res.data.lightning_invoice || !res.data.lightning_invoice.payreq) {
      throw new Error('Opennode problem');
    }

    const invoice = res.data.lightning_invoice.payreq;

    const l2 = new LightningCustodianWallet();
    l2.setSecret(process.env.BLITZHUB);
    l2.setBaseURI(baseUri);
    l2.init();
    await l2.authorize();
    await l2.fetchTransactions();
    const txLen = l2.transactions_raw.length;

    const start = +new Date();
    await l2.payInvoice(invoice);
    const end = +new Date();
    if ((end - start) / 1000 > 9) {
      console.warn('payInvoice took', (end - start) / 1000, 'sec');
    }

    await l2.fetchTransactions();
    assert.strictEqual(l2.transactions_raw.length, txLen + 1);
    const lastTx = l2.transactions_raw[l2.transactions_raw.length - 1];
    assert.strictEqual(typeof lastTx.payment_preimage, 'string', 'preimage is present and is a string');
    assert.strictEqual(lastTx.payment_preimage.length, 64, 'preimage is present and is a string of 32 hex-encoded bytes');
    // transactions became more after paying an invoice
  });

  // turned off because acinq strike is shutting down
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('can pay invoice (acinq)', async () => {
    if (!process.env.BLITZHUB) {
      console.error('process.env.BLITZHUB not set, skipped');
      return;
    }
    if (!process.env.STRIKE) {
      console.error('process.env.STRIKE not set, skipped');
      return;
    }

    const response = await fetch('https://api.strike.acinq.co/api/v1/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(process.env.STRIKE + ':')}`,
      },
      body: 'amount=1&currency=btc&description=acceptance+test',
    });

    const res = await response.json();

    if (!res.payment_request) {
      throw new Error('Strike problem: ' + JSON.stringify(res));
    }

    const invoice = res.payment_request;

    const l2 = new LightningCustodianWallet();
    l2.setSecret(process.env.BLITZHUB);
    l2.setBaseURI(baseUri);
    l2.init();
    await l2.authorize();
    await l2.fetchTransactions();
    const txLen = l2.transactions_raw.length;

    const decoded = l2.decodeInvoice(invoice);
    assert.ok(decoded.payment_hash);
    assert.ok(decoded.description);

    let start = +new Date();
    await l2.payInvoice(invoice);
    let end = +new Date();
    if ((end - start) / 1000 > 9) {
      console.warn('payInvoice took', (end - start) / 1000, 'sec');
    }

    await l2.fetchTransactions();
    assert.strictEqual(l2.transactions_raw.length, txLen + 1);
    const lastTx = l2.transactions_raw[l2.transactions_raw.length - 1];
    assert.strictEqual(typeof lastTx.payment_preimage, 'string', 'preimage is present and is a string');
    assert.strictEqual(lastTx.payment_preimage.length, 64, 'preimage is present and is a string of 32 hex-encoded bytes');
    // transactions became more after paying an invoice

    // now, trying to pay duplicate invoice
    start = +new Date();
    let caughtError = false;
    try {
      await l2.payInvoice(invoice);
    } catch (Err) {
      caughtError = true;
    }
    assert.ok(caughtError);
    await l2.fetchTransactions();
    assert.strictEqual(l2.transactions_raw.length, txLen + 1);
    // havent changed since last time
    end = +new Date();
    if ((end - start) / 1000 > 9) {
      console.warn('duplicate payInvoice took', (end - start) / 1000, 'sec');
    }
  });

  it('can pay invoice (bitrefill)', async () => {
    if (!process.env.BLITZHUB) {
      console.error('process.env.BLITZHUB not set, skipped');
      return;
    }
    if (!process.env.BITREFILL) {
      console.error('process.env.BITREFILL not set, skipped');
      return;
    }

    const response = await fetch(`https://api-bitrefill.com/v1/lnurl_pay/${process.env.BITREFILL}/callback?amount=1000`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const res = await response.json();

    if (!res.pr) {
      throw new Error('Bitrefill problem: ' + JSON.stringify(res));
    }

    const invoice = res.pr;

    const l2 = new LightningCustodianWallet();
    l2.setSecret(process.env.BLITZHUB);
    l2.setBaseURI(baseUri);
    l2.init();
    await l2.authorize();
    await l2.fetchTransactions();
    const txLen = l2.transactions_raw.length;

    const decoded = l2.decodeInvoice(invoice);
    assert.ok(decoded.payment_hash);

    let start = +new Date();
    await l2.payInvoice(invoice);
    let end = +new Date();
    if ((end - start) / 1000 > 9) {
      console.warn('payInvoice took', (end - start) / 1000, 'sec');
    }

    await l2.fetchTransactions();
    assert.strictEqual(l2.transactions_raw.length, txLen + 1);
    const lastTx = l2.transactions_raw[l2.transactions_raw.length - 1];
    assert.strictEqual(typeof lastTx.payment_preimage, 'string', 'preimage is present and is a string');
    assert.strictEqual(lastTx.payment_preimage.length, 64, 'preimage is present and is a string of 32 hex-encoded bytes');
    // transactions became more after paying an invoice

    // now, trying to pay duplicate invoice
    start = +new Date();
    let caughtError = false;
    try {
      await l2.payInvoice(invoice);
    } catch (Err) {
      caughtError = true;
    }
    assert.ok(caughtError);
    await l2.fetchTransactions();
    assert.strictEqual(l2.transactions_raw.length, txLen + 1);
    // havent changed since last time
    end = +new Date();
    if ((end - start) / 1000 > 9) {
      console.warn('duplicate payInvoice took', (end - start) / 1000, 'sec');
    }
  });

  it('can create invoice and pay other blitzhub invoice', async () => {
    if (!process.env.BLITZHUB) {
      console.error('process.env.BLITZHUB not set, skipped');
      return;
    }

    const lOld = new LightningCustodianWallet();
    lOld.setSecret(process.env.BLITZHUB);
    lOld.setBaseURI(baseUri);
    lOld.init();
    await lOld.authorize();
    await lOld.fetchTransactions();
    let txLen = lOld.transactions_raw.length;

    // creating LND wallet
    const lNew = new LightningCustodianWallet();
    lNew.setBaseURI(baseUri);
    lNew.init();
    await lNew.createAccount(true);
    await lNew.authorize();
    await lNew.fetchBalance();
    assert.strictEqual(lNew.balance, 0);

    let invoices = await lNew.getUserInvoices();
    let invoice = await lNew.addInvoice(2, 'test memo');
    const decoded = lNew.decodeInvoice(invoice);
    let invoices2 = await lNew.getUserInvoices();
    assert.strictEqual(invoices2.length, invoices.length + 1);
    assert.ok(invoices2[0].ispaid === false);
    assert.ok(invoices2[0].description);
    assert.strictEqual(invoices2[0].description, 'test memo');
    assert.ok(invoices2[0].payment_request);
    assert.ok(invoices2[0].timestamp);
    assert.ok(invoices2[0].expire_time);
    assert.strictEqual(invoices2[0].amt, 2);
    for (const inv of invoices2) {
      assert.strictEqual(inv.type, 'user_invoice');
    }

    await lOld.fetchBalance();
    let oldBalance = lOld.balance;

    const start = +new Date();
    await lOld.payInvoice(invoice);
    const end = +new Date();
    if ((end - start) / 1000 > 9) {
      console.warn('payInvoice took', (end - start) / 1000, 'sec');
    }

    invoices2 = await lNew.getUserInvoices();
    assert.ok(invoices2[0].ispaid);

    assert.ok(lNew.weOwnTransaction(decoded.payment_hash));
    assert.ok(!lNew.weOwnTransaction('d45818ae11a584357f7b74da26012d2becf4ef064db015a45bdfcd9cb438929d'));

    await lOld.fetchBalance();
    await lNew.fetchBalance();
    assert.strictEqual(oldBalance - lOld.balance, 2);
    assert.strictEqual(lNew.balance, 2);

    await lOld.fetchTransactions();
    assert.strictEqual(lOld.transactions_raw.length, txLen + 1, 'internal invoice should also produce record in payer`s tx list');
    const newTx = lOld.transactions_raw.slice().pop();
    assert.ok(typeof newTx.fee !== 'undefined');
    assert.ok(newTx.value);
    assert.ok(newTx.description || newTx.memo, JSON.stringify(newTx));
    assert.ok(newTx.timestamp);
    assert.ok(!isNaN(newTx.value));
    assert.ok(newTx.type === 'paid_invoice', 'unexpected tx type ' + newTx.type);

    // now, paying back that amount
    oldBalance = lOld.balance;
    invoice = await lOld.addInvoice(1, 'test memo');
    await lNew.payInvoice(invoice);
    await lOld.fetchBalance();
    await lNew.fetchBalance();
    assert.strictEqual(lOld.balance - oldBalance, 1);
    assert.strictEqual(lNew.balance, 1); // ok, forfeit this 1, unrecoverable

    // now, paying same internal invoice. should fail:

    let caughtError = false;
    await lOld.fetchTransactions();
    txLen = lOld.transactions_raw.length;
    const invLen = (await lNew.getUserInvoices()).length;
    try {
      await lOld.payInvoice(invoice);
    } catch (Err) {
      caughtError = true;
    }
    assert.ok(caughtError);

    await lOld.fetchTransactions();
    assert.strictEqual(txLen, lOld.transactions_raw.length, 'tx count should not be changed');
    assert.strictEqual(invLen, (await lNew.getUserInvoices()).length, 'invoices count should not be changed');

    // testing how limiting works:
    assert.strictEqual(lNew.user_invoices_raw.length, 1);
    await lNew.addInvoice(666, 'test memo 2');
    invoices = await lNew.getUserInvoices(1);
    assert.strictEqual(invoices.length, 2);
    assert.strictEqual(invoices[0].amt, 2);
    assert.strictEqual(invoices[1].amt, 666);
  });

  it('can pay invoice with free amount (tippin.me)', async function () {
    if (!process.env.BLITZHUB) {
      console.error('process.env.BLITZHUB not set, skipped');
      return;
    }

    // fetching invoice from tippin.me :

    const response = await fetch('https://tippin.me/lndreq/newinvoice.php', {
      method: 'POST',
      headers: {
        Origin: 'https://tippin.me',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json, text/javascript, */*; q=0.01',
      },
      body: 'userid=1188&username=overtorment&istaco=0&customAmnt=0&customMemo=',
    });

    const res = await response.json();
    if (!res || !res.message) {
      throw new Error('tippin.me problem: ' + JSON.stringify(res));
    }
    const invoice = res.message;

    // --> use to pay specific invoice
    // invoice =
    //   'lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm';

    const l2 = new LightningCustodianWallet();
    l2.setSecret(process.env.BLITZHUB);
    l2.setBaseURI(baseUri);
    l2.init();
    await l2.authorize();
    await l2.fetchTransactions();
    await l2.fetchBalance();
    const oldBalance = +l2.balance;
    const txLen = l2.transactions_raw.length;

    const decoded = l2.decodeInvoice(invoice);
    assert.ok(decoded.payment_hash);
    assert.ok(decoded.description);
    assert.strictEqual(+decoded.num_satoshis, 0);

    // first, tip invoice without amount should not work:
    let gotError = false;
    try {
      await l2.payInvoice(invoice);
    } catch (_) {
      gotError = true;
    }
    assert.ok(gotError);

    // then, pay:

    const start = +new Date();
    await l2.payInvoice(invoice, 3);
    const end = +new Date();
    if ((end - start) / 1000 > 9) {
      console.warn('payInvoice took', (end - start) / 1000, 'sec');
    }

    await l2.fetchTransactions();
    assert.strictEqual(l2.transactions_raw.length, txLen + 1);
    // transactions became more after paying an invoice

    await l2.fetchBalance();
    assert.ok(oldBalance - l2.balance >= 3);
    assert.ok(oldBalance - l2.balance < 10); // sanity check
  });

  it('cant create zero amt invoices yet', async () => {
    const l = new LightningCustodianWallet();
    l.setBaseURI(baseUri);
    l.init();
    assert.ok(l.refill_addressess.length === 0);
    assert.ok(l._refresh_token_created_ts === 0);
    assert.ok(l._access_token_created_ts === 0);
    l.balance = 'FAKE';

    await l.createAccount(true);
    await l.authorize();
    await l.fetchBalance();

    assert.ok(l.access_token);
    assert.ok(l.refresh_token);
    assert.ok(l._refresh_token_created_ts > 0);
    assert.ok(l._access_token_created_ts > 0);
    assert.ok(l.balance === 0);

    let err = false;
    try {
      await l.addInvoice(0, 'zero amt inv');
    } catch (_) {
      err = true;
    }
    assert.ok(err);

    err = false;
    try {
      await l.addInvoice(NaN, 'zero amt inv');
    } catch (_) {
      err = true;
    }
    assert.ok(err);
  });

  it('cant pay negative free amount', async () => {
    if (!process.env.BLITZHUB) {
      console.error('process.env.BLITZHUB not set, skipped');
      return;
    }

    // fetching invoice from tippin.me :

    const response = await fetch('https://tippin.me/lndreq/newinvoice.php', {
      method: 'POST',
      headers: {
        Origin: 'https://tippin.me',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json, text/javascript, */*; q=0.01',
      },
      body: 'userid=1188&username=overtorment&istaco=0&customAmnt=0&customMemo=',
    });

    const res = await response.json();
    if (!res || !res.message) {
      throw new Error('tippin.me problem: ' + JSON.stringify(res));
    }
    const invoice = res.message;
    const l2 = new LightningCustodianWallet();
    l2.setSecret(process.env.BLITZHUB);
    l2.setBaseURI(baseUri);
    l2.init();
    await l2.authorize();
    await l2.fetchTransactions();
    await l2.fetchBalance();
    const oldBalance = +l2.balance;
    const txLen = l2.transactions_raw.length;

    const decoded = l2.decodeInvoice(invoice);
    assert.ok(decoded.payment_hash);
    assert.ok(decoded.description);
    assert.strictEqual(+decoded.num_satoshis, 0);

    let error = false;
    try {
      await l2.payInvoice(invoice, -1);
    } catch (Err) {
      error = true;
    }
    assert.ok(error);
    await l2.fetchBalance();
    assert.strictEqual(l2.balance, oldBalance);
    await l2.fetchTransactions();
    assert.strictEqual(l2.transactions_raw.length, txLen);
  });
});
