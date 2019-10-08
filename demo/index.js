import { html, render } from 'lit-html';
import { LitElement } from 'lit-element';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@api-components/api-navigation/api-navigation.js';
import '@advanced-rest-client/oauth-authorization/oauth2-authorization.js';
import '@advanced-rest-client/oauth-authorization/oauth1-authorization.js';
import '../authorization-panel.js';

class DemoElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('demo-element', DemoElement);

class ComponentDemo extends ApiDemoPageBase {
  constructor() {
    super();
    this._componentName = 'authorization-panel';

    this.initObservableProperties([
      'outlined',
      'compatibility',
      'readOnly',
      'disabled',
      'authSettings',
      'authSettingsValue',
      'security',
      'httpHeaders'
    ]);
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.httpHeaders = '';
    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this._authSettingsChanged = this._authSettingsChanged.bind(this);
    this._headerChanged = this._headerChanged.bind(this);
    this.redirectUri = location.origin +
      '/node_modules/@advanced-rest-client/oauth-authorization/oauth-popup.html';
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _authSettingsChanged(e) {
    const value = e.detail;
    this.authSettings = value;
    this.authSettingsValue = value ? JSON.stringify(value, null, 2) : '';
  }

  get helper() {
    if (!this.__helper) {
      this.__helper = document.getElementById('helper');
    }
    return this.__helper;
  }

  _navChanged(e) {
    const { selected, type } = e.detail;
    if (type === 'method') {
      this.setData(selected);
      this.hasData = true;
    } else {
      this.hasData = false;
    }
  }

  setData(selected) {
    const helper = this.helper;
    const webApi = helper._computeWebApi(this.amf);
    const method = helper._computeMethodModel(webApi, selected);
    const key = helper._getAmfKey(helper.ns.raml.vocabularies.security + 'security');
    this.security = helper._ensureArray(method[key]);
  }

  _headerChanged(e) {
    const { name, value } = e.detail;
    this.httpHeaders = `${name}: ${value}`;
  }

  _apiListTemplate() {
    return [
      ['demo-api', 'Demo API'],
      ['SE-12042', 'Default values issue (SE-12042)'],
      ['SE-12224', 'Scope is not an array issues (SE-12224)'],
      ['APIC-168', 'Custom scheme support (APIC-168)']
    ].map(([file, label]) => html`
      <paper-item data-src="${file}-compact.json">${label} - compact model</paper-item>
      <paper-item data-src="${file}.json">${label}</paper-item>
      `);
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      outlined,
      compatibility,
      readOnly,
      disabled,
      amf,
      security,
      redirectUri
    } = this;
    return html `
    <section class="documentation-section">
      <h3>Interactive demo</h3>
      <p>
        This demo lets you preview the OAuth2 authorization method element with various
        configuration options.
      </p>

      <section role="main" class="horizontal-section-container centered main">
        ${this._apiNavigationTemplate()}
        <div class="demo-container">

          <arc-interactive-demo
            .states="${demoStates}"
            @state-chanegd="${this._demoStateHandler}"
            ?dark="${darkThemeActive}"
          >

            <authorization-panel
              slot="content"
              .amf="${amf}"
              .securedBy="${security}"
              ?outlined="${outlined}"
              ?compatibility="${compatibility}"
              ?readOnly="${readOnly}"
              ?disabled="${disabled}"
              .redirectUri="${redirectUri}"
              @authorization-settings-changed="${this._authSettingsChanged}"
              @request-header-deleted="${this._headerDeleted}"
              @request-header-changed="${this._headerChanged}"></authorization-panel>

            <label slot="options" id="mainOptionsLabel">Options</label>
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="readOnly"
              @change="${this._toggleMainOption}"
              >Read only</anypoint-checkbox
            >
            <anypoint-checkbox
              aria-describedby="mainOptionsLabel"
              slot="options"
              name="disabled"
              @change="${this._toggleMainOption}"
              >Disabled</anypoint-checkbox
            >
          </arc-interactive-demo>
        </div>
      </section>
    </section>`;
  }

  _introductionTemplate() {
    return html `
      <section class="documentation-section">
        <h3>Introduction</h3>
        <p>
          A web component to render accessible OAuth2 authorization form.
        </p>
        <p>
          This component implements Material Design styles.
        </p>

        <h3>Settings data model</h3>
        <p>
          After updating a value in the editor it produces a data model:
        </p>

        <output>${this.authSettingsValue ? this.authSettingsValue : 'Model not ready'}</output>

        <h3>Handling headers state</h3>
        <p>
          The element dispatches events that controls headers state. It iupdates <code>authorization</code>
          header when required by selected method.
        </p>

        <output>${this.httpHeaders ? this.httpHeaders : 'Headers not set'}</output>
      </section>
    `;
  }

  _usageTemplate() {
    return html `
      <section class="documentation-section">
        <h2>Usage</h2>
        <p>Anypoint dropdown menu comes with 3 predefied styles:</p>
        <ul>
          <li><b>Filled</b> (default)</li>
          <li><b>Outlined</b></li>
          <li>
            <b>Compatibility</b> - To provide compatibility with Anypoint design
          </li>
        </ul>
      </section>`;
  }

  _render() {
    const { amf } = this;
    render(html`
      ${this.headerTemplate()}

      <demo-element id="helper" .amf="${amf}"></demo-element>
      <oauth2-authorization></oauth2-authorization>

        ${this._demoTemplate()}
        ${this._introductionTemplate()}
        ${this._usageTemplate()}
      `, document.querySelector('#demo'));
  }
}
const instance = new ComponentDemo();
instance.render();
window.demo = instance;
