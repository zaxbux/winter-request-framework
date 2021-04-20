import { AxiosResponse } from 'axios';
import { ValidationFailedError } from './errors';
import * as events from './events';
import { IWinterRequestFrameworkOptionsBase, WinterRequestFrameworkBase, WinterRequestResponseData } from './request/base';
import { getElement, getRequestDataAttrs, isEmpty, isInputLike, paramToObj, stringToBoolean } from './utils';

type RequestOptions = IWinterRequestFrameworkOptionsBase<Request>;

export type WinterRequestStaticArgs = {
	element?: HTMLElement,
	handler?: string,
	options?: RequestOptions,
};

/**
 * @classdesc The main Request class for Winter AJAX Framework.
 */
export class Request extends WinterRequestFrameworkBase {
	protected _options: RequestOptions;

	private _element: HTMLElement;
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
			options = {
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
				...options
			};
		}

		super(handler, options);

		this._element = _element;

		// If not null and a HTMLFormElement was not provided, query the DOM for the selector.
		// Otherwise, select the closest form element (including the element itself).
		if (this.options.form !== null && !(this.options.form instanceof HTMLFormElement)) {
			if (typeof this.options.form == 'string') {
				this.options.form = document.querySelector<HTMLFormElement>(this.options.form);
			} else {
				this.options.form = this.element.closest('form');
			}
		}

		this._form = getElement(this.options.form);

		// Loading
		this._loading = getElement(this.options.loading);
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
	 * Get an instance of the request framework.
	 * 
	 * @param args Initialization arguments.
	 * @returns An instance of the request framework.
	 */
	static instance(args?: WinterRequestStaticArgs): Request {
		return new Request(args.element || null, args.handler, args.options);
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

		const requestData: Record<string, any> = getRequestDataAttrs(this.element);

		// If options.data, merge into requestData
		if (!isEmpty(this.options.data)) {
			Object.assign(requestData, this.options.data);
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
	async send(data?: unknown): Promise<void | AxiosResponse<WinterRequestResponseData>> {
		// Validate the form client-side
		if (this.options.browserValidate && this.form.checkValidity()) {
			this.form.reportValidity();

			throw new ValidationFailedError();
		}

		this.element.dispatchEvent(events.ajaxSetup({ context: this }));

		if (!this.element.dispatchEvent(events.wnBeforeRequest({ context: this }))) {
			return;
		}

		return super.send(data);
	}
}