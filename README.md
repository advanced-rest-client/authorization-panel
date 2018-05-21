[![Build Status](https://travis-ci.org/advanced-rest-client/authorization-panel.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/authorization-panel)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/authorization-panel)

## &lt;authorization-panel&gt;

Authorization panel used in the request panel to get user authorization information.

It includes following forms:
- basic authorization
- digest authorization
- NTLM authorization
- OAuth 1.0
- OAuth 2.0
- custom authorization method defined in RAML spec (custom security scheme)

The component works with [AMF](https://github.com/mulesoft/amf) which allows to
read any API specification and use the information to build an UI for particular endpoint.

<!---
```
<custom-element-demo>
  <template>
    <link rel="import" href="authorization-panel.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->

```html
<h3>Basic authorization</h3>
<authorization-panel selected="1"></authorization-panel>
```

## Dependencies

Digest and OAuth1 method requires `CryptoJS.MD5`. This is not included in the component by default.
Use `advanced-rest-client/cryptojs-lib` component to include the library if your project doesn't use crypto libraries already.

## OAuth authorization

OAuth 1 and OAuth 2.0 elements works with `advanced-rest-client/oauth-authorization` element to authorize the user and request token data.

### API components

This components is a part of API components ecosystem: https://elements.advancedrestclient.com/
