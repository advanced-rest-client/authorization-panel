import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import { AmfLoader } from './amf-loader.js';
import '../authorization-panel.js';

describe('RAML custom scheme authentication', function() {
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

        it('renders custom scheme', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/custom-only', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout();
          const node = element.shadowRoot.querySelector('auth-method-custom');
          assert.ok(node);
        });

        it('has panels settings', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/custom-only', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout(100);
          assert.typeOf(element.settings, 'object');
          assert.equal(element.settings.type, 'x-custom');
        });

        it('panel is invalid', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/custom-only', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout(100);
          assert.isTrue(element.invalid);
        });

        it('is accessible with the panel', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/custom-only', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout(100);
          await assert.isAccessible(element);
        });
      });
    });
  });

  describe('SE-12042', () => {
    let amf;
    before(async () => {
      amf = await AmfLoader.load('SE-12042', true);
    });

    it('panel is valid and has default data', async () => {
      const security = AmfLoader.lookupSecurity(amf, '/check/api-status', 'get');
      const element = await modelFixture(amf, security);
      await aTimeout(100);
      const settings = element.settings;
      assert.equal(settings.type, 'x-custom');
      assert.isTrue(settings.valid);
      assert.equal(settings.settings['Client-Id'], '283a6722121141feb7a929793d5c');
      assert.equal(settings.settings['Client-Secret'], '1421b7a929793d51fe283a67221c');
    });
  });
});
