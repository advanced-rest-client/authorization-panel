[![Build Status](https://travis-ci.org/advanced-rest-client/authorization-panel.svg?branch=master)](https://travis-ci.org/advanced-rest-client/authorization-panel)  

# authorization-panel

`<authorization-panel>` The authorization panel used in the request panel.
It is a set of forms that allow set up the authorization method for a HTTP request.

It renders a set of forms. But it or it's children do not perform authorization.
In case of `basic` method the app should insert the authorization header automatically when
running the request.
When enabled authorization type is `ntlm` then username, password and domain should be passed
to transport (XHR, socket) and there perform the authorization.

Oauth 2 form sends the `oauth2-token-requested` with the OAuth settings provided with the form.
Any element / app can handle this event and perform authorization.
ARC provides the `<oauth2-authorization>` element (from the `oauth-authorization` repo) that can
be placed anywhere in the DOM (from current element where `authorization-panel` is attached up to
the body) and perform OAuth athorization. However it can be done by any other element / app  or
even server. See `<oauth2-authorization>` for detailed documentation.

Oauth 1a is not currently supported. Though the form is ready and available, there's no
authorization method in the ARC components set.

## Events
This element fires the `authorization-settings-changed` when any type of authorization
is enabled and valid data has been provided by the user.

This element also fires `authorization-type-enabled` and `authorization-type-disabled` events
when type state changes.
See demo for example usage.

### Example
```
<authorization-panel></authorization-panel>
```

### Styling
`<authorization-panel>` provides the following custom properties and mixins for styling:

Custom property | Description | Default
----------------|-------------|----------
`--authorization-panel` | Mixin applied to the element | `{}`



### Events
| Name | Description | Params |
| --- | --- | --- |
| authorization-settings-changed | Fired when auth type settings changed. It will fire when any of types is enabled (or at the moment the it's disabling) and any value of any property has changed. | settings **Object** - Current auth settings. It depends on enabled `type`. |
type **String** - Enabled auth type. For example `basic`, `ntlm` or `oauth2`. |
| authorization-type-disabled | Fired when the authorization type has been disabled in the UI. | type **String** - Disabled auth type |
| authorization-type-enabled | Fired when the authorization type has been enabled in the UI. Listen for `authorization-settings-changed` event to get current auth settings. | type **String** - Enabled auth type |
