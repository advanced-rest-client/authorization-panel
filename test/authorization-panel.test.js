import { fixture, assert, nextFrame, aTimeout } from '@open-wc/testing';
import sinon from 'sinon/pkg/sinon-esm.js';
import { IronMeta } from '@polymer/iron-meta/iron-meta.js';
import '../authorization-panel.js';

describe('<authorization-panel>', function() {
  async function basicFixture() {
    return (await fixture(`<authorization-panel></authorization-panel>`));
  }

  describe('initialization', () => {
    it('can be initialized with document.createElement', () => {
      const element = document.createElement('authorization-panel');
      assert.ok(element);
    });

    it('authMethods is set to defaults', async () => {
      const element = await basicFixture();
      assert.deepEqual(element.authMethods, element.supportedMethods);
    });

    it('selectes default method', async () => {
      const element = await basicFixture();
      assert.equal(element.selected, 0);
    });

    it('does not render authorization panel', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('.auth-panel > *');
      assert.equal(node, null);
    });

    it('renders no method info when authMethods are not set', async () => {
      const element = await basicFixture();
      element.authMethods = undefined;
      await nextFrame();
      const node = element.shadowRoot.querySelector('.no-method-info');
      assert.ok(node);
    });
  });

  describe('switching panels', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renders basic panel', async () => {
      element.selected = 1;
      await nextFrame();
      const node = element.shadowRoot.querySelector('auth-method-basic');
      assert.ok(node);
    });

    it('renders NTLM panel', async () => {
      element.selected = 2;
      await nextFrame();
      const node = element.shadowRoot.querySelector('auth-method-ntlm');
      assert.ok(node);
    });

    it('renders digest panel', async () => {
      element.selected = 3;
      await nextFrame();
      const node = element.shadowRoot.querySelector('auth-method-digest');
      assert.ok(node);
    });

    it('renders oauth2 panel', async () => {
      element.selected = 4;
      await nextFrame();
      const node = element.shadowRoot.querySelector('auth-method-oauth2');
      assert.ok(node);
    });

    it('renders oauth1 panel', async () => {
      element.selected = 5;
      await nextFrame();
      const node = element.shadowRoot.querySelector('auth-method-oauth1');
      assert.ok(node);
    });
  });

  describe('forceTokenAuthorization()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('renturns false when no valid selection', () => {
      element.selected = undefined;
      const result = element.forceTokenAuthorization();
      assert.isFalse(result);
    });

    it('renturns false when unsupported method is selected', async () => {
      element.selected = 1;
      await nextFrame();
      const result = element.forceTokenAuthorization();
      assert.isFalse(result);
    });

    it('calls authorize on OAuth2 panel', async () => {
      element.selected = 4;
      await nextFrame();
      const panel = element.shadowRoot.querySelector('auth-method-oauth2');
      const spy = sinon.spy(panel, 'authorize');
      element.forceTokenAuthorization();
      assert.isTrue(spy.called);
    });

    it('calls authorize on OAuth1 panel', async () => {
      element.selected = 5;
      await nextFrame();
      const panel = element.shadowRoot.querySelector('auth-method-oauth1');
      const spy = sinon.spy(panel, 'authorize');
      element.forceTokenAuthorization();
      assert.isTrue(spy.called);
    });
  });

  describe('<iron-meta> support', () => {
    let element;
    const available = [{
      type: 'none',
      name: 'No authorization'
    }, {
      type: 'Digest Authentication',
      name: 'Digest Authentication'
    }, {
      type: 'OAuth 1.0',
      name: 'OAuth 1.0'
    }, {
      type: 'OAuth 2.0',
      name: 'OAuth 2.0'
    }];

    const metaValues = [null, 'digest', 'oauth1', 'oauth2'];

    after(() => {
      new IronMeta({key: 'auth-methods'}).value = undefined;
    });

    beforeEach(async () => {
      new IronMeta({key: 'auth-methods'}).value = metaValues;
      element = await basicFixture();
    });

    it('returns methods defined in iron-meta', () => {
      const items = element._listMetaAuthMethods();
      assert.deepEqual(items, available);
    });

    it('handles string values', () => {
      new IronMeta({key: 'auth-methods'}).value = JSON.stringify(metaValues);
      const items = element._listMetaAuthMethods();
      assert.deepEqual(items, available);
    });

    it('sets only supported methods after initialization', () => {
      assert.deepEqual(element.authMethods, available);
    });

    it('handles errors', () => {
      new IronMeta({key: 'auth-methods'}).value = '{test: true}';
      const items = element._listMetaAuthMethods();
      assert.isUndefined(items);
    });

    it('handles basic and ntlm', () => {
      new IronMeta({key: 'auth-methods'}).value = ['basic', 'ntlm'];
      const items = element._listMetaAuthMethods();
      assert.deepEqual(items, [{
        type: 'Basic Authentication',
        name: 'Basic Authentication'
      }, {
        type: 'ntlm',
        name: 'NTLM'
      }]);
    });

    it('ignores custom methods', () => {
      new IronMeta({key: 'auth-methods'}).value = ['other'];
      const items = element._listMetaAuthMethods();
      assert.deepEqual(items, []);
    });
  });

  describe('_clearAuthHeader()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('dispatches bubbling request-header-deleted event', () => {
      const spy = sinon.spy();
      element.addEventListener('request-header-deleted', spy);
      element._clearAuthHeader();
      const e = spy.args[0][0];
      assert.isTrue(e.bubbles);
      assert.equal(e.detail.name, 'authorization');
    });

    it('dispatches cancelable event', () => {
      const spy = sinon.spy();
      element.addEventListener('request-header-deleted', spy);
      element._clearAuthHeader();
      const e = spy.args[0][0];
      assert.isTrue(e.cancelable);
    });
  });

  describe('_ensureAuthHeaderRemoved()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls _clearAuthHeader() when basic auth', async () => {
      const spy = sinon.spy(element, '_clearAuthHeader');
      element._ensureAuthHeaderRemoved(1);
      assert.isTrue(spy.called);
    });

    it('calls _clearAuthHeader() when oauth2 auth', async () => {
      const spy = sinon.spy(element, '_clearAuthHeader');
      element._ensureAuthHeaderRemoved(4);
      assert.isTrue(spy.called);
    });

    it('calls _clearAuthHeader() when oauth1 auth', async () => {
      const spy = sinon.spy(element, '_clearAuthHeader');
      element._ensureAuthHeaderRemoved(5);
      assert.isTrue(spy.called);
    });

    it('ignores other methods', async () => {
      const spy = sinon.spy(element, '_clearAuthHeader');
      element._ensureAuthHeaderRemoved(2);
      assert.isFalse(spy.called);
    });
  });

  describe('Selection value change', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls _ensureAuthHeaderRemoved()', () => {
      element.selected = 1;
      const spy = sinon.spy(element, '_ensureAuthHeaderRemoved');
      element.selected = 2;
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 1, 'has previous selection as an argument');
    });

    it('calls _notifySettings()', () => {
      const spy = sinon.spy(element, '_notifySettings');
      element.selected = 2;
      assert.isTrue(spy.called);
    });
  });

  describe('clear()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('removes settings', () => {
      element.settings = { test: true };
      element.clear();
      assert.deepEqual(element.settings, {});
    });

    it('resets selected', () => {
      element.selected = 1;
      element.clear();
      assert.equal(element.selected, undefined);
    });

    it('resets _authRequired', () => {
      element._authRequired = true;
      element.clear();
      assert.equal(element._authRequired, false);
    });

    it('resets invalid', () => {
      element.invalid = true;
      element.clear();
      assert.equal(element.invalid, false);
    });
  });

  describe('restore()', () => {
    let element;
    let settings;
    beforeEach(async () => {
      element = await basicFixture();
      settings = {
        settings: {
          username: 'uname',
          password: 'passwd',
        },
        type: 'Basic Authentication'
      };
    });

    it('clears selection when no argument', () => {
      element.selected = 2;
      element.restore();
      assert.isUndefined(element.selected);
    });

    it('clears selection when selected 0', () => {
      element.selected = 0;
      element.restore();
      assert.isUndefined(element.selected);
    });

    it('ignores when no selection', () => {
      element.selected = undefined;
      element.restore();
      // coverage
    });

    it('ignores when no auth methods', () => {
      element.authMethods = undefined;
      element.restore();
      // no error + coverage
    });

    it('ignores when restoring settings is for not currentl rendered panel', () => {
      settings.type = 'other';
      element.restore(settings);
      assert.isUndefined(element.settings);
    });

    it('updates setting on the element', async () => {
      element.selected = 1;
      await nextFrame();
      element.restore(settings);
      assert.deepEqual(element.settings, settings);
    });

    it('updates setting when using panels name', async () => {
      element.selected = 1;
      await nextFrame();
      settings.type = 'basic';
      element.restore(settings);
      assert.deepEqual(element.settings, settings);
    });

    it('calls restore on the panel', async () => {
      element.selected = 1;
      await nextFrame();
      const node = element.shadowRoot.querySelector('auth-method-basic');
      const spy = sinon.spy(node, 'restore');
      element.restore(settings);
      await aTimeout();
      assert.deepEqual(spy.args[0][0], settings.settings);
    });

    it('sets settings on the panelthat is not currently selected', async () => {
      element.restore(settings);
      await aTimeout();
      const node = element.shadowRoot.querySelector('auth-method-basic');
      assert.equal(node.username, settings.settings.username);
    });
  });

  describe('Model handing', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets settings received from the panel', async () => {
      element.selected = 1;
      // commiting changes to the DOM
      await nextFrame();
      // panel commiting changes
      await nextFrame();
      // panel debouncer
      await aTimeout();
      assert.deepEqual(element.settings, {
        type: 'basic',
        valid: false,
        settings: {
          hash: '',
          username: '',
          password: ''
        }
      });
    });

    it('ignores when readOnly', async () => {
      element.selected = 1;
      element.readOnly = true;
      await nextFrame();
      await nextFrame();
      await aTimeout();
      assert.isUndefined(element.settings);
    });

    it('ignores when disabled', async () => {
      element.selected = 1;
      element.disabled = true;
      await nextFrame();
      await nextFrame();
      await aTimeout();
      assert.isUndefined(element.settings);
    });
  });

  describe('a11y', () => {
    it('is accessible when empty', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element);
    });
  });
});
