import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../authorization-panel.js';

describe('Digest authentication', function() {
  async function modelFixture(amf, security) {
    return (await fixture(html`<authorization-panel
      .amf="${amf}"
      .securedBy="${security}"></authorization-panel>`));
  }

  [
    ['Compact model', true],
    ['Full model', false]
  ].forEach(([label, compact]) => {
    describe(label, () => {
      const apiFile = 'demo-api';

      describe('initialization', () => {
        let amf;
        before(async () => {
          amf = await AmfLoader.load(apiFile, compact);
        });

        it('sets only basic method after changing securedBy', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/pass', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout();
          assert.deepEqual(element.authMethods, [{
            type: 'Pass Through',
            name: 'Pass Through'
          }]);
        });

        it('selectes the panel', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/pass', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout();
          assert.equal(element.selected, 0);
        });

        it('renders not supported message', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/pass', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout();
          const node = element.shadowRoot.querySelector('.no-support-info');
          assert.ok(node);
        });

        it('is accessible with the panel', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/pass', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout();
          await assert.isAccessible(element);
        });
      });
    });
  });
});
