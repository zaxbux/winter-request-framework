import merge from 'deepmerge';
import { RequestOptions } from './types';
import defaults from './defaults';
import { ValidationFailedError } from '../errors';
import * as events from './events';
import { WinterRequest } from '../request';
import { getElement, getRequestDataAttrs, isEmpty, isInputLike, paramToObj, stringToBoolean } from '../utils';
import { WinterResponse } from '../types';

/**
 * @classdesc The main Request class for Winter AJAX Framework.
 */
export class WinterRequestExtras extends WinterRequest {
	protected _options: RequestOptions;

	private _element?: HTMLElement;
	private _loading?: HTMLElement;
	private _form?: HTMLFormElement;

	/**
	 * @param element Element that is used to setup the request and fire events on.
	 * @param handler Name of the AJAX handler that the server should execute.
	 * @param options Additional options used to setup the request, overrides data attribute options.
	 */
	constructor(element?: string | HTMLElement, handler?: string, options: RequestOptions = {}) {
		const _element = getElement(element);

		// Get handler from element if available
		if (!handler && _element) {
			handler = _element.dataset.request;
		}

		// data-request-* options
		if (_element) {
			options = merge<RequestOptions>({
				confirm: _element.dataset.requestConfirm,
				redirect: _element.dataset.requestRedirect,
				loading: _element.dataset.requestLoading,
				flash: stringToBoolean(_element.dataset.requestFlash),
				files: stringToBoolean(_element.dataset.requestFiles),
				json: stringToBoolean(_element.dataset.requestJson),
				form: _element.dataset.requestForm,
				url: _element.dataset.requestUrl,
				update: paramToObj(_element.dataset.requestUpdate),
				data: paramToObj(_element.dataset.requestData),
				browserValidate: stringToBoolean(_element.dataset.requestBrowserValidate),
			}, options);
		}

		super(handler, merge<RequestOptions>(defaults, options));

		this._element = _element;

		// Query the DOM for the selector, or select the closest form element (possibly including the element itself).
		if (this.options.form) {
			this._form = getElement<HTMLFormElement>(this.options.form);
		} else {
			if (this._element) {
				this._form = this._element.closest('form');
			}
		}

		// Loading
		this._loading = getElement(this._options.loading);

		// Track inputs
		if (typeof this._options.trackInput === 'number') {
			this._options.onTrackInput(this._options.trackInput);
		} else if (this._options.trackInput === true) {
			this._options.onTrackInput();
		}
	}

	get options(): RequestOptions {
		return this._options;
	}

	set options(options: RequestOptions) {
		this._options = options;
	}

	get element(): HTMLElement {
		return this._element;
	}

	get form(): HTMLFormElement {
		return this._form;
	}

	get loading(): HTMLElement {
		return this._loading;
	}

	/**
	 * Searches DOM for `request-data` data attributes starting at the init element and works up the DOM tree. Parent elements with the same keys are overridden by child elements.
	 * 
	 * * If `options.files` is enabled, returns a `FormData` object.
	 * 
	 * @returns 
	 */
	protected getData(): FormData | URLSearchParams | Record<string, any> {
		let inputName: string;

		let requestData: Record<string, any>;

		// If options.data, merge into requestData
		if (!isEmpty(this.options.data)) {
			Object.assign(requestData, this.options.data, getRequestDataAttrs(this.element));
		}

		// If this instance is not bound to a form, but to an input-like element, get the value
		if (!this.form && isInputLike(this.element)) {
			inputName = this.element.name;
			if (inputName !== undefined && this.options.data[inputName] === undefined) {
				requestData[inputName] = this.element.value;
			}
		}

		if (this.options.files) {
			const formData = new FormData(this.form);

			// Add files from the input (this instance is not bound to form).
			if (inputName && this.element instanceof HTMLInputElement && this.element.type === 'file') {
				for (let i = 0; i < this.element.files.length; i++) {
					formData.append(inputName, this.element.files.item(i));
				}

				delete requestData[inputName];
			}

			// Iterate through data and append to FormData, extracting file names from File objects
			/*for (const [key, value] of Object.entries(requestData)) {
				if (value instanceof File && value.name) {
					formData.append(key, value, value.name);
					continue;
				}

				formData.append(key, value);
			}*/ // probably unnecessary

			return formData;
		}

		const init: Record<string, any> = {};

		// Add non-Blobs to request data.
		if (this.form) {
			for (const [key, value] of new FormData(this.form)) {
				if (value instanceof Blob) continue;

				init[key] = value;
			}
		}

		// Merge from from `request-data` data attributes
		Object.assign<Record<string, any>, Record<string, any>>(init, requestData);

		if (!this.options.json) {
			return new URLSearchParams(init);
		}

		return init;
	}

	/**
	 * Send an AJAX request to the server.
	 *
	 * @returns The response from the server, or void if the request was canceled by the user or another script.
	 * @throws {ValidationFailedError} When browser-based form validation fails.
	 */
	async send(data?: unknown): Promise<void | WinterResponse> {
		// Validate the form client-side
		if (this.options.browserValidate && this.form.checkValidity()) {
			this.form.reportValidity();

			throw new ValidationFailedError();
		}

		if (this.element) {
			this.element.dispatchEvent(events.ajaxSetup({ context: this }));

			if (!this.element.dispatchEvent(events.wnBeforeRequest({ context: this }))) {
				return;
			}
		}

		return super.send(data);
	}
}