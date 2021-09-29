import DeeplinkSchemaMatch from '../../class/deeplink-schema-match';
const assert = require('assert');
jest.useFakeTimers();

describe('unit - DeepLinkSchemaMatch', function () {
  it('hasSchema', () => {
    assert.ok(DeeplinkSchemaMatch.hasSchema('groestlcoin:FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs'));
    assert.ok(DeeplinkSchemaMatch.hasSchema('groestlcoin:grs1qle4zljdmpt77dtc98whyz90msamwjje8u6d6k5?amount=666&label=Yo'));
    assert.ok(DeeplinkSchemaMatch.hasSchema('groestlcoin:GRS1QLE4ZLJDMPT77DTC98WHYZ90MSAMWJJE8U6D6K5?amount=666&label=Yo'));
    assert.ok(DeeplinkSchemaMatch.hasSchema('GROESTLCOIN:GRS1Q44JTK2QL0XTGJPDWRYSZWC7W8TSW30HP6YCT3X'));
    assert.ok(DeeplinkSchemaMatch.hasSchema('GROESTLCOIN:GRS1Q44JTK2QL0XTGJPDWRYSZWC7W8TSW30HP6YCT3X?amount=666&label=Yo'));
    assert.ok(
      DeeplinkSchemaMatch.hasSchema(
        'lightning:lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm',
      ),
    );

    assert.ok(DeeplinkSchemaMatch.hasSchema('bluewallet:groestlcoin:FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs'));
    assert.ok(DeeplinkSchemaMatch.hasSchema('bluewallet:groestlcoin:grs1qle4zljdmpt77dtc98whyz90msamwjje8u6d6k5?amount=666&label=Yo'));
    assert.ok(DeeplinkSchemaMatch.hasSchema('bluewallet:groestlcoin:GRS1QLE4ZLJDMPT77DTC98WHYZ90MSAMWJJE8U6D6K5?amount=666&label=Yo'));
    assert.ok(DeeplinkSchemaMatch.hasSchema('bluewallet:GROESTLCOIN:GRS1Q44JTK2QL0XTGJPDWRYSZWC7W8TSW30HP6YCT3X'));
    assert.ok(DeeplinkSchemaMatch.hasSchema('bluewallet:GROESTLCOIN:GRS1Q44JTK2QL0XTGJPDWRYSZWC7W8TSW30HP6YCT3X?amount=666&label=Yo'));
    assert.ok(
      DeeplinkSchemaMatch.hasSchema(
        'bluewallet:lightning:lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm',
      ),
    );
  });

  it('isBitcoin Address', () => {
    assert.ok(DeeplinkSchemaMatch.isBitcoinAddress('FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs'));
    assert.ok(DeeplinkSchemaMatch.isBitcoinAddress('3GcKN7q7gZuZ8eHygAhHrvPa5zZbGXa9bR'));
    assert.ok(DeeplinkSchemaMatch.isBitcoinAddress('grs1q84svmadhrnestspddqxnrmndnkhwmquul9hx7h'));
    assert.ok(DeeplinkSchemaMatch.isBitcoinAddress('GRS1Q84SVMADHRNESTSPDDQXNRMNDNKHWMQUUL9HX7H'));
    assert.ok(DeeplinkSchemaMatch.isBitcoinAddress('groestlcoin:GRS1QLE4ZLJDMPT77DTC98WHYZ90MSAMWJJE8U6D6K5'));
    assert.ok(DeeplinkSchemaMatch.isBitcoinAddress('GROESTLCOIN:GRS1Q44JTK2QL0XTGJPDWRYSZWC7W8TSW30HP6YCT3X'));
    assert.ok(DeeplinkSchemaMatch.isBitcoinAddress('GROESTLCOIN:GRS1Q44JTK2QL0XTGJPDWRYSZWC7W8TSW30HP6YCT3X?amount=666&label=Yo'));
  });

  it('isLighting Invoice', () => {
    assert.ok(
      DeeplinkSchemaMatch.isLightningInvoice(
        'lightning:lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm',
      ),
    );
  });

  it('isBoth Bitcoin & Invoice', () => {
    assert.ok(
      DeeplinkSchemaMatch.isBothBitcoinAndLightning(
        'groestlcoin:GRS1Q44JTK2QL0XTGJPDWRYSZWC7W8TSW30HP6YCT3X?amount=0.000001&lightning=lngrs1m1p0t0944pp5f3n98pepjguxt8zelg52fzmcpyg02nr76dun074zallphe8stlysdqlw3jhxapdwfjhzat9wd6z6v3jxgeryvscqzpgxqy9gcqay452jdu5e6wq0wnzexk8zwu0ctw643me7vwvyg3htc4uyzp82jqha0v3ycss56j8jgmzpkfurgkwstxw30lu2luwmhq2vvxy08ay3gqgwatj0',
      ),
    );
    assert.ok(
      DeeplinkSchemaMatch.isBothBitcoinAndLightning(
        'GROESTLCOIN:FcBN63fFz8riqokAUszsTgVJrngFdndrNQ?amount=0.000001&lightning=lngrs1m1p0t0944pp5f3n98pepjguxt8zelg52fzmcpyg02nr76dun074zallphe8stlysdqlw3jhxapdwfjhzat9wd6z6v3jxgeryvscqzpgxqy9gcqay452jdu5e6wq0wnzexk8zwu0ctw643me7vwvyg3htc4uyzp82jqha0v3ycss56j8jgmzpkfurgkwstxw30lu2luwmhq2vvxy08ay3gqgwatj0',
      ),
    );
  });

  it('isLnurl', () => {
    assert.ok(
      DeeplinkSchemaMatch.isLnUrl(
        'LNURL1DP68GURN8GHJ7UM9WFMXJCM99E3K7MF0V9CXJ0M385EKVCENXC6R2C35XVUKXEFCV5MKVV34X5EKZD3EV56NYD3HXQURZEPEXEJXXEPNXSCRVWFNV9NXZCN9XQ6XYEFHVGCXXCMYXYMNSERXFQ5FNS',
      ),
    );
  });

  it('isSafelloRedirect', () => {
    assert.ok(DeeplinkSchemaMatch.isSafelloRedirect({ url: 'bluewallet:?safello-state-token=TEST' }));
    assert.ok(!DeeplinkSchemaMatch.isSafelloRedirect({ url: 'bluewallet:' }));
  });

  it('navigationForRoute', async () => {
    const events = [
      {
        argument: { url: 'FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs' },
        expected: ['SendDetailsRoot', { screen: 'SendDetails', params: { uri: 'FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs' } }],
      },
      {
        argument: { url: 'groestlcoin:FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs' },
        expected: ['SendDetailsRoot', { screen: 'SendDetails', params: { uri: 'groestlcoin:FWp7bfoFEfczt1pVQrQddqVXBN9hPvUYqs' } }],
      },
      {
        argument: { url: 'GROESTLCOIN:GRS1Q44JTK2QL0XTGJPDWRYSZWC7W8TSW30HP6YCT3X?amount=666&label=Yo' },
        expected: [
          'SendDetailsRoot',
          { screen: 'SendDetails', params: { uri: 'GROESTLCOIN:GRS1Q44JTK2QL0XTGJPDWRYSZWC7W8TSW30HP6YCT3X?amount=666&label=Yo' } },
        ],
      },
      {
        argument: { url: 'bluewallet:GROESTLCOIN:GRS1Q44JTK2QL0XTGJPDWRYSZWC7W8TSW30HP6YCT3X?amount=666&label=Yo' },
        expected: [
          'SendDetailsRoot',
          { screen: 'SendDetails', params: { uri: 'GROESTLCOIN:GRS1Q44JTK2QL0XTGJPDWRYSZWC7W8TSW30HP6YCT3X?amount=666&label=Yo' } },
        ],
      },
      {
        argument: {
          url:
            'lightning:lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm',
        },
        expected: [
          'ScanLndInvoiceRoot',
          {
            screen: 'ScanLndInvoice',
            params: {
              uri:
                'lightning:lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm',
            },
          },
        ],
      },
      {
        argument: {
          url:
            'bluewallet:lightning:lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm',
        },
        expected: [
          'ScanLndInvoiceRoot',
          {
            screen: 'ScanLndInvoice',
            params: {
              uri:
                'lightning:lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm',
            },
          },
        ],
      },
      /*
      {
        argument: {
          url: 'https://azte.co/?c1=3062&c2=2586&c3=5053&c4=5261',
        },
        expected: [
          'AztecoRedeemRoot',
          {
            screen: 'AztecoRedeem',
            params: { c1: '3062', c2: '2586', c3: '5053', c4: '5261', uri: 'https://azte.co/?c1=3062&c2=2586&c3=5053&c4=5261' },
          },
        ],
      },
      {
        argument: {
          url: 'https://azte.co/?c1=3062&c2=2586&c3=5053&c4=5261',
        },
        expected: [
          'AztecoRedeemRoot',
          {
            screen: 'AztecoRedeem',
            params: { c1: '3062', c2: '2586', c3: '5053', c4: '5261', uri: 'https://azte.co/?c1=3062&c2=2586&c3=5053&c4=5261' },
          },
        ],
      },
      {
        argument: {
          url: 'bluewallet:?safello-state-token=TEST',
        },
        expected: [
          'BuyBitcoin',
          {
            safelloStateToken: 'TEST',
            uri: 'bluewallet:?safello-state-token=TEST',
            wallet: undefined,
          },
        ],
      }, */
      {
        argument: {
          url: 'bluewallet:setelectrumserver?server=electrum1.bluewallet.io%3A443%3As',
        },
        expected: [
          'ElectrumSettings',
          {
            server: 'electrum1.bluewallet.io:443:s',
          },
        ],
      },
      {
        argument: {
          url: 'bluewallet:setlndhuburl?url=https%3A%2F%2Flndhub.herokuapp.com',
        },
        expected: [
          'LightningSettings',
          {
            url: 'https://lndhub.herokuapp.com',
          },
        ],
      },
      {
        argument: {
          url:
            'https://lnbits.com/?lightning=LNURL1DP68GURN8GHJ7MRWVF5HGUEWVDHK6TMHD96XSERJV9MJ7CTSDYHHVVF0D3H82UNV9UM9JDENFPN5SMMK2359J5RKWVMKZ5ZVWAV4VJD63TM',
        },
        expected: [
          'LNDCreateInvoiceRoot',
          {
            screen: 'LNDCreateInvoice',
            params: {
              uri:
                'https://lnbits.com/?lightning=LNURL1DP68GURN8GHJ7MRWVF5HGUEWVDHK6TMHD96XSERJV9MJ7CTSDYHHVVF0D3H82UNV9UM9JDENFPN5SMMK2359J5RKWVMKZ5ZVWAV4VJD63TM',
            },
          },
        ],
      },
      {
        argument: {
          url: require('fs').readFileSync('./tests/unit/fixtures/skeleton-cobo.txt', 'ascii'),
        },
        expected: [
          'AddWalletRoot',
          {
            screen: 'ImportWallet',
            params: {
              triggerImport: true,
              label: require('fs').readFileSync('./tests/unit/fixtures/skeleton-cobo.txt', 'ascii'),
            },
          },
        ],
      },
      {
        argument: {
          url: require('fs').readFileSync('./tests/unit/fixtures/skeleton-coldcard.txt', 'ascii'),
        },
        expected: [
          'AddWalletRoot',
          {
            screen: 'ImportWallet',
            params: {
              triggerImport: true,
              label: require('fs').readFileSync('./tests/unit/fixtures/skeleton-coldcard.txt', 'ascii'),
            },
          },
        ],
      },
      {
        argument: {
          url: require('fs').readFileSync('./tests/unit/fixtures/skeleton-electrum.txt', 'ascii'),
        },
        expected: [
          'AddWalletRoot',
          {
            screen: 'ImportWallet',
            params: {
              triggerImport: true,
              label: require('fs').readFileSync('./tests/unit/fixtures/skeleton-electrum.txt', 'ascii'),
            },
          },
        ],
      },
      {
        argument: {
          url: require('fs').readFileSync('./tests/unit/fixtures/skeleton-walletdescriptor.txt', 'ascii'),
        },
        expected: [
          'AddWalletRoot',
          {
            screen: 'ImportWallet',
            params: {
              triggerImport: true,
              label: require('fs').readFileSync('./tests/unit/fixtures/skeleton-walletdescriptor.txt', 'ascii'),
            },
          },
        ],
      },
      {
        argument: {
          url: 'zpub6rFDtF1nuXZ9PUL4XzKURh3vJBW6Kj6TUrYL4qPtFNtDXtcTVfiqjQDyrZNwjwzt5HS14qdqo3Co2282Lv3Re6Y5wFZxAVuMEpeygnnDwfx',
        },
        expected: [
          'AddWalletRoot',
          {
            screen: 'ImportWallet',
            params: {
              triggerImport: true,
              label: 'zpub6rFDtF1nuXZ9PUL4XzKURh3vJBW6Kj6TUrYL4qPtFNtDXtcTVfiqjQDyrZNwjwzt5HS14qdqo3Co2282Lv3Re6Y5wFZxAVuMEpeygnnDwfx',
            },
          },
        ],
      },
      {
        argument: {
          url: 'aopp:?v=0&msg=vasp-chosen-msg&asset=btc&format=p2wpkh&callback=https://vasp.com/proofs/vasp-chosen-token​',
        },
        expected: [
          'AOPPRoot',
          {
            screen: 'AOPP',
            params: {
              uri: 'aopp:?v=0&msg=vasp-chosen-msg&asset=btc&format=p2wpkh&callback=https://vasp.com/proofs/vasp-chosen-token​',
            },
          },
        ],
      },
    ];

    const asyncNavigationRouteFor = async function (event) {
      return new Promise(function (resolve) {
        DeeplinkSchemaMatch.navigationRouteFor(event, navValue => {
          resolve(navValue);
        });
      });
    };

    for (const event of events) {
      const navValue = await asyncNavigationRouteFor(event.argument);
      assert.deepStrictEqual(navValue, event.expected);
    }

    // BIP21 w/BOLT11 support
    assert.equal(
      (
        await asyncNavigationRouteFor({
          url:
            'groestlcoin:Ffqz14cyvZYJavD76t6oHNDJnGiWcZMVxR?amount=0.000001&lightning=lngrs1m1p0t09zhpp5qsljqlwzp4k402uaeduful4l84xvk83jxtfun8yk33usq0u3mnfsdq5w3jhxapdwfjhzat9wd6qcqzpgxqy9gcqe25gnt4srxxtjfm65cj6eczsnn589m4szu4rtk0s5s2cmpwq5ax9dfrw67u0kqtlx4k283yqefd0x9lmnaxfsy8apqrj2esa36z99rgqf55pdm',
        })
      )[0],
      'SelectWallet',
    );
  });

  it('decodes bip21', () => {
    let decoded = DeeplinkSchemaMatch.bip21decode('groestlcoin:Ffqz14cyvZYJavD76t6oHNDJnGiWcZMVxR?amount=20.3&label=Foobar');
    assert.deepStrictEqual(decoded, {
      address: 'Ffqz14cyvZYJavD76t6oHNDJnGiWcZMVxR',
      options: {
        amount: 20.3,
        label: 'Foobar',
      },
    });

    decoded = DeeplinkSchemaMatch.bip21decode(
      'groestlcoin:grs1q6ve7qrz0gg9tt22022rx620uepkpkk2ed286gw?amount=0.0001&pj=https://grspay.com/GRS/pj',
    );
    assert.strictEqual(decoded.options.pj, 'https://grspay.com/GRS/pj');

    decoded = DeeplinkSchemaMatch.bip21decode('GROESTLCOIN:Ffqz14cyvZYJavD76t6oHNDJnGiWcZMVxR?amount=20.3&label=Foobar');
    assert.deepStrictEqual(decoded, {
      address: 'Ffqz14cyvZYJavD76t6oHNDJnGiWcZMVxR',
      options: {
        amount: 20.3,
        label: 'Foobar',
      },
    });
  });

  it('encodes bip21', () => {
    let encoded = DeeplinkSchemaMatch.bip21encode('Ffqz14cyvZYJavD76t6oHNDJnGiWcZMVxR');
    assert.strictEqual(encoded, 'groestlcoin:Ffqz14cyvZYJavD76t6oHNDJnGiWcZMVxR');
    encoded = DeeplinkSchemaMatch.bip21encode('Ffqz14cyvZYJavD76t6oHNDJnGiWcZMVxR', {
      amount: 20.3,
      label: 'Foobar',
    });
    assert.strictEqual(encoded, 'groestlcoin:Ffqz14cyvZYJavD76t6oHNDJnGiWcZMVxR?amount=20.3&label=Foobar');
  });

  it('can decodeBitcoinUri', () => {
    assert.deepStrictEqual(
      DeeplinkSchemaMatch.decodeBitcoinUri(
        'groestlcoin:grs1q6ve7qrz0gg9tt22022rx620uepkpkk2ed286gw?amount=0.0001&pj=https://grspay.com/GRS/pj',
      ),
      {
        address: 'grs1q6ve7qrz0gg9tt22022rx620uepkpkk2ed286gw',
        amount: 0.0001,
        memo: '',
        payjoinUrl: 'https://grspay.com/GRS/pj',
      },
    );

    assert.deepStrictEqual(
      DeeplinkSchemaMatch.decodeBitcoinUri('GROESTLCOIN:Ffqz14cyvZYJavD76t6oHNDJnGiWcZMVxR?amount=20.3&label=Foobar'),
      {
        address: 'Ffqz14cyvZYJavD76t6oHNDJnGiWcZMVxR',
        amount: 20.3,
        memo: 'Foobar',
        payjoinUrl: '',
      },
    );
  });

  it('recognizes files', () => {
    // txn files:
    assert.ok(DeeplinkSchemaMatch.isTXNFile('file://com.android.externalstorage.documents/document/081D-1403%3Atxhex.txn'));
    assert.ok(!DeeplinkSchemaMatch.isPossiblySignedPSBTFile('file://com.android.externalstorage.documents/document/081D-1403%3Atxhex.txn'));

    assert.ok(DeeplinkSchemaMatch.isTXNFile('content://com.android.externalstorage.documents/document/081D-1403%3Atxhex.txn'));
    assert.ok(
      !DeeplinkSchemaMatch.isPossiblySignedPSBTFile('content://com.android.externalstorage.documents/document/081D-1403%3Atxhex.txn'),
    );

    // psbt files (signed):
    assert.ok(
      DeeplinkSchemaMatch.isPossiblySignedPSBTFile(
        'content://com.android.externalstorage.documents/document/081D-1403%3Atxhex-signed.psbt',
      ),
    );
    assert.ok(
      DeeplinkSchemaMatch.isPossiblySignedPSBTFile('file://com.android.externalstorage.documents/document/081D-1403%3Atxhex-signed.psbt'),
    );

    assert.ok(!DeeplinkSchemaMatch.isTXNFile('content://com.android.externalstorage.documents/document/081D-1403%3Atxhex-signed.psbt'));
    assert.ok(!DeeplinkSchemaMatch.isTXNFile('file://com.android.externalstorage.documents/document/081D-1403%3Atxhex-signed.psbt'));

    // psbt files (unsigned):
    assert.ok(DeeplinkSchemaMatch.isPossiblyPSBTFile('content://com.android.externalstorage.documents/document/081D-1403%3Atxhex.psbt'));
    assert.ok(DeeplinkSchemaMatch.isPossiblyPSBTFile('file://com.android.externalstorage.documents/document/081D-1403%3Atxhex.psbt'));
  });

  it('can work with some deeplink actions', () => {
    assert.strictEqual(DeeplinkSchemaMatch.getServerFromSetElectrumServerAction('sgasdgasdgasd'), false);
    assert.strictEqual(
      DeeplinkSchemaMatch.getServerFromSetElectrumServerAction('bluewallet:setelectrumserver?server=electrum1.bluewallet.io%3A443%3As'),
      'electrum1.bluewallet.io:443:s',
    );
    assert.strictEqual(
      DeeplinkSchemaMatch.getServerFromSetElectrumServerAction('setelectrumserver?server=electrum1.bluewallet.io%3A443%3As'),
      'electrum1.bluewallet.io:443:s',
    );
    assert.strictEqual(
      DeeplinkSchemaMatch.getServerFromSetElectrumServerAction('ololo:setelectrumserver?server=electrum1.bluewallet.io%3A443%3As'),
      false,
    );
    assert.strictEqual(
      DeeplinkSchemaMatch.getServerFromSetElectrumServerAction('setTrololo?server=electrum1.bluewallet.io%3A443%3As'),
      false,
    );

    assert.strictEqual(
      DeeplinkSchemaMatch.getUrlFromSetLndhubUrlAction('bluewallet:setlndhuburl?url=https%3A%2F%2Flndhub.herokuapp.com'),
      'https://lndhub.herokuapp.com',
    );
    assert.strictEqual(
      DeeplinkSchemaMatch.getUrlFromSetLndhubUrlAction('bluewallet:setlndhuburl?url=https%3A%2F%2Flndhub.herokuapp.com%3A443'),
      'https://lndhub.herokuapp.com:443',
    );
    assert.strictEqual(
      DeeplinkSchemaMatch.getUrlFromSetLndhubUrlAction('setlndhuburl?url=https%3A%2F%2Flndhub.herokuapp.com%3A443'),
      'https://lndhub.herokuapp.com:443',
    );
    assert.strictEqual(DeeplinkSchemaMatch.getUrlFromSetLndhubUrlAction('gsom?url=https%3A%2F%2Flndhub.herokuapp.com%3A443'), false);
    assert.strictEqual(DeeplinkSchemaMatch.getUrlFromSetLndhubUrlAction('sdfhserhsthsd'), false);
  });
});
