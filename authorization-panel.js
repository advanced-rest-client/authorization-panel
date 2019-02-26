/**
@license
Copyright 2019 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status.js';
import {EventsTargetMixin} from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {AmfHelperMixin} from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-meta/iron-meta.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@advanced-rest-client/auth-methods/auth-methods.js';
import '@advanced-rest-client/auth-methods/auth-method-step.js';
/**
 * Authorization panel used in the request panel to get user authorization information.
 *
 * It is a set of forms that allow set up the authorization method for a HTTP request.
 *
 * The element do not perform authorization. Depending on selected method there
 * are different ways of dealing with the authorization.
 *
 * ## Auth methods availability
 *
 * By default the element renders all authorization methods available to it.
 *
 * Currently these are:
 * - none (auth is optional)
 * - basic
 * - digest
 * - ntlm
 * - OAuth 2.0
 * - OAuth 1.0
 *
 * The list can be changed by setting the `securedBy` property to the
 * [AMF](https://github.com/mulesoft/amf) security description.
 *
 * Alternatively, use `iron-meta` element with `key` property set to `auth-methods`
 * and `value` property set to list of suppored methods.
 *
 * #### Example
 *
 * ```html
 * <iron-meta key="auth-methods" value='[null, "basic", "oauth1", "oauth2"]'></iron-meta>
 * ```
 *
 * Keys can be any of `none`, `basic`, `ntlm`, `digest`, `oauth1` and `oauth2`.
 *
 * Note, that if you set meta data and `securedBy` property it will use combination
 * of both. The base list of rendered methods is meta data list and then reduced to
 * defined in RAML methods. Also note, that custom auth methods are always rendered.
 *
 * ## Supported methods
 *
 * Detailed information about authorization methods can be find in the
 * [auth-methods documentation page]
 * (https://elements.advancedrestclient.com/elements/auth-methods).
 *
 * ### Basic Authentication
 *
 * The element sends the `request-header-changed` custom event to inform any other
 * element that is listening to this event that header value has changed
 * (Authorization in this case). The `raml-headers-form` is an example of an
 * element that is listening for this event and change request headers value
 * when auth data change.
 *
 * ### OAuth 2.0
 *
 * The [Oauth 2 form]
 * (https://elements.advancedrestclient.com/elements/auth-methods?active=auth-method-oauth2)
 * sends the `oauth2-token-requested` custom event with the OAuth settings provided
 * by the user.
 * Any element / hosting app can handle this event and perform authorization.
 * ARC elements provides the
 * [oauth2-authorization](https://elements.advancedrestclient.com/elements/oauth-authorization)
 * element (from the `oauth-authorization` package) that can be placed anywhere
 * in the DOM (from current element where `authorization-panel` is attached up
 * to the body) and perform OAuth athorization.
 *
 * However it can be also done by any other element / app  or even server.
 * See `<oauth2-authorization>` for detailed documentation.
 *
 *
 * Note: OAuth 2.0 server flow probably will not work in regular browser
 * environment because main providers aren't setting CORS headers. Therefore the
 * request will be canceled by the browser.
 *
 * To make it work, handle the `oauth2-token-requested` fired from the inside of this element.
 * If it's browser flow type (implicit) then the `oauth2-authorization` element can be used.
 * For other other types, handle and cancel the event and use server to handle token exchange.
 * The ARC elements offers a
 * [Chrome extension](https://github.com/advanced-rest-client/api-console-extension)
 * that once installed will propxy auth requests and made the exchange even for
 * the server flow. The application should use
 * [api-console-ext-comm](https://github.com/advanced-rest-client/api-console-ext-comm)
 * element to communicate with the extension.
 *
 * #### `redirect-url` property for OAuth 2.0
 *
 * OAuth protocol requires to define a redirect URL that is registered in the
 * OAuth provider. The redirect URL should point to a page that will pass the URL
 * parameters to the opener page (OAuth 2 panel).
 * If you application uses the
 * [oauth-authorization](https://elements.advancedrestclient.com/elements/oauth-authorization)
 * element then it provides a popup that pases the data back to the application.
 * In this case your redirect URL would be
 * `https://your.domain.com/bower_components/oauth-authorization/oauth-popup.html`.
 * User have to change OAuth provider's settings and adjust the redirect URL to
 * point to this page.
 *
 * You can also use the
 * [oauth-popup.html]
 * (https://github.com/advanced-rest-client/oauth-authorization/blob/stage/oauth-popup.html)
 * to build your own page.
 *
 * ### OAuth 1.0a
 *
 * Oauth 1a is not currently supported. However, it uses obsolite hashing
 * algorithms and should not be used.
 *
 * ### Digest Authentication
 *
 * When the user provide all required information for Digest authorization then
 * this element will fire `request-header-changed` custom event which will do the
 * same thing as in case of Basic authentication.
 *
 * ### Example
 *
 * ```
 * <authorization-panel
 *  redirect-url="http://domain.com/bower_components/oauth-authorization/oauth-popup.html"
 *  ></authorization-panel>
 * ```
 *
 * ### Styling
 *
 * `<authorization-panel>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--authorization-panel` | Mixin applied to the element | `{}`
 * `--arc-font-body1` | Theme mixin, Mixin applied to the elements that are containg text | `{}`
 * `--empty-info` | Mixin applied to the element that renders no methods availability message | `{}`
 *
 * Also check [auth-methods documentation page]
 * (https://elements.advancedrestclient.com/elements/auth-methods)
 * for methods styling instructions.
 *
 * ## Changes in version 2
 *
 * - Renamed properties:
 *  - `redirectUrl` -> `redirectUri`
 *  - `_restoreSettings()` is not `restore()` function
 * - `auth-settings-changed` custom event is stopped from bubbling. Listen for
 * `authorization-settings-changed` event instead.
 *
 * @customElement
 * @polymer
 * @memberof UiElements
 * @appliesMixin EventsTargetMixin
 * @appliesMixin AmfHelperMixin
 * @demo demo/basic.html Basic element
 * @demo demo/meta-data.html IronMeta defined methods
 * @demo demo/amf.html RAML or OAS data from AMF model
 * @demo demo/amf-meta.html RAML or OAS data from AMF model and IronMeta
 */
class AuthorizationPanel extends AmfHelperMixin(EventsTargetMixin(PolymerElement)) {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      @apply --authorization-panel;
    }

    .auth-container {
      position: relative;
    }

    .no-method-info {
      @apply --arc-font-body1;
      @apply --empty-info;
    }

    paper-item:hover {
      @apply --paper-item-hover;
    }
    </style>
    <div class="auth-container">
      <template is="dom-if" if="[[!hasAuthMethods]]">
        <p class="no-method-info">Authorization method for current endpoint is not supported.</p>
      </template>
      <auth-method-step step-start-index="0"
        step="1" no-steps="[[noSteps]]" inactive="[[isSelected]]" on-inactive-tap="_clearSelection">
        <span slot="title">Authorization method</span>
        <span slot="inactive-title">[[_computeSelectedLabel(selected)]]</span>
        <paper-dropdown-menu label="Authorization method">
          <paper-listbox slot="dropdown-content" selected="{{selected}}">
            <template is="dom-repeat" items="[[authMethods]]">
              <paper-item>[[item.name]]</paper-item>
            </template>
          </paper-listbox>
        </paper-dropdown-menu>
      </auth-method-step>
      <section class="auth-panel"></section>
    </div>
`;
  }

  static get is() {
    return 'authorization-panel';
  }
  static get properties() {
    return {
      /**
       * Selected authorization type. It is one of the types supported by
       * `advanced-rest-client/auth-methods` component.
       *
       * This corresponds to the index of `authMethods` array.
       */
      selected: {
        type: Number,
        notify: true,
        observer: '_selectedChanged'
      },
      /**
       * Computed value. `true` when authorization method is selected.
       */
      isSelected: {
        type: Boolean,
        value: false,
        computed: '_computeIsSelected(selected)'
      },
      /**
       * Computed value from the AMF model.
       * If authorization is required by endpoint defined in the model,
       * then internally this property is set to `true`.
       *
       * It can be `false` if `selected` is `none`, meaning RAML spec
       * allows no authorization.
       */
      authRequired: {
        type: Boolean,
        value: false,
        notify: true
      },
      /**
       * Determines if the user propertly provided authorization data into the
       * authorization form.
       *
       * For OAuth 1/2 authorization token must be set for this to be computed
       * to `true`.
       *
       * This property is only relevant when `authRequired` is set to true.
       * This status can be cancelled by setting `authRequired` to false.
       */
      authValid: {
        type: Boolean,
        value: true,
        notify: true,
        computed: '_computeAuthValid(settings.valid, selected, authRequired)'
      },
      /**
       * Computed value of validation state.
       * To be used with CSS selectors to style the element when the authorization
       * form is onvalid.
       *
       * Example:
       *
       * ```css
       * authorization-panel[invalid] {
       *  border: 1px red solid;
       * }
       * ```
       */
      invalid: {
        type: Boolean,
        reflectToAttribute: true,
        computed: '_computeInvalid(authValid)'
      },
      /**
       * Current settings of selected auth type.
       *
       * Can be `undefined` if the user hasn't filled all required fields in the
       * form.
       */
      settings: {
        type: Object,
        notify: true
      },
      /**
       * Security definition for an endpoint in AMF json/ld model.
       * It is `http://raml.org/vocabularies/security#security`
       * property of the `http://www.w3.org/ns/hydra/core#supportedOperation`
       * property of an endpoint.
       */
      securedBy: {
        type: Array
      },
      /**
       * The OAuth2 redirect URL to be set in the OAuth2 form pane.
       */
      redirectUri: {
        type: Boolean,
        observer: '_redirectUriChanged'
      },
      /**
       * List of currently rendered authorization methods.
       * This value changes when `securedBy` changes to reflect number of
       * authorization methods supported by current endpoint.
       */
      authMethods: Array,
      /**
       * Computed value, `true` if any method is rendered.
       */
      hasAuthMethods: {
        type: Boolean,
        value: false,
        computed: '_computeHasAuthMethods(authMethods)'
      },
      /**
       * If true then the numbered steps aren't rendered.
       */
      noSteps: {
        type: Boolean,
        value: false,
        observer: '_nostepChanged'
      },
      /**
       * List of currently available custom security schemes declared in
       * the AMF
       */
      customSchemes: Array,
      // If true then the ripple effect on step title is disabled.
      noink: {
        type: Boolean,
        observer: '_noinkChanged'
      },
      /**
       * If true the panels won't render inline documentation if
       * the information is available.
       */
      noDocs: {
        type: Boolean,
        observer: '_noDocsChanged'
      },
      // Current HTTP method. Passed to digest method.
      httpMethod: {
        type: String,
        observer: '_requestMethodChanged'
      },
      // Current request URL. Passed to digest method.
      requestUrl: {
        type: String,
        observer: '_requestUrlChanged'
      },
      // Current request body. Passed to digest method.
      requestBody: {
        type: String,
        observer: '_requestBodyChanged'
      },
      /**
       * If set, automatically selects first authorization method from
       * the `amfSettings`.
       */
      autoSelect: Boolean,
      /**
       * When set, changes in the auth panels are not propagated through
       * the application.
       */
      readonly: Boolean
    };
  }

  /**
   * List of authorization methods supported by this element.
   * Each item has `id` and `name` property. The `id` is internal ID for
   * authorization methods. Can be any of: `none`, `basic`, `ntlm`, `digest`,
   * `oauth1` and `oauth2`. The `name` property is a lable for the method
   * used in UI.
   * @return {Array<Object>}
   */
  get supportedMethods() {
    return [{
      'type': 'none',
      'name': 'No authorization'
    }, {
      'type': 'Basic Authentication',
      'name': 'Basic authentication'
    }, {
      'type': 'ntlm',
      'name': 'NTLM'
    }, {
      'type': 'Digest Authentication',
      'name': 'Digest authentication'
    }, {
      'type': 'OAuth 2.0',
      'name': 'OAuth 2.0'
    }, {
      'type': 'OAuth 1.0',
      'name': 'OAuth 1.0'
    }];
  }

  static get observers() {
    return [
      '_authSettingsUpdated(settings.*)',
      '_passEventsTarget(eventsTarget)',
      '_securedByChanged(securedBy, amfModel)',
      '_amfModelChanged(amfModel)'
    ];
  }
  /**
   * @return {HTMLElement} Currently rendered authorization panel.
   */
  get currentPanel() {
    if (!this.shadowRoot) {
      return;
    }
    const selector = '[data-auth-panel]';
    return this.shadowRoot.querySelector(selector);
  }

  constructor() {
    super();
    this._authSettingsHandler = this._authSettingsHandler.bind(this);
    this._onAuthSettingsChanged = this._onAuthSettingsChanged.bind(this);
  }

  _attachListeners() {
    if (!this.authMethods) {
      this.set('authMethods', this._listAuthMethods());
    }
    this.addEventListener('auth-settings-changed', this._authSettingsHandler);
    this.addEventListener('authorization-settings-changed', this._onAuthSettingsChanged);
  }

  _detachListeners() {
    this.removeEventListener('auth-settings-changed', this._authSettingsHandler);
    this.removeEventListener('authorization-settings-changed', this._onAuthSettingsChanged);
  }

  ready() {
    super.ready();
    afterNextRender(this, () => {
      if (this.selected >= 0) {
        this._selectedChanged(this.selected, this.selected);
        this._updateValidationState();
      }
      if (this.selected === undefined && this.settings) {
        this.restore(this.settings);
      }
    });
  }
  /**
   * Clears the state of the panel.
   */
  clear() {
    this.selected = -1;
    this.settings = {};
  }

  /**
   * Replaces active panel with new one and dipatches
   * `authorization-type-changed` event.
   *
   * If the event is canceled it restores previous value in the selector.
   *
   * @param {Number} selected
   * @param {Number} oldValue
   */
  _selectedChanged(selected, oldValue) {
    this._ensureAuthHeaderRemoved(oldValue);
    if (selected === -1 || selected === undefined) {
      this.__removeExistingPanel();
      this._notifySettings();
      return;
    }
    const methods = this.authMethods;
    if (!methods) {
      return;
    }
    const item = methods[selected];
    if (!item) {
      this.set('settings', undefined);
      return;
    }
    if (oldValue !== undefined) {
      this._analyticsEvent('authorization-panel', 'usage-auth-method', item.type);
    }
    if (!this._cancelSettingsProcessing && !this.__notifySelectionChanged(item.type)) {
      this.set('selected', oldValue);
      return;
    }
    this.set('settings', undefined);
    this.__removeExistingPanel();
    this.__createAuthPanel(item);
    this.__latestSelected = selected;
    afterNextRender(this, () => this._updateValidationState());
  }
  /**
   * Ensures that the authorization header is removed if previously
   * selected (and now deselected) type is one of using Authorization
   * header.
   * @param {Number} oldSelected Previously selected auth method
   */
  _ensureAuthHeaderRemoved(oldSelected) {
    const methods = this.authMethods;
    if (oldSelected === undefined || !methods) {
      return;
    }
    const oldMethod = methods[oldSelected];
    const type = oldMethod && this._panelTypeToRamType(oldMethod.type);
    if (type && ['Basic Authentication', 'OAuth 1.0', 'OAuth 2.0']
      .indexOf(type) !== -1) {
      this._clearAuthHeader();
    }
  }
  /**
   * Dispatches `request-header-deleted` custom event to inform listeners
   * that `authorization` header should not be used.
   */
  _clearAuthHeader() {
    this.dispatchEvent(new CustomEvent('request-header-deleted', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: {
        name: 'authorization'
      }
    }));
  }
  /**
   * Dispatches `authorization-type-changed`.
   *
   * @param {String} selected Current selection of the auth method
   * @return {Boolean} Whether selectoin was cancelled.
   */
  __notifySelectionChanged(selected) {
    const e = this.fire('authorization-type-changed', {
      type: selected
    }, {
      cancelable: true
    });
    return !e.defaultPrevented;
  }
  /**
   * Removes any existing authorization panel from local DOM.
   */
  __removeExistingPanel() {
    const panel = this.currentPanel;
    if (!panel) {
      return;
    }
    panel.parentNode.removeChild(panel);
  }
  /**
   * Creates an authorization panel described as a `selected`.
   *
   * @param {Object} selected Model from `authMethods`
   */
  __createAuthPanel(selected) {
    switch (selected.type) {
      case 'none':
        this.set('settings', {valid: true, type: 'none'});
        this._clearAuthHeader();
        break;
      case 'Basic Authentication': this.__createBasicAuth(); break;
      case 'Digest Authentication': this.__createDigestAuth(); break;
      case 'ntlm': this.__createNtlmAuth(); break;
      case 'OAuth 1.0': this.__createOauth1Auth(selected); break;
      case 'OAuth 2.0': this.__createOauth2Auth(selected); break;
      case 'x-custom': this.__createCustomAuth(selected); break;
      default: this.__createUnsupportedAuth(selected); break;
    }
    afterNextRender(this, () => {
      let settings;
      if (selected.type === 'none') {
        settings = {
          valid: true
        };
      } else {
        const panel = this.currentPanel;
        settings = panel && panel.getSettings ? panel.getSettings() : undefined;
      }
      this._notifySettings(settings);
    });
  }
  /**
   * Adds shared properties for all panels.
   *
   * @param {HTMLElement} panel
   * @param {String} type Authorization type.
   */
  __addCommonProperties(panel, type) {
    panel.eventsTarget = this.eventsTarget;
    panel.dataset.type = type;
    panel.dataset.authPanel = true;
    panel.noSteps = this.noSteps;
    panel.noink = this.noink;
    panel.readonly = this.readonly;
    panel.amfModel = this.amfModel;
    panel.noDocs = this.noDocs;
  }
  /**
   * Creates instance of Basic auth panel and adds it to local DOM.
   */
  __createBasicAuth() {
    const panel = document.createElement('auth-method-basic');
    this.__addCommonProperties(panel, 'basic');
    this.shadowRoot.querySelector('.auth-panel').appendChild(panel);
  }
  /**
   * Creates instance of Digest auth panel and adds it to local DOM.
   */
  __createDigestAuth() {
    const panel = document.createElement('auth-method-digest');
    this.__addCommonProperties(panel, 'digest');
    panel.httpMethod = this.httpMethod;
    panel.requestUrl = this.requestUrl;
    panel.requestBody = this.requestBody;
    this.shadowRoot.querySelector('.auth-panel').appendChild(panel);
  }
  /**
   * Creates instance of NTLM auth panel and adds it to local DOM.
   */
  __createNtlmAuth() {
    const panel = document.createElement('auth-method-ntlm');
    this.__addCommonProperties(panel, 'ntlm');
    this.shadowRoot.querySelector('.auth-panel').appendChild(panel);
  }
  /**
   * Creates instance of OAuth1 auth panel and adds it to local DOM.
   *
   * @param {Object} selected Selected item from `authMethods`
   */
  __createOauth1Auth(selected) {
    const panel = document.createElement('auth-method-oauth1');
    this.__addCommonProperties(panel, 'oauth1');
    panel.redirectUrl = this.redirectUri;
    panel.amfSettings = this._computeAmfSettings(selected.type, selected.name);
    this.shadowRoot.querySelector('.auth-panel').appendChild(panel);
  }
  /**
   * Creates instance of OAuth2 auth panel and adds it to local DOM.
   *
   * @param {Object} selected Selected item from `authMethods`
   */
  __createOauth2Auth(selected) {
    const panel = document.createElement('auth-method-oauth2');
    this.__addCommonProperties(panel, 'oauth2');
    panel.redirectUri = this.redirectUri;
    panel.amfSettings = this._computeAmfSettings(selected.type, selected.name);
    this.shadowRoot.querySelector('.auth-panel').appendChild(panel);
  }
  /**
   * Creates instance of custom auth panel and adds it to local DOM.
   *
   * @param {Object} selected Selected item from `authMethods`
   */
  __createCustomAuth(selected) {
    const panel = document.createElement('auth-method-custom');
    this.__addCommonProperties(panel, 'custom');
    panel.amfSettings = this._computeAmfSettings(selected.type, selected.name);
    this.shadowRoot.querySelector('.auth-panel').appendChild(panel);
  }
  /**
   * Creates "unsuppoerted method" panel.
   *
   * @param {Object} selected Selected item from `authMethods`
   */
  __createUnsupportedAuth(selected) {
    const panel = document.createElement('div');
    const info = document.createElement('p');
    info.innerText = `Method ${selected.type} is not yet supported.`;
    info.className = 'no-method-info';
    panel.appendChild(info);
    this.__addCommonProperties(panel, 'unsupported');
    this.shadowRoot.querySelector('.auth-panel').appendChild(panel);
  }
  /**
   * Searches for AMF security description in the AMF model.
   *
   * @param {String} type Security scheme type as defined in RAML spec.
   * @param {?String} name Display name of the security scheme
   * @return {[type]} [description]
   */
  _computeAmfSettings(type, name) {
    const model = this.securedBy;
    if (!model) {
      return;
    }
    if (name === type) {
      name = undefined;
    }
    const secPrefix = this.ns.raml.vocabularies.security;
    for (let i = 0, len = model.length; i < len; i++) {
      const item = model[i];
      const shKey = this._getAmfKey(secPrefix + 'scheme');
      let scheme = item[shKey];
      if (!scheme) {
        continue;
      }
      if (scheme instanceof Array) {
        scheme = scheme[0];
      }
      const modelType = this._getValue(scheme, secPrefix + 'type');
      if (!modelType) {
        continue;
      }
      if (modelType === type) {
        if (!name) {
          return item;
        }
        let modelName = this._getValue(scheme, this.ns.schema.displayName);
        if (!modelName) {
          modelName = this._getValue(item, secPrefix + 'name');
        }
        if (modelName === name) {
          return item;
        }
      }
    }
  }
  /**
   * Changes property value on the panel, if any panel exists.
   * @param {String} prop The property name to set value on.
   * @param {any} value The value
   */
  _changePanelValue(prop, value) {
    const panel = this.currentPanel;
    if (!panel) {
      return;
    }
    panel[prop] = value;
  }
  /**
   * Updates `noSteps` property on current panel.
   *
   * @param {String} value New value to set
   */
  _nostepChanged(value) {
    this._changePanelValue('noSteps', value);
  }
  /**
   * Updates events target property on current panel.
   *
   * @param {HTMLElement} target New target
   */
  _passEventsTarget(target) {
    this._changePanelValue('eventsTarget', target);
  }
  /**
   * Updates `noink` property on panels.
   *
   * @param {Boolean} value Current value.
   */
  _noinkChanged(value) {
    this._changePanelValue('noink', value);
  }
  /**
   * Updates `noDocs` property on panels.
   *
   * @param {Boolean} value Current value.
   */
  _noDocsChanged(value) {
    this._changePanelValue('noDocs', value);
  }
  /**
   * Updates `redirectUri` property on oauth panels.
   *
   * @param {String} uri New value to set
   */
  _redirectUriChanged(uri) {
    const selected = this.authMethods && this.authMethods[this.selected];
    if (!selected || (selected.type !== 'OAuth 1.0' && selected.type !== 'OAuth 2.0')) {
      return;
    }
    this._changePanelValue('redirectUri', uri);
  }
  /**
   * Updates `httpMethod` property on Digest panel.
   *
   * @param {String} method
   */
  _requestMethodChanged(method) {
    const selected = this.authMethods && this.authMethods[this.selected];
    if (!selected || selected.type !== 'Digest Authentication') {
      return;
    }
    this._changePanelValue('httpMethod', method);
  }
  /**
   * Updates `requestUrl` property on Digest panel.
   *
   * @param {String} url
   */
  _requestUrlChanged(url) {
    const selected = this.authMethods && this.authMethods[this.selected];
    if (!selected || selected.type !== 'Digest Authentication') {
      return;
    }
    this._changePanelValue('requestUrl', url);
  }
  /**
   * Updates `requestBody` property on Digest panel.
   *
   * @param {String} body
   */
  _requestBodyChanged(body) {
    const selected = this.authMethods && this.authMethods[this.selected];
    if (!selected || selected.type !== 'Digest Authentication') {
      return;
    }
    this._changePanelValue('requestBody', body);
  }

  _amfModelChanged(amfModel) {
    this._changePanelValue('amfModel', amfModel);
  }
  /**
   * Lists available authorization methods.
   * By default it returns list from `supportedMethods` property which is the
   * list of all supported methods by this element.
   * If `iron-meta` element with key `auth-methods` is set then it will use
   * this information to compute list of auth methods.
   * See element description for more information.
   *
   * @return {Array<Object>} See `supportedMethods` property for data model.
   */
  _listAuthMethods() {
    const meta = this._listMetaAuthMethods();
    if (meta) {
      return meta;
    }
    return this.supportedMethods;
  }
  /**
   * Creates a listing of methods from `iron-meta` definition.
   *
   * @return {Array|undefined} List of methods defined in `iron-meta`
   * or undefined if not set.
   */
  _listMetaAuthMethods() {
    let meta = document.createElement('iron-meta').byKey('auth-methods');
    if (!meta) {
      return;
    }
    if (typeof meta === 'string') {
      try {
        meta = JSON.parse(meta);
      } catch (e) {
        return;
      }
    }
    if (!(meta instanceof Array)) {
      return;
    }
    const result = [];
    meta.forEach((key) => {
      let name;
      switch (key) {
        case null:
          name = 'No authorization';
          key = 'none';
          break;
        case 'ntlm':
          name = 'NTLM';
          break;
        case 'basic':
          name = 'Basic Authentication';
          key = name;
          break;
        case 'digest':
          name = 'Digest Authentication';
          key = name;
          break;
        case 'oauth1':
          name = 'OAuth 1.0';
          key = name;
          break;
        case 'oauth2':
          name = 'OAuth 2.0';
          key = name;
          break;
      }
      if (name) {
        result.push({
          type: key,
          name: name
        });
      }
    });
    return result;
  }
  /**
   * Updates validation state for the selected form.
   * When element is initializing and RAML's `securedBy` property is set
   * during the initialization time, events with settings are fired before the form
   * is ready.
   */
  _updateValidationState() {
    if (!this.selected || this.selected === -1 || !this.settings) {
      this.set('settings.valid', true);
      return;
    }
    const selected = this.authMethods[this.selected];
    if (!selected || selected.type === 'none') {
      this.set('settings', {
        valid: true
      });
      return;
    }
    let panel = this.currentPanel;
    if (!panel) {
      console.warn('The auth panel for %s not set', selected.type);
      return;
    }
    let state;
    try {
      // In case when the validation is called when the auth panel is still
      // initializing
      state = panel.validate();
    } catch (_) {
      state = true;
    }
    if (state && selected.type === 'OAuth 2.0') {
      if (this.settings && !this.settings.settings.tokenValue) {
        state = false;
      }
    }
    this.set('settings.valid', state);
  }

  /**
   * Handler for `auth-settings-changed` custom event.
   * Sets up `settings` property from the event.
   *
   * @param {CustomEvent} e
   */
  _authSettingsHandler(e) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (this.readonly) {
      return;
    }
    this.settings = e.detail;
    this._processPanelSettings(e.detail);
  }
  /**
   * Finds a RAML method name from both RAML type or auth panel type.
   * @param {String} type
   * @return {String|undefined} RAML type name
   */
  _panelTypeToRamType(type) {
    switch (type) {
      case 'none':
      case 'No authorization':
        return 'none';
      case 'ntlm':
      case 'NTLM':
        return 'ntlm';
      case 'basic':
      case 'Basic Authentication':
        return 'Basic Authentication';
      case 'digest':
      case 'Digest Authentication':
        return 'Digest Authentication';
      case 'oauth1':
      case 'OAuth 1.0':
        return 'OAuth 1.0';
      case 'oauth2':
      case 'OAuth 2.0':
        return 'OAuth 2.0';
    }
  }
  /**
   * Notifies about changes to authorization settings object.
   *
   * @param {Object} record Change record
   */
  _authSettingsUpdated(record) {
    if (this.readonly || record.path !== 'settings' || record.path.indexOf('.splices') !== -1) {
      return;
    }
    if (this._cancelSettingsProcessing) {
      return;
    }
    let base = record.base;
    if (!base || !base.type) {
      this.restore();
      return;
    }
    const type = this._panelTypeToRamType(base.type);
    if (!type) {
      return;
    }
    if ((this.selected === undefined || this.selected === -1)) {
      base.type = type;
      this.restore(base);
      return;
    }
    const selected = this.authMethods && this.authMethods[this.selected];
    if (selected && selected.type !== type) {
      base.type = type;
      this.restore(base);
      return;
    }
    if (this.__notyfyingSettings) {
      return;
    }
    this.__notyfyingSettings = true;
    setTimeout(() => {
      this._notifySettings(base);
      this.__notyfyingSettings = false;
    }, 25);
  }

  /**
   * Restores settings to a panel including selection and data.
   *
   * @param {Object} settings The same settings object as dispatched in
   * `detail` object from this element.
   */
  restore(settings) {
    if (!settings) {
      if (this.selected || this.selected === 0) {
        this.selected = undefined;
      }
      return;
    }
    const methods = this.authMethods;
    if (!methods) {
      return;
    }
    const index = methods.findIndex((item) => item.type === settings.type);
    if (index === -1) {
      return;
    }
    if (this.selected !== index) {
      this._cancelSettingsProcessing = true;
      this.selected = index;
      this._cancelSettingsProcessing = false;
    }
    const panel = this.currentPanel;
    if (panel) {
      // Can be no-auth panel
      panel.restore(settings.settings);
    }
    if (this.settings !== settings) {
      this._cancelSettingsProcessing = true;
      this.settings = settings;
      this._cancelSettingsProcessing = false;
    }
  }
  /**
   * Notifies settings change if currently selected method is the same as
   * `settings.type`.
   *
   * @param {Object} settings Authorization settings to notify.
   * @param {Object} selected Selected model.
   */
  _notifySettings(settings, selected) {
    if (this.readonly) {
      return;
    }

    if (!selected) {
      selected = this.authMethods && this.authMethods[this.selected];
    }
    let valid = false;
    let type;
    if (selected) {
      type = selected.type;
      if (selected.type === 'none') {
        valid = true;
      } else if (settings) {
        valid = settings.valid || false;
      } else if (this.authVaid) {
        valid = true;
      }
    } else {
      if (!this.authRequired) {
        valid = true;
      }
    }
    this.fire('authorization-settings-changed', {
      settings: settings,
      valid: valid,
      type: type
    });
  }
  /**
   * A handler called when the `securedBy` property changes.
   * It sets up the list of available auth methods
   *
   * @param {Array<Object>} secured List of AMF security definitions
   */
  _securedByChanged(secured) {
    if (!secured || !secured.length) {
      this.selected = -1;
      this.set('authRequired', false);
      this.set('authMethods', this._listAuthMethods());
      return;
    }
    if (this.__secChangeDebouncer) {
      return;
    }
    const supported = [];
    const secPrefix = this.ns.raml.vocabularies.security;
    let hasNull = false;
    for (let i = 0, len = secured.length; i < len; i++) {
      const item = secured[i];
      if (!this._hasType(item, secPrefix + 'ParametrizedSecurityScheme') &&
        !this._hasType(item, secPrefix + 'SecurityScheme')) {
        continue;
      }
      const shKey = this._getAmfKey(secPrefix + 'scheme');
      let scheme = item[shKey];
      if (!scheme) {
        hasNull = true;
        continue;
      }
      if (scheme instanceof Array) {
        scheme = scheme[0];
      }
      const type = this._getValue(scheme, secPrefix + 'type');
      if (!type) {
        hasNull = true;
        continue;
      }
      let name = this._getValue(scheme, this.ns.schema.displayName);
      if (!name) {
        if (type === 'x-custom') {
          name = this._getValue(item, secPrefix + 'name');
          if (!name) {
            name = 'Custom authorization';
          }
        } else {
          name = type;
        }
      }

      supported[supported.length] = {
        name: name,
        type: type
      };
    }
    if (hasNull) {
      supported.unshift({
        name: 'No authorization',
        type: 'none'
      });
    }
    this.set('authMethods', supported);
    if (supported.length !== 0) {
      if (this.selected === 0) {
        this.selected = -1;
      }
      this.selected = 0;
    }
    this._updateValidationState();
    const isRequired = !!(supported && supported.length) && !hasNull;
    this.set('authRequired', isRequired);
    this._analyticsEvent('authorization-panel', 'usage-amf', 'loaded');
    if (this.__latestSelected !== undefined) {
      if (supported.length > this.__latestSelected) {
        this.selected = this.__latestSelected;
      }
    } else if (isRequired && this.autoSelect) {
      afterNextRender(this, () => {
        this.selected = 0;
      });
    }
  }
  // Computes value for `isSelected` property.
  _computeIsSelected(selected) {
    return selected !== undefined && selected !== -1;
  }
  /**
   * Computes label for step title.
   * @param {String} selected ID of selected method.
   * @return {String} Label for selection.
   */
  _computeSelectedLabel(selected) {
    const methods = this.authMethods;
    if (!methods) {
      return;
    }
    const info = methods[selected];
    if (!info) {
      return;
    }
    return info.name;
  }
  // Resets `selected` property.
  _clearSelection() {
    this.selected = -1;
  }
  /**
   * Computes value for the `authValid` property.
   * Authorization is valid when form panel reports it is valid and
   * an auth method is selected.
   *
   * @param {Boolean} formValid Reported state
   * @param {String} selected Selected auth method
   * @param {Boolean} authRequired Value of `authRequired` property
   * @return {Boolean} True if is valid and selected
   */
  _computeAuthValid(formValid, selected, authRequired) {
    if ((selected === undefined || selected === -1) && authRequired) {
      // valid by default
      return true;
    }
    if ((selected === undefined || selected === -1) && !authRequired) {
      return true;
    }
    if (formValid === undefined && !authRequired) {
      return true;
    }
    if (!formValid) {
      return false;
    }
    return true;
  }
  /**
   * Rstores authorization settings if event is external.
   *
   * @param {CustomEvent} e
   */
  _onAuthSettingsChanged(e) {
    if (this.readonly || e.composedPath()[0] === this) {
      return;
    }
    this.restore(e.detail);
  }
  /**
   * Processes incomming settings and acts if any action needed to authorize
   * the use has to be performed.
   *
   * @param {Object} settings Current settings.
   */
  _processPanelSettings(settings) {
    switch (settings.type) {
      case 'oauth2': this._handleOauth2Settings(settings); break;
      case 'digest': this._handleDigestSettings(settings); break;
    }
  }
  /**
   * Handles the case when OAuth2 settings changed.
   *
   * @param {Object} settings Oauth2 auth settings object
   */
  _handleOauth2Settings(settings) {
    settings = settings || {};
    settings = settings.settings || {};
    const token = settings.accessToken;
    if (!token) {
      this.set('settings.valid', false);
      return;
    }
    let type;
    let value;
    if (settings.deliveryMethod === 'header') {
      type = 'request-header-changed';
      value = settings.tokenType + ' ' + token;
    } else {
      type = 'query-parameter-changed';
      value = token;
    }
    this.fire(type, {
      name: settings.deliveryName,
      value: value
    }, {
      cancelable: true
    });
  }
  /**
   * Handles the case when digest auth method settings changed.
   *
   * @param {Object} settings Digest auth method settings object
   * It can be either username and password (that will be passed to
   * transport method) then this function do nothing or list of Authorization
   * header parameters.
   */
  _handleDigestSettings(settings) {
    if (!settings.valid) {
      this.fire('request-header-changed', {
        name: 'authorization',
        value: ''
      });
      return;
    }
    settings = settings.settings;
    if (!settings) {
      return;
    }
    const data = settings.settings;
    if (!data || !(data.username && data.password)) {
      return;
    }
    let value = 'Digest ';
    Object.keys(data).forEach((name) => {
      value += name + '="' + data[name] + '", ';
    });
    value = value.substr(0, value.length - 2);
    this.fire('request-header-changed', {
      name: 'authorization',
      value: value
    }, {
      cancelable: true
    });
  }

  fire(type, detail, options) {
    const defaults = {
      bubbles: true,
      composed: true,
      cancelable: false
    };
    if (!options) {
      options = defaults;
    } else {
      options = Object.assign(defaults, options);
    }
    options.detail = detail;
    const e = new CustomEvent(type, options);
    this.dispatchEvent(e);
    return e;
  }
  /**
   * If selected authorization type is `oauth1` or `oauth2` it calls
   * `authorize()` function of selected panel.
   * If other method is selected it does nothing.
   *
   * @return {Boolean} True if the panel received intent to authorize and
   * `false` otherwise
   */
  forceTokenAuthorization() {
    const selected = this.authMethods && this.authMethods[this.selected];
    if (!selected) {
      return false;
    }
    if (['OAuth 2.0', 'OAuth 1.0'].indexOf(selected.type) === -1) {
      return false;
    }
    const panel = this.currentPanel;
    if (!panel) {
      return true;
    }
    return panel.authorize();
  }
  /**
   * Computes value for `hasAuthMethods` property.
   *
   * @param {Array} authMethods List of current methods.
   * @return {Boolean} True if at leas one methos is available to select.
   */
  _computeHasAuthMethods(authMethods) {
    return !!(authMethods && authMethods.length);
  }
  /**
   * Dispatches analytics event.
   *
   * @param {String} category Event category
   * @param {String} action Event action
   * @param {String} label Event label
   */
  _analyticsEvent(category, action, label) {
    const e = new CustomEvent('send-analytics', {
      detail: {
        type: 'event',
        category: category,
        action: action,
        label: label
      },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(e);
  }
  /**
   * Computes value for `invalid` property.
   * @param {Boolean} authValid
   * @return {Boolean}
   */
  _computeInvalid(authValid) {
    return !authValid;
  }
  /**
   * Fired when auth settings change.
   *
   * It will be fired when any of types is currently selected and
   * any value of any property has changed.
   *
   * @event authorization-settings-changed
   * @param {?Object} settings Current auth settings. It depends on enabled `type`.
   * It might be undefined if the user unselected a method (if possible). This
   * means that there's no selection at the moment.
   * @param {?String} type Enabled auth type. For example `basic`, `ntlm` or `oauth2`.
   * It may be `undefined` if the user deselected current method and none is selected.
   * @param {Boolean} valid Flag determining if current settings are valid.
   * This property depends on `null` security scheme when scheme is unselected
   * (`settings` and `type` are `undefined`). If `null` security is set then
   * it is valid when methos is unselected. `false` otherise.
   */
  /**
   * Fired when the authorization type changed.
   * Note that the `settings` property may not be updated at the moment of of
   * firing the event.
   *
   * This event is cancelable. If handler cancels the event the operation
   * is stopped and selection is set to previous value.
   *
   * @event authorization-type-changed
   * @param {String} type Current auth type
   */
  /**
   * Fired when the request header changed and all listeners should update
   * header value.
   *
   * @event request-header-changed
   * @param {String} name Name of the header that has changed
   * @param {String} value Header new value
   */
  /**
   * Fired when the query param changed and all listeners should update
   * parameters / URL value.
   *
   * @event query-parameter-changed
   * @param {String} name Name of the header that has changed
   * @param {String} value Header new value
   */
}
window.customElements.define(AuthorizationPanel.is, AuthorizationPanel);
