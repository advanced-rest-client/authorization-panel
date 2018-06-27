const AmfLoader = {};
AmfLoader.load = function(endpointIndex, method) {
  endpointIndex = endpointIndex || 0;
  method = method || 0;
  const url = location.protocol + '//' + location.host +
    location.pathname.substr(0, location.pathname.lastIndexOf('/'))
    .replace('/test', '/demo') + '/amf-model.json';
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', (e) => {
      let data;
      try {
        data = JSON.parse(e.target.response);
      } catch (e) {
        reject(e);
        return;
      }
      const ns = ApiElements.Amf.ns;
      data = data[0][ns.raml.vocabularies.document + 'encodes'][0];
      data = data[ns.raml.vocabularies.http + 'endpoint'][endpointIndex];
      data = data[ns.w3.hydra.supportedOperation][method];
      data = data[ns.raml.vocabularies.security + 'security'];
      resolve(data);
    });
    xhr.addEventListener('error',
      () => reject(new Error('Unable to load model file')));
    xhr.open('GET', url);
    xhr.send();
  });
};
