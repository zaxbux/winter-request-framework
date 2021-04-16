import { WinterRequestOptions, WinterRequestResponseData } from '..';
import * as events from './events';
import { injectPartials } from './utils';

export const defaults: WinterRequestOptions = {
	url: window.location.href,
	flash: false,
	files: false,
	browserValidate: false,
	trackInput: false,
	handlers: {
		onConfirmMessage: async function (message?) {

			const _event = window.dispatchEvent(events.ajaxConfirmMessage({ context: this, message }));

			if (!_event) return;

			// Use native window.confirm() if Event#preventDefault() was not called
			if (message) {
				return window.confirm(message);
			}
		},
		onErrorMessage: async function (message) {

			const _event = window.dispatchEvent(events.ajaxErrorMessage({ context: this, message }));

			// Use native window.alert() if Event#preventDefault() was not called
			if (!_event && message) {
				alert(message);
			}
		},
		onSuccess: async function (response) {
		
			const data: WinterRequestResponseData = response.data;

			// Halt here if onBeforeUpdate() returns `false`
			if ((await this.options.handlers.onBeforeUpdate.bind(this)(response)) === false) {
				return;
			}

			const element = this.form || this.element;

			// Trigger 'ajaxBeforeUpdate' on the form, halt if Event.preventDefault() is called
			if (element && !element.dispatchEvent(events.ajaxBeforeUpdate({ context: this, response }))) {
				return;
			}
			
			// Handle flash messages
			if (this.options.flash && data.X_WINTER_FLASH_MESSAGES) {
				for (const [type, message] of Object.entries<string>(data.X_WINTER_FLASH_MESSAGES)) {
					await this.options.handlers.onFlashMessage.bind(this)(message, type);
				}
			}

			// Proceed with the update process
			await this.options.handlers.onUpdateResponse.bind(this)(data);

			element.dispatchEvent(events.ajaxSuccess({ context: this, data }));
		},
		onError: async function (error) {

			const element = this.form || this.element;
		
			let errorMsg: string = error.response.statusText;

			// Status 406 is a 'smart error' that returns a response object.
			// It is processed the same way as a successful response.
			if (error.response && error.response.status == 406 && error.response.data) {
				errorMsg =  error.response.data.X_WINTER_ERROR_MESSAGE;
				await this.options.handlers.onUpdateResponse.bind(this)(error.response.data);
			}

			// Trigger 'ajaxError' on the form, halt if event.preventDefault() is called
			if (!element.dispatchEvent(events.ajaxError({ context: this, error }))) {
				return;
			}

			this.options.handlers.onErrorMessage.bind(this)(errorMsg);
		},
		onComplete: async function (response, error) {

			const element = this.form || this.element;

			element.dispatchEvent(events.ajaxComplete({ context: this, response, error }));
		},
		onUpdateResponse: async function (data) {


			//Handle redirect
			if (data.X_WINTER_REDIRECT) {
				this.options.handlers.onRedirectResponse.bind(this)(data.X_WINTER_REDIRECT);
				return;
			}

			// Handle asset injection
			if (data.X_WINTER_ASSETS) {
				await this.options.handlers.onAssets.bind(this)(data.X_WINTER_ASSETS);
			}

			// Handle partials
			await injectPartials.bind(this)(this.options.update, data);

			// Handle validation
			if (data.X_WINTER_ERROR_FIELDS) {
				this.options.handlers.onValidationMessage.bind(this)(data.X_WINTER_ERROR_MESSAGE, data.X_WINTER_ERROR_FIELDS);
			}
		},
		onValidationMessage: async function (message, fields) {


			const element = this.form || this.element;

			element.dispatchEvent(events.ajaxValidation({ context: this, message, fields }));

			let isFirstInvalidField = true;

			for (const [fieldName, fieldMessages] of Object.entries(fields)) {
				// Convert `nameArray.fieldName` to `nameArray[fieldName]`
				const arrayName = fieldName.replace(/\.(\w+)/g, '[$1]');

				const fieldElements = this.form.querySelectorAll<HTMLElement>(`[name="${arrayName}"], [name="${arrayName}[]"], [name$="[${arrayName}]"], [name$="[${arrayName}][]"]`);
				if (fieldElements.length > 0 && fieldElements[0].matches(':enabled')) {
					const fieldElement = fieldElements[0];

					const _event = window.dispatchEvent(events.ajaxInvalidField({ fieldElement, arrayName, fieldMessages, isFirstInvalidField }));

					if (isFirstInvalidField) {
						if (!_event) fieldElement.focus();
						isFirstInvalidField = false;
					}
				}
			}
		},
		onRedirectResponse: async function (url) {


			window.addEventListener('popstate', () => {
				this.element.dispatchEvent(events.ajaxRedirected());
			}, { once: true });

			window.location.assign(url);
		},
	},
};