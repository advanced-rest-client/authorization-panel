import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import sinon from 'sinon/pkg/sinon-esm.js';
import { AmfLoader } from './amf-loader.js';
import '../authorization-panel.js';

describe('OAuth 2.0 authentication', function() {
  async function basicFixture() {
    return (await fixture(`<authorization-panel selected="4"></authorization-panel>`));
  }

  async function modelFixture(amf, security) {
    return (await fixture(html`<authorization-panel
      .amf="${amf}"
      .securedBy="${security}"></authorization-panel>`));
  }

  describe('initialization', () => {
    it('renders the panel from selected attribute', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('auth-method-oauth2');
      assert.ok(node);
    });

    it('has panels settings', async () => {
      const element = await basicFixture();
      await aTimeout();
      assert.typeOf(element.settings, 'object');
      assert.equal(element.settings.type, 'oauth2');
    });

    it('panel is invalid', async () => {
      const element = await basicFixture();
      await aTimeout();
      assert.isTrue(element.invalid);
    });

    it('panels is valid after updating values', async () => {
      const element = await basicFixture();
      const panel = element.shadowRoot.querySelector('auth-method-oauth2');
      panel.grantType = 'implicit';
      panel.clientId = 'id';
      panel.authorizationUri = 'https://api.domain.com/token';
      await aTimeout();
      assert.isFalse(element.invalid);
    });

    it('dispatches authorization-settings-changed', async () => {
      const element = await basicFixture();
      const spy = sinon.spy();
      element.addEventListener('authorization-settings-changed', spy);
      const panel = element.shadowRoot.querySelector('auth-method-oauth2');
      panel.clientId = 'id';
      await aTimeout();
      // this panel uses lit-html's updated lifecycle method, it needs another tick.
      await aTimeout();
      assert.isTrue(spy.called);
    });

    it('dispatches request-header-changed when has token', async () => {
      const element = await basicFixture();
      await aTimeout();
      const spy = sinon.spy();
      element.addEventListener('request-header-changed', spy);
      const panel = element.shadowRoot.querySelector('auth-method-oauth2');
      panel.grantType = 'implicit';
      panel.clientId = 'id';
      panel.authorizationUri = 'https://api.domain.com/token';
      panel.accessToken = 'token';
      await aTimeout();
      assert.equal(spy.args[0][0].detail.name, 'authorization', 'header name is set');
      assert.equal(spy.args[0][0].detail.value, 'Bearer token', 'header name is set');
    });

    it('dispatches query-parameter-changed when has token and deliverMethod', async () => {
      const element = await basicFixture();
      await aTimeout();
      const spy = sinon.spy();
      element.addEventListener('query-parameter-changed', spy);
      const panel = element.shadowRoot.querySelector('auth-method-oauth2');
      panel.grantType = 'implicit';
      panel.clientId = 'id';
      panel.authorizationUri = 'https://api.domain.com/token';
      panel.accessToken = 'token';
      panel.oauthDeliveryMethod = 'parameter';
      await aTimeout();
      assert.equal(spy.args[0][0].detail.name, 'authorization', 'param name is set');
      assert.equal(spy.args[0][0].detail.value, 'token', 'param name is set');
    });

    it('changes header name when set on authorization panel', async () => {
      const element = await basicFixture();
      await aTimeout();
      const spy = sinon.spy();
      element.addEventListener('query-parameter-changed', spy);
      const panel = element.shadowRoot.querySelector('auth-method-oauth2');
      panel.grantType = 'implicit';
      panel.clientId = 'id';
      panel.authorizationUri = 'https://api.domain.com/token';
      panel.accessToken = 'token';
      panel.oauthDeliveryMethod = 'parameter';
      panel.oauthDeliveryName = 'other';
      await aTimeout();
      assert.equal(spy.args[0][0].detail.name, 'other', 'param name is set');
      assert.equal(spy.args[0][0].detail.value, 'token', 'param name is set');
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

        it('sets only Oauth2 method after changing securedBy', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/oauth2', 'post');
          const element = await modelFixture(amf, security);
          await aTimeout();
          assert.deepEqual(element.authMethods, [{
            type: 'OAuth 2.0',
            name: 'OAuth 2.0 with annotation'
          }]);
        });

        it('sets multiple scheme options', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/oauth2', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout();
          assert.deepEqual(element.authMethods, [{
            type: 'OAuth 2.0',
            name: 'Normal OAuth 2.0 definition'
          }, {
            type: 'OAuth 2.0',
            name: 'OAuth 2.0 with annotation'
          }]);
        });


        it('selectes first option', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/oauth2', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout();
          assert.equal(element.selected, 0);
        });

        it('sets authRequired', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/oauth2', 'get');
          const element = await modelFixture(amf, security);
          await aTimeout();
          assert.isTrue(element.authRequired);
        });

        it('sets authRequired when null scheme', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/oauth2', 'put');
          const element = await modelFixture(amf, security);
          await aTimeout();
          assert.isFalse(element.authRequired);
        });

        it('selectes null scheme (no auth required)', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/oauth2', 'put');
          const element = await modelFixture(amf, security);
          await aTimeout();
          assert.equal(element.selected, 0);
          assert.deepEqual(element.authMethods, [{
            type: 'none',
            name: 'No authorization'
          }, {
            type: 'OAuth 2.0',
            name: 'OAuth 2.0 with annotation'
          }]);
        });

        it('re-sets the element when removing scheme', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/oauth2', 'put');
          const element = await modelFixture(amf, security);
          await aTimeout();
          element.securedBy = undefined;
          await aTimeout();
          assert.deepEqual(element.authMethods, element.supportedMethods);
        });

        it('is accessible with the panel', async () => {
          const security = AmfLoader.lookupSecurity(amf, '/oauth2', 'post');
          const element = await modelFixture(amf, security);
          await aTimeout();
          await assert.isAccessible(element);
        });
      });
    });
  });
});
