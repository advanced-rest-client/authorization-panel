[![Build Status](https://travis-ci.org/advanced-rest-client/authorization-panel.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/authorization-panel)

## undefined component
Tag: `<authorization-panel>`

### Installation
Using bower:
```
bower install --save advanced-rest-client/authorization-panel
```

`<authorization-panel>` The authorization panel used in the request panel.
It is a set of forms that allow set up the authorization method for a HTTP request.

The element do not perform authorization. Depending on selected method there are
different ways of dealing with the authorization.

## Auth methods availability

By default the element renders all authorization methods available to it.

Currently these are:
- none (auth is optional)
- basic
- digest
- ntlm
- OAuth 2.0
- OAuth 1.0

The list can be changed by setting the `securedBy` property to the RAML security
scheme data model produced by [RAML JS parser](https://elements.advancedrestclient.com/elements/raml-js-parser).

Alternatively, use `iron-meta` element with `key` property set to `auth-methods`
and `value` property set to list of suppored methods.

#### Example

```html
<iron-meta key="auth-methods" value='[null, "basic", "oauth1", "oauth2"]'></iron-meta>
```

Keys can be any of `none`, `basic`, `ntlm`, `digest`, `oauth1` and `oauth2`.

Note, that if you set meta data and `securedBy` property it will use combination
of both. The base list of rendered methods is meta data list and then reduced to
defined in RAML methods. Also note, that custom auth methods are always rendered.

## Supported methods

Detailed information about authorization methods can be find in the [auth-methods documentation page](https://elements.advancedrestclient.com/elements/auth-methods).

### Basic authorization
The element sends the `request-header-changed` custom event to inform any other
element that is listening to this event that header value has changed
(Authorization in this case). The `raml-headers-form` is an example of an
element that is listening for this event and change request headers value
when auth data change.

### OAuth 2.0
The [Oauth 2 form](https://elements.advancedrestclient.com/elements/auth-methods?active=auth-method-oauth2)
sends the `oauth2-token-requested` custom event with the OAuth settings provided
by the user.
Any element / hosting app can handle this event and perform authorization.
ARC elements provides the [oauth2-authorization](https://elements.advancedrestclient.com/elements/oauth-authorization) element
(from the `oauth-authorization` repo) that can be placed anywhere in the DOM
(from current element where `authorization-panel` is attached up to
the body) and perform OAuth athorization.
However it can be also done by any other element / app  or even server.
See `<oauth2-authorization>` for detailed documentation.

Note: OAuth 2.0 server flow probably will not work in regular browser
environment because main providers aren't setting CORS headers. Therefore the
request will be canceled by the browser.
To make it work, handle the `oauth2-token-requested` fired from the inside of this element.
If it's browser flow type (implicit) then the `oauth2-authorization` element can be used.
For other other types, handle and cancel the event and use server to handle token exchange.
The ARC elements offers a [Chrome extension](https://github.com/advanced-rest-client/api-console-extension)
that once installed will propxy auth requests and made the exchange even for
the server flow. The application should use [api-console-ext-comm](https://github.com/advanced-rest-client/api-console-ext-comm)
element to communicate with the extension.

#### `redirect-url` property for OAuth 2.0
OAuth protocol requires to define a redirect URL that is registered in the
OAuth provider. The redirect URL should point to a page that will pass the URL
parameters to the opener page (OAuth 2 panel).
If you application uses the [oauth-authorization](https://elements.advancedrestclient.com/elements/oauth-authorization)
element then it provides a popup that pases the data back to the application.
In this case your redirect URL would be `https://your.domain.com/bower_components/oauth-authorization/oauth-popup.html`.
User have to change OAuth provider's settings and adjust the redirect URL to
point to this page.

You can also use the [oauth-popup.html](https://github.com/advanced-rest-client/oauth-authorization/blob/stage/oauth-popup.html)
to build your own page.

### OAuth 1.0a
Oauth 1a is not currently supported. The form is ready and available but there's no
authorization method in the ARC components set.

### Digest Authentication
When the user provide all required information for Digest authorization then
this element will fire `request-header-changed` custom event which will do the
same thing as in case of basic authorization.

### Example
```
<authorization-panel redirect-url="http://domain.com/bower_components/oauth-authorization/oauth-popup.html"></authorization-panel>
```

### Styling
`<authorization-panel>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--authorization-panel` | Mixin applied to the element | `{}`
`--stepper-step-number-background-color` | Background color of the step number (if selected auth method support this) | `#3D8099`
`--stepper-step-number-color` | Color of the step number (if selected auth method support this) | `#fff`
`--stepper-step-title-color` | Color of the label of the step (if selected auth method support this) | `#3D8099`
`--stepper-step-selection-label-color` | Color of the label of closed section (with selected option) | `rgba(0, 0, 0, 0.54)`
`--stepper-line-color` | Left hand side line color of the stepper. | `rgba(0, 0, 0, 0.12)`
`--arc-font-body1` | Theme mixin, Mixin applied to the elements that are containg text | `{}`
`--empty-info` | Mixin applied to the element that renders no methods availability message | `{}`

Also check [auth-methods documentation page](https://elements.advancedrestclient.com/elements/auth-methods) for methods
styling instructions.

## API
### Component properties (attributes)

#### eventsTarget
- Type: `Object`
Events handlers target. By default the element listens on
`window` object. If set, all events listeners will be attached to this
object instead of `window`.

#### selected
- Type: `string`
Selected authorization type. Can be onle of `basic`, `digest`, `oauth1`,
`oauth2`, `none` and `ntlm`.

#### isSelected
- Type: `boolean`
- Default: `false`
- Read only property
Computed value. `true` when authorization method has been selected.

#### authRequired
- Type: `boolean`
- Default: `false`
Set to true to inform the element that authorization is required
for an endpoint.
It computes this value automatically when RAML security scheme is set.
It can be set to `true` only if selected authorization method
requires user to authenticate the call.
It can be `false` if selected method is `none`, meaning RAML spec
allows no authorization.

#### authValid
- Type: `boolean`
- Default: `true`
- Read only property
Determines if the user propertly provided authorization data into the
authorization form.
For OAuth 1/2 authorization methods it means that the token (and
token secret for OAuth 1) is set.
This property is only relevant when `authRequired` is set to true.
Application should override `authRequired` state if it's set to true.

For example the application can show a warning message to the user that
authorization is required when `authRequired` is true and hide the
information when `authVaid` is `true` even if `authRequired` is `true`.

#### settings
- Type: `Object`
Current settings of selected auth type.
Can be `undefined` if the user hasn't filled all required fields in the
form. of if RAML settings allows no authorization and user selectd this
option.

#### securedBy
- Type: `Object`
A definition of the RAML `securedBy` node of the method.
If set it will limit number of authorization methods rendered by this
element to show only those which are defined in the RAML spec.

#### redirectUrl
- Type: `string`
The OAuth2 redirect URL to be set in the OAuth2 form pane.

#### authMethods
- Type: `Array`
List of currently available authorization methods.
Value computed when `securedBy` property change to a list of auth
methods defined in RAML for selected endpoint and supported by this
element.

#### hasAuthMethods
- Type: `boolean`
- Default: `false`
- Read only property
Computed value, `true` if any method is rendered.

#### noSteps
- Type: `boolean`
- Default: `false`
If true then the numbered steps aren't rendered.

#### customSchemes
- Type: `Array`
List of currently available custom security schemes declared in
the RAML API spec file.

#### renderSelector
- Type: `boolean`
- Default: `true`
- Read only property
Computed value. If true then type selector is not rendered.

#### noink
- Type: `boolean`
If true then the ripple effect on step title is disabled.

#### httpMethod
- Type: `string`
Current HTTP method. Passed to digest method.

#### requestUrl
- Type: `string`
Current request URL. Passed to digest method.

#### requestBody
- Type: `string`
Current request body. Passed to digest method.

#### supportedMethods
- Type: `Function`
List of authorization methods supported by this element.
Each item has `id` and `name` property. The `id` is internal ID for
authorization methods. Can be any of: `none`, `basic`, `ntlm`, `digest`,
`oauth1` and `oauth2`. The `name` property is a lable for the method
used in UI.

#### currentPanel
- Type: `Function`



### Component methods

#### clear
- Return type: `undefined`
Clears the state of the panel.
#### forceTokenAuthorization
- Return type: `undefined`
If selected authorization type is `oauth1` or `oauth2` it calls
`authorize()` function of selected panel.
If other method is selected it does nothing.

