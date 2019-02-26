[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/authorization-panel.svg)](https://www.npmjs.com/package/@advanced-rest-client/authorization-panel)

[![Build Status](https://travis-ci.org/advanced-rest-client/authorization-panel.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/authorization-panel)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/authorization-panel)

## &lt;authorization-panel&gt;

A set of elements that contains an UI to create different authorization headers like Basic, OAuth etc

```html
<authorization-panel></authorization-panel>
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/authorization-panel
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/authorization-panel/authorization-panel.js';
    </script>
  </head>
  <body>
    <authorization-panel></authorization-panel>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@advanced-rest-client/authorization-panel/authorization-panel.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
    <authorization-panel on-authorization-settings-changed="_authChanged"></authorization-panel>
    `;
  }

  _authChanged(e) {
    console.log(e.detail);
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/authorization-panel
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
