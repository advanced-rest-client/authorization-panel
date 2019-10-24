import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator/arc-data-generator.js';
import '@advanced-rest-client/arc-models/client-certificate-model.js';
import '../authorization-panel.js';

describe('Basic authentication', function() {
  async function basicFixture() {
    return (await fixture(`<authorization-panel selected="6"></authorization-panel>`));
  }

  async function queryDataFixture() {
    return new Promise((resolve, reject) => {
      const elmRequest = fixture(html`<div>
        <client-certificate-model></client-certificate-model>
        <authorization-panel selected="6"></authorization-panel>
      </div>`);
      window.addEventListener('client-certificate-list', function f(e) {
        window.removeEventListener('client-certificate-list', f);
        const { detail } = e;
        setTimeout(() => {
          detail.result
          .then(() => elmRequest)
          .then((node) => {
            resolve(node.querySelector('authorization-panel'));
          })
          .catch((cause) => reject(cause));
        });
      });
    });
  }

  describe('initialization', () => {
    it('renders the panel from selected attribute', async () => {
      const element = await basicFixture();
      const node = element.shadowRoot.querySelector('auth-method-certificate');
      assert.ok(node);
    });

    it('has no panels settings when no certificates', async () => {
      const element = await basicFixture();
      await aTimeout();
      assert.isUndefined(element.settings);
    });

    it('panel is valid', async () => {
      const element = await basicFixture();
      await aTimeout();
      assert.isFalse(element.invalid);
    });
  });

  describe('Certificates data', () => {
    before(async () => {
      await DataGenerator.insertCertificatesData({});
    });

    after(async () => {
      await DataGenerator.destroyClientCertificates();
    });

    let element;
    beforeEach(async () => {
      element = await queryDataFixture();
    });

    it('has no settings when no selection', async () => {
      assert.notOk(element.settings);
    });

    it('has settings when certificate is selected', async () => {
      const panel = element.shadowRoot.querySelector('auth-method-certificate');
      const item = panel.items[0];
      const id = item._id;
      panel.selected = id;
      await aTimeout();
      await aTimeout();
      assert.typeOf(element.settings, 'object');

      assert.deepEqual(element.settings.settings, { id }, 'settings is set');
      assert.isTrue(element.settings.valid, 'valid is set');
      assert.equal(element.settings.type, 'client-certificate', 'type is set');
    });

    it('dispatches authorization-settings-changed', async () => {
      const spy = sinon.spy();
      element.addEventListener('authorization-settings-changed', spy);
      const panel = element.shadowRoot.querySelector('auth-method-certificate');
      const item = panel.items[0];
      const id = item._id;
      panel.selected = id;
      await aTimeout();
      await aTimeout();
      assert.isTrue(spy.called, 'event is dispatched');
      const { detail } = spy.args[0][0];
      assert.deepEqual(detail.settings, { id }, 'settings is set');
      assert.isTrue(detail.valid, 'valid is set');
      assert.equal(detail.type, 'client-certificate', 'type is set');
    });
  });
});
