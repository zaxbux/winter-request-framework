# Winter CMS Request Framework

This is a modern implementation of the Winter CMS Request library. The original is based on jQuery, which may not be preferable for some developers to use. This library is intended for use on your front end, in themes. Most of the functionality and features have been kept from the original implementation, however it is not meant to replace the framework used in the backend of Winter.

There are two parts to this library, a really basic implementation for making requests and handling all responses yourself, and an implementation with "extras" that simulate the behavior of the original library.

# Breaking Changes

 * The data-* attributes that relied on `eval()` have been removed. There are better ways to achieve this functionality.
 * Asset injection isn't supported by default, but you can extend the plugin to accomplish this.
 * Global AJAX events are removed.
 * `$.Deferred()`-style promises are removed.
 * Support for the global object `$.wn.stripeLoadIndicator` is removed.

# Improvements

  * For the `data-request-update` and `data-request-data` attributes, [JSON5](https://github.com/json5/json5) is used to parse that JSON-like syntax used in those attributes.
  * [Axios](https://github.com/axios/axios) is used to make requests to the server. It takes care of these by default:
    * Detects the `XSRF-TOKEN` cookie automatically
    * Uses the `X-XSRF-TOKEN` header automatically (set to the value of the XSRF cookie).
    * Request/Response content type is `application/json`.

# Examples

```javascript
import { WinterRequest } from '@zaxbux/winter-request-framework';

// This is the "extended" version, which inherits from the "base" version.
import { WinterRequestExtras } from '@zaxbux/winter-request-framework';

const form = document.querySelector('#myForm');

const wnRequest = new WinterRequest(form, 'myComponent::onSubmit', {
  onSuccess: async (response) => {
    console.log(response.data);
  },
  
  // ...
});

wnRequest.send();
```


# How does the Winter AJAX Framework work?

Winter includes a way to communicate between the server and frontend JavaScript using "AJAX Handlers".

## Making a request to the server

When making an AJAX request to Winter, the `X-Requested-With` header must be set to `XMLHttpRequest`.

  * [Winter checks if the request is a POST request made using AJAX](https://github.com/wintercms/winter/blob/9654e0e427536bd1c1e3652dc527547c0d7e2d7a/modules/backend/classes/Controller.php#L429), and if the `X-WINTER-REQUEST-HANDLER` header is set.
    * Laravel checks that header with [`Request#ajax()`](https://github.com/laravel/framework/blob/42102589bc7f7b8533ee1b815ef0cc18017d4e45/src/Illuminate/Http/Request.php#L238) (which is an alias of Symfony's [`Request#isXmlHttpRequest()`](https://github.com/symfony/http-foundation/blob/f60c2e55bebe18bb54c11d1d91c914ddc8d80995/Request.php#L1763))

Winter CMS will look for a handler function name that matches the one supplied in the header. Once executed, the response is returned to the client.

### Headers

| Name                        | Purpose | Values
| --------------------------- | ------- | -------
| `X-Requested-With`          | Tells Winter/Laravel/Symfony that the request is an "AJAX Request". | `XMLHttpRequest`
| `X-WINTER-REQUEST-HANDLER`  | Tells Winter which AJAX handler method to use on the controller/component. [modules/backend/classes/Controller.php#L435](https://github.com/wintercms/winter/blob/a56d7ec2af948480a2b24971b8118490f14dd042/modules/backend/classes/Controller.php#L435) | Component handler: `component::onEvent`; Generic handler: `onEvent` (Note: the `onAjax` handler name will always return null)
| `X-WINTER-REQUEST-PARTIALS` | Tells Winter which partials to render and return in the response. | Names of partials, separated by the `&` character. E.g. `partial1&partial2&partial3`
| `X-WINTER-REQUEST-FLASH`    | Tells Winter that it should clear existing flash messages respond with new flash messages. [modules/cms/classes/Controller.php#L764](https://github.com/wintercms/winter/blob/a56d7ec2af948480a2b24971b8118490f14dd042/modules/cms/classes/Controller.php#L764) | `true` \| `false`

### Response Data

```jsonc
{
  "result" : {},
  "X_WINTER_REQUEST_PARTIALS": {
    "name": "<div>HTML</div>",
    // ...
  },
  "X_WINTER_REDIRECT": "https://example.com",
  "W_WINTER_ASSETS": {
    "css": [
      // ...
    ],
    "js": [
      // ...
    ],
    "img": [
      // ...
    ],
  },
  "X_WINTER_ERROR_FIELDS": {
    "field": [
      "Validation message.",
      // ...
    ],
    // ...
  },
  "X_WINTER_ERROR_MESSAGE": ""
}
```

| Name                        | Purpose | JSON Structure Example
| --------------------------- | ------- | ----------------------
| `result`                    | If your AJAX handler function returned an array, the data will be present under this key. | N/A
| `X_WINTER_REQUEST_PARTIALS` | Contains the contents of the partials to update on the page. [modules/backend/classes/Controller.php#L460](https://github.com/wintercms/winter/blob/a56d7ec2af948480a2b24971b8118490f14dd042/modules/backend/classes/Controller.php#L460) | `{ "myPartial": "<div>...</div>", ... }`
| `X_WINTER_REDIRECT`         | Contains the URL that the browser should redirect to. [modules/backend/classes/Controller.php#L494](https://github.com/wintercms/winter/blob/a56d7ec2af948480a2b24971b8118490f14dd042/modules/backend/classes/Controller.php#L494)        | `"https://example.com"`
| `W_WINTER_ASSETS`           | Contains the assets that should be injected into the page. [modules/backend/classes/Controller.php#L508](https://github.com/wintercms/winter/blob/a56d7ec2af948480a2b24971b8118490f14dd042/modules/backend/classes/Controller.php#L508)   | `{ "css": [ "style.css", ... ], "js": [ "script.js", ... ], "img": [ "image.png", ... ] }`
| `X_WINTER_ERROR_FIELDS`     | Contains the results of backend field validation. [modules/backend/classes/Controller.php#L535](https://github.com/wintercms/winter/blob/a56d7ec2af948480a2b24971b8118490f14dd042/modules/backend/classes/Controller.php#L535)            | `{ "email": [ "The email field must be a valid email address.", ... ] }`
| `X_WINTER_ERROR_MESSAGE`    | Used in the backend/cms, not relevant for frontend requests. [modules/cms/classes/Controller.php#L790](https://github.com/wintercms/winter/blob/a56d7ec2af948480a2b24971b8118490f14dd042/modules/cms/classes/Controller.php#L790)