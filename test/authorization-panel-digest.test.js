import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import sinon from 'sinon/pkg/sinon-esm.js';
import { AmfLoader } from './amf-loader.js';
import '../authorization-panel.js';

describe('Digest authentication', function() {
  async function basicFixture() {
    return (await fixture(`<authorization-panel selected="3"></authorization-panel>`));
  }

  async function modelFixture(amf, security) {
    return (await fixture(html`<authorization-panel
      .amf="${amf}"
      .securedBy="${security}"></authorization-panel>`));
  }

  describe('initialization', () => {
    it('renders the panel from selected attribute', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('auth-method-digest');
      assert.ok(node);
    });

    it('has panels settings', async () => {
      const element = await basicFixture();
      await aTimeout();
      assert.typeOf(element.settings, 'object');
      assert.equal(element.settings.type, 'digest');
    });

    it('panel is invalid', async () => {
      const element = await basicFixture();
      await aTimeout();
      assert.isTrue(element.invalid);
    });

    it('panels is valid after updating values', async () => {
      const element = await basicFixture();
      const panel = element.shadowRoot.querySelector('auth-method-digest');
      panel.username = 'uname';
      panel.password = 'passwd';
      await aTimeout();
      assert.isFalse(element.invalid);
    });

    it('dispatches authorization-settings-changed', async () => {
      const element = await basicFixture();
      const spy = sinon.spy();
      element.addEventListener('authorization-settings-changed', spy);
      const panel = element.shadowRoot.querySelector('auth-method-digest');
      panel.password = 'passwd';
      await aTimeout();
      assert.isTrue(spy.called);
    });
  });

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
          const security = AmfLoader.lookupSecurity(amf, '/digest', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout();
          assert.deepEqual(element.authMethods, [{
            type: 'Digest Authentication',
            name: 'Digest Authentication'
          }]);
        });

        it('selectes the panel', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/digest', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout();
          assert.equal(element.selected, 0);
        });

        it('is accessible with the panel', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/digest', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout();
          await assert.isAccessible(element);
        });
      });
    });
  });
});
