import axios, { AxiosResponse, AxiosError, CancelTokenSource } from 'axios';
import { WinterRequestOptions, WinterRequestResponseData, WinterRequestStaticArgs } from '..';
import { defaults } from './defaults';
import { ValidationFailedError } from './errors';
import * as events from './events';
import { attachEventListeners, extendRequest, paramToObj, validateHandler } from './utils';

/**
 * @classdesc The main Request class for Winter AJAX Framework.
 */
export class WnRequest {
	element: HTMLElement;
	handler: string;
	options: WinterRequestOptions;
	form: HTMLFormElement;

	dataTrackInputTimer: number;

	private _cancelTokenSource: CancelTokenSource;

	/**
	 * @param {string|HTMLElement}   [element] Element that is used to setup the request and fire events on.
	 * @param {string}               [handler] Name of the AJAX handler that the server should execute.
	 * @param {WinterRequestOptions} [options] Additional options used to setup the request, overrides data attribute options.
	 */
	constructor(element?: string | HTMLElement, handler?: string, options?: WinterRequestOptions) {
		// Element
		if (typeof element === 'string') {
			this.element = document.querySelector(element);
		} else if (element instanceof HTMLElement) {
			this.element = element;
		} else {
			this.element = null;
		}

		// Handler
		if (!handler && this.element) {
			this.handler = this.element.dataset.request;
		} else {
			this.handler = handler;
		}

		validateHandler(this.handler);

		// Options
		this.options = Object.assign({}, defaults, {
			confirm: this.element.dataset.requestConfirm,
			redirect: this.element.dataset.requestRedirect,
			loading: this.element.dataset.requestLoading,
			flash: this.element.dataset.requestFlash,
			files: this.element.dataset.requestFiles,
			form: this.element.dataset.requestForm,
			url: this.element.dataset.requestUrl,
			update: paramToObj(this.element.dataset.requestUpdate),
			data: paramToObj(this.element.dataset.requestData),
			browserValidate: this.element.dataset.requestBrowserValidate,
		}, options || {});

		// If not null and a HTMLFormElement was not provided, query the DOM for the selector.
		// Otherwise, select the closest form element (including the element itself).
		if (this.options.form !== null && !(this.options.form instanceof HTMLFormElement)) {
			if (typeof this.options.form == 'string') {
				this.options.form = document.querySelector<HTMLFormElement>(this.options.form);
			} else {
				this.options.form = this.element.closest('form');
			}
		}

		if (this.options.form instanceof HTMLFormElement) {
			this.form = this.options.form;
		}

		// Loading
		if (typeof this.options.loading === 'string') {
			this.options.loading = document.querySelector<HTMLElement>(this.options.loading);
		}

		attachEventListeners(this);

		this._cancelTokenSource = axios.CancelToken.source();
	}

	/**
	 * Get an instance of the request framework.
	 * 
	 * @param args Initialization arguments.
	 * @returns An instance of the request framework.
	 */
	static instance(args?: WinterRequestStaticArgs): WnRequest {
		return new WnRequest(args.element || null, args.handler, args.options);
	}

	/**
	 * Send an AJAX request to the server.
	 *
	 * @returns The response from the server, or void if the request was canceled by the user or another script.
	 * @throws {ValidationFailedError} When browser-based form validation fails.
	 */
	async send(): Promise<void | AxiosResponse<WinterRequestResponseData>> {
		// Validate the form client-side
		if (this.options.browserValidate && this.form.checkValidity()) {
			this.form.reportValidity();

			throw new ValidationFailedError();
		}

		this.element.dispatchEvent(events.ajaxSetup({ context: this }));

		if (!this.element.dispatchEvent(events.wnBeforeRequest({ context: this }))) {
			return;
		}

		const requestHeaders = new Headers({
			// Spoof XMLHttpRequest to trick Laravel
			'X-REQUESTED-WITH': 'XMLHttpRequest',
			'X-WINTER-REQUEST-HANDLER': this.handler,
			'X-WINTER-REQUEST-PARTIALS': Object.keys(this.options.update).join('&'),
		});

		if (this.options.flash) {
			requestHeaders.set('X-WINTER-REQUEST-FLASH', 'true');
		}

		/*
		 * Request data
		 */
		let requestData: any,
			inputName: string;
		
		const data = extendRequest(this.element);

		// If this instance is not bound to a form, but to an input element, get it's value
		if (
			!this.form &&
			this.element instanceof HTMLInputElement ||
			this.element instanceof HTMLTextAreaElement ||
			this.element instanceof HTMLSelectElement ||
			this.element instanceof HTMLButtonElement
		) {
			inputName = this.element.name;
			if (inputName !== undefined && this.options.data[inputName] === undefined) {
				this.options.data[inputName] = this.element.value;
			}
		}

		// If options.data, merge into data.
		if (this.options.data !== undefined && Object.keys(this.options.data).length > 0) {
			Object.assign(data, this.options.data);
		}

		if (this.options.files) {
			const formData = new FormData(
				this.form instanceof HTMLFormElement ? this.form : undefined
			);

			if (this.element instanceof HTMLInputElement && this.element.type === 'file' && inputName) {
				for (let i = 0; i < this.element.files.length; i++) {
					formData.append(inputName, this.element.files.item(i));
				}

				delete data[inputName];
			}

			// Iterate through data and append to FormData, extracting file names from File objects
			for (const [key, value] of Object.entries(data)) {
				if (value instanceof File && value.name) {
					formData.append(key, value, value.name);
					continue;
				}

				formData.append(key, value);
			}

			requestData = formData;
		} else {
			requestData = [
				new URLSearchParams(this.form).toString(),
				new URLSearchParams(data).toString(),
			].filter(Boolean).join('&');
		}

		/*
		 * Initiate request
		 */

		// Handle confirm message
		if (this.options.confirm !== false) {
			const message = typeof this.options.confirm === 'string' ? this.options.confirm : null;
			const result = await this.options.handlers.onConfirmMessage.bind(this)(message);
			if (!result) return;
		}

		// Trigger an event on the 'loading' element
		if (this.options.loading instanceof HTMLElement) {
			this.options.loading.dispatchEvent(events.wnBeforeRequest());
		}

		// Trigger the 'ajaxBeforeSend' event on window
		window.dispatchEvent(events.ajaxBeforeSend({ context: this }));

		// Trigger the 'ajaxPromise' event on the attached element
		this.element.dispatchEvent(events.ajaxPromise({ context: this }));

		let response: AxiosResponse<WinterRequestResponseData>,
			error: AxiosError;

		// Send the request
		try {
			response = await axios.request({
				method: 'POST',
				url: this.options.url,
				headers: requestHeaders,
				data: requestData,
				cancelToken: this._cancelTokenSource.token
			});

			await this.options.handlers.onSuccess.bind(this)(response);

			if (!this.options.redirect) {
				this.element.dispatchEvent(events.ajaxDone({ context: this, response }));
			}

			return response;
		} catch (e) {
			error = e;

			await this.options.handlers.onError.bind(this)(error);

			if (!this.options.redirect) {
				this.element.dispatchEvent(events.ajaxFail({ context: this, error }));
			}

			throw e;
		} finally {
			await this.options.handlers.onComplete.bind(this)(response, error);

			if (this.options.loading instanceof HTMLElement) {
				this.options.loading.dispatchEvent(events.wnAfterRequest());
			}

			this.element.dispatchEvent(events.ajaxAlways({ context: this, response, error }));
		}
	}

	abort(): void {
		this._cancelTokenSource.cancel();
	}
}

export default WnRequest;
