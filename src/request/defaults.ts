import * as events from '../events';
import { Request } from '../request';
import { defaults as baseDefaults, IWinterRequestFrameworkOptionsBase } from './base';

const defaults: IWinterRequestFrameworkOptionsBase<Request> = {
	...baseDefaults,
	...{
		handlers: {
			onConfirmMessage: async function (message?) {

				const _event = window.dispatchEvent(events.ajaxConfirmMessage({ context: this, message }));

				if (!_event) return;

				// Use native window.confirm() if Event#preventDefault() was not called
				if (message) {
					return await baseDefaults.handlers.onConfirmMessage.call(this, message);
				}
			},
			onErrorMessage: async function (message) {

				const _event = window.dispatchEvent(events.ajaxErrorMessage({ context: this, message }));

				// Use native window.alert() if Event#preventDefault() was not called
				if (!_event && message) {
					await baseDefaults.handlers.onError.call(this, message);
				}
			},
			onSetup: async function() {
				// Trigger an event on the 'loading' element
				if (this.loading instanceof HTMLElement) {
					this.loading.dispatchEvent(events.wnBeforeRequest());
				}

				// Trigger the 'ajaxBeforeSend' event on window
				window.dispatchEvent(events.ajaxBeforeSend({ context: this }));

				// Trigger the 'ajaxPromise' event on the attached element
				this.element.dispatchEvent(events.ajaxPromise({ context: this }));
			},
			onSuccess: async function (response) {
				const element = this.form || this.element;
				if (!this.options.redirect) {
					element.dispatchEvent(events.ajaxDone({ context: this, response }));
				}

				// Halt here if onBeforeUpdate() returns `false`
				if ((await this.options.handlers.onBeforeUpdate.call(this, response)) === false) {
					return;
				}

				// Trigger 'ajaxBeforeUpdate' on the form, halt if Event.preventDefault() is called
				if (element && !element.dispatchEvent(events.ajaxBeforeUpdate({ context: this, response }))) {
					return;
				}
				
				// Handle flash messages
				if (this.options.flash && response.data.X_WINTER_FLASH_MESSAGES) {
					for (const [type, message] of Object.entries<string>(response.data.X_WINTER_FLASH_MESSAGES)) {
						await this.options.handlers.onFlashMessage.call(this, message, type);
					}
				}

				// Proceed with the update process
				await this.options.handlers.onUpdateResponse.call(this, response.data);

				element.dispatchEvent(events.ajaxSuccess({ context: this, data: response.data }));
			},
			onError: async function (error) {
				const element = this.form || this.element;

				if (!this.options.redirect) {
					element.dispatchEvent(events.ajaxFail({ context: this, error }));
				}
			
				let errorMsg: string = error.response.statusText;

				// Status 406 is a 'smart error' that returns a response object.
				// It is processed the same way as a successful response.
				if (error.response && error.response.status == 406 && error.response.data) {
					errorMsg =  error.response.data.X_WINTER_ERROR_MESSAGE;
					await this.options.handlers.onUpdateResponse.call(this, error.response.data);
				}

				// Trigger 'ajaxError' on the form, halt if event.preventDefault() is called
				if (!element.dispatchEvent(events.ajaxError({ context: this, error }))) {
					return;
				}

				this.options.handlers.onErrorMessage.call(this, errorMsg);
			},
			onComplete: async function (response, error) {
				const element = this.form || this.element;

				if (this.loading) {
					this.loading.dispatchEvent(events.wnAfterRequest());
				}

				element.dispatchEvent(events.ajaxAlways({ context: this, response, error }));

				element.dispatchEvent(events.ajaxComplete({ context: this, response, error }));
			},
			//onUpdateResponse: baseDefaults.handlers.onUpdateResponse,
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

				await baseDefaults.handlers.onRedirectResponse.call(this, url);
			},
		},
	},
};

export default defaults;