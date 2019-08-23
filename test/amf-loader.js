import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';
import { LitElement } from 'lit-element';

export const AmfLoader = {};

class HelperElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('helper-element', HelperElement);

const helper = new HelperElement();

AmfLoader.load = async function(fileName, compact) {
  compact = compact ? '-compact' : '';
  fileName = fileName || 'demo-api';
  const file = `${fileName}${compact}.json`;
  const url = location.protocol + '//' + location.host + '/base/demo/'+ file;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data;
      try {
        data = JSON.parse(e.target.response);
        /* istanbul ignore next */
      } catch (e) {
        /* istanbul ignore next */
        reject(e);
        /* istanbul ignore next */
        return;
      }
      resolve(data);
    });
    /* istanbul ignore next */
    xhr.addEventListener('error',
      () => reject(new Error('Unable to load model file')));
    xhr.open('GET', url);
    xhr.send();
  });
};

AmfLoader.lookupOperation = function(model, endpoint, operation) {
  helper.amf = model;
  const webApi = helper._computeWebApi(model);
  const endPoint = helper._computeEndpointByPath(webApi, endpoint);
  const opKey = helper._getAmfKey(helper.ns.w3.hydra.supportedOperation);
  const ops = helper._ensureArray(endPoint[opKey]);
  return ops.find((item) => helper._getValue(item, helper.ns.w3.hydra.core + 'method') === operation);
};

AmfLoader.lookupSecurity = function(model, endpoint, operation) {
  const method = AmfLoader.lookupOperation(model, endpoint, operation);
  const secKey = helper._getAmfKey(helper.ns.raml.vocabularies.security + 'security');
  return method[secKey];
};

AmfLoader.lookupSecurityScheme = function(model, endpoint, operation) {
  const schemes = AmfLoader.lookupSecurity(model, endpoint, operation);
  const security = schemes instanceof Array ? schemes[0] : schemes;
  const shKey = helper._getAmfKey(helper.ns.raml.vocabularies.security + 'scheme');
  let scheme = security[shKey];
  if (scheme instanceof Array) {
    scheme = scheme[0];
  }
  return scheme;
};

AmfLoader.lookupSecuritySettings = function(model, endpoint, operation) {
  const security = AmfLoader.lookupSecurityScheme(model, endpoint, operation);
  const key = helper._getAmfKey(helper.ns.raml.vocabularies.security + 'settings');
  let settings = security[key];
  if (settings instanceof Array) {
    settings = settings[0];
  }
  return settings;
};
