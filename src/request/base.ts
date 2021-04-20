import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { trackInput, validateHandler } from '../utils';
import { injectPartials } from '../utils';

export type WinterRequestFlashMessageType = 'info' | 'success' | 'warning' | 'error';

export type WinterRequestResponseAssets = {
	js?: Array<string>,
	css?: Array<string>,
	img?: Array<string>,
};

export type WinterRequestResponseData = {
	/**
	 * A URL to redirect the user to.
	 */
	X_WINTER_REDIRECT?: string,

	/**
	 * Assets to inject into the page.
	 */
	X_WINTER_ASSETS?: WinterRequestResponseAssets,

	/**
	 * If an AJAXException was thrown, the error message.
	 */
	X_WINTER_ERROR_MESSAGE?: string,

	/**
	 * Fields that failed form validation.
	 */
	X_WINTER_ERROR_FIELDS?: {
		[name: string]: Array<string>,
	},

	/**
	 * Flash messages.
	 */
	X_WINTER_FLASH_MESSAGES?: Record<WinterRequestFlashMessageType, string>,
	
	/**
	 * Request data.
	 */
	result: any,

	/**
	 * Additional request data.
	 */
	[key: string]: any,
};

export interface IWinterRequestFrameworkOptions<C extends IWinterRequestFramework> {
	/**
	 * URL to send the request to.
	 */
	url?: string,

	/**
	 * If set, this confirmation message is displayed before the request is sent. This allows the user to cancel the request.
	 */
	confirm?: boolean|string,

	/**
	 * Data to be sent to the server along with the form data. When `files` is true, you may also include files to be uploaded in this object by using `File` objects.
	 */
	data?: Record<string, any>,

	/**
	 * A URL to redirect the browser to after the successful request.
	 */
	redirect?: string,

	/**
	 * Send data as JSON (if not using files)
	 */
	json?: boolean,

	/**
	 * Optional handlers to extend the functionality of this instance.
	 */
	handlers?: {
		/**
		 * Callback function to execute before sending the request, allows modifying the request config.
		 */
		onSetup? (this: C): Promise<any>,

		/**
		 * Callback function to execute when the request is successful.
		 * If set, it overrides the default framework's functionality:
		 *   * Elements are not updated
		 *   * These events are not triggered: `beforeUpdate`, `ajaxUpdate`, and `ajaxUpdateComplete`.
		 * 
		 * @param response The response object.
		 */
		onSuccess? (this: C, response: AxiosResponse<WinterRequestResponseData>): Promise<any>,

		/**
		 * Callback function to execute in case of an error. By default the alert message is displayed.
		 * If this option is overridden the alert message won't be displayed.
		 * 
		 * @param error    The error object.
		 */
		onError? (this: C, error: AxiosError<WinterRequestResponseData>): Promise<any>,

		/**
		 * Callback function execute in case of a success or an error.
		 * 
		 * @param response The response object.
		 * @param error    The error object.
		 */
		onComplete? (this: C, response?: AxiosResponse<WinterRequestResponseData>, error?: AxiosError<WinterRequestResponseData>): Promise<any>,

		/**
		 * Called when an error message should be displayed.
		 * 
		 * @param message The error message.
		 */
		onErrorMessage? (this: C, message: string): Promise<any>,

		/**
		 * Called when requesting confirmation from the user.
		 * 
		 * @param message The confirmation message.
		 */
		onConfirmMessage? (this: C, message: string): Promise<boolean>,
	},
}

export interface IWinterRequestFramework {
	send(data?: any): Promise<any>;
	cancel(): void;
}

export interface IWinterRequestFrameworkOptionsBase<C extends WinterRequestFrameworkBase> extends IWinterRequestFrameworkOptions<C> {
	/**
	 * Specifies a list of partials and page elements (as CSS selectors) to update with content received from the server.
	 *   * If the selector begins with the `@` symbol, the content will be appended. E.g.: `@#myDiv`
	 *   * If the selector begins with the `^` symbol, the content will be prepended. E.g. `^#myDiv`
	 */
	update?: {
		[name: string]: string,
	},

	/**
	 * Instructs the server to clear and send any flash messages with the response.
	 */
	flash?: boolean,

	/**
	 * A form element (or selector) to use for sourcing the form data sent with the request.
	 */
	form?: string|HTMLFormElement,

	/**
	 * The request will accept file uploads.
	 */
	files?: boolean,

	/**
	  * If true, browser-based client side validation will be performed on the request before submitting.
	  *   * This only applies to requests triggered on a `<form>` element.
	  *   * This type of validation may behave unexpectedly when fields are not always visible.
	  */
	browserValidate?: boolean,
 
	/**
	  * An element (or selector) to be displayed when a request runs.
	  * The element should listen to the `wn.beforeRequest` and `wn.afterRequest` custom events to manage the visibility.
	  */
	loading?: string|HTMLElement,
 
	/**
	  * Track input on form fields.
	  */
	trackInput?: boolean|number,

	handlers?: IWinterRequestFrameworkOptions<C>['handlers'] & {
		/**
		 * Called when form validation is used.
		 * 
		 * @param message The validation exception message.
		 * @param fields  The form fields with validation messages.
		 */
		onValidationMessage? (this: C, message: string, fields?: {[name: string]: Array<string>}): Promise<any>,

		/**
		 * Called when a flash message is provided.
		 * 
		 * @param message The flash message.
		 * @param string  Level, e.g.: `info`, `error`, `success`, `warning`.
		 */
		onFlashMessage? (this: C, message: string, type: string | WinterRequestFlashMessageType): Promise<any>,

		/**
		 * Called when the browser should redirect to another location.
		 * 
		 * @param url The URL to redirect to.
		 */
		onRedirectResponse? (this: C, url: string): Promise<any>,

		/**
		 * Called to handle any application specific response values
		 * 
		 * @param partials The response data.
		 */
		onUpdateResponse? (this: C, data: WinterRequestResponseData): Promise<any>,

		/**
		 * Callback function to execute before page elements are updated.
		 * 
		 * @param this 
		 * @param response 
		 */
		onBeforeUpdate? (this: C, response: AxiosResponse<WinterRequestResponseData>): Promise<any>,

		/**
		 * Callback function to execute in case assets are received from the server.
		 * 
		 * @param response The response object.
		 */
		onAssets? (this: C, assets: WinterRequestResponseAssets): Promise<any>,

		/**
		 * Callback function to execute when tracking keystrokes.
		 * 
		 * @param interval The interval between key-ups to wait before sending a request.
		 */
		trackInput? (interval?: number): void,
	},

	/**
	 * These events are fired on the triggering element.
	 */
	ajaxHandlers?: {
		/**
		 * Triggered before the request is formed, allowing options to be modified.
		 * 
		 * @param config Axios request options.
		 * @returns Modified axios request options.
		 */
		ajaxSetup?(config: AxiosRequestConfig): Promise<AxiosRequestConfig>,

		/**
		 * Triggered directly before the AJAX request is sent.
		 */
		ajaxPromise?(): Promise<any>,

		/**
		 * Triggered finally if the AJAX request fails.
		 */
		ajaxFail?(): Promise<any>,

		/**
		 * Triggered finally if the AJAX request was successful.
		 */
		ajaxDone?(): Promise<any>,

		/**
		 * Triggered regardless if the AJAX request fails or was successful.
		 */
		ajaxAlways?(): Promise<any>,

		/**
		 * 
		 */
		ajaxRedirected?(): Promise<any>,
	}
}

export const defaults: IWinterRequestFrameworkOptionsBase<WinterRequestFrameworkBase> = {
	url: window.location.href,
	confirm: false,
	data: {},
	redirect: null,
	json: false,
	update: {},
	flash: false,
	files: false,
	browserValidate: false,
	loading: null,
	trackInput: false,
	handlers: {
		onSetup: async () => { /**/ },
		onSuccess: async function (response) {
			// Handle flash messages
			if (this.options.flash && response.data.X_WINTER_FLASH_MESSAGES) {
				for (const [type, message] of Object.entries<string>(response.data.X_WINTER_FLASH_MESSAGES)) {
					await this.options.handlers.onFlashMessage.call(this, message, type);
				}
			}

			// Proceed with the update process
			await this.options.handlers.onUpdateResponse.call(this, response.data);
		},
		onError: async function (error) {
			let errorMsg: string = error.response.statusText;

			// Status 406 is a 'smart error' that returns a response object.
			// It is processed the same way as a successful response.
			if (error.response && error.response.status == 406 && error.response.data) {
				errorMsg =  error.response.data.X_WINTER_ERROR_MESSAGE;
				await this.options.handlers.onUpdateResponse.call(this, error.response.data);
			}

			this.options.handlers.onErrorMessage.call(this, errorMsg);
		},
		onComplete: async () => { /**/ },
		onErrorMessage: async function (message) {
			alert(message);
		},
		onConfirmMessage: async function (message?) {
			return window.confirm(message || 'Are you sure?');
		},
		onValidationMessage: async () => { /**/ },
		onFlashMessage: async () => { /**/ },
		onUpdateResponse: async function (data) {
			//Handle redirect
			if (data.X_WINTER_REDIRECT) {
				this.options.handlers.onRedirectResponse.call(this, data.X_WINTER_REDIRECT);
				return;
			}

			// Handle asset injection
			if (data.X_WINTER_ASSETS) {
				await this.options.handlers.onAssets.call(this, data.X_WINTER_ASSETS);
			}

			// Handle partials
			await injectPartials.call(this, this.options.update, data);

			// Handle validation
			if (data.X_WINTER_ERROR_FIELDS) {
				this.options.handlers.onValidationMessage.call(this, data.X_WINTER_ERROR_MESSAGE, data.X_WINTER_ERROR_FIELDS);
			}
		},
		onRedirectResponse: async function (url) {
			window.location.assign(url);
		},
		onBeforeUpdate: async () => { /**/ },
		onAssets: async () => { /**/ },
		trackInput: trackInput,
	},
	ajaxHandlers: {
		ajaxSetup: async (config) => config,
		ajaxPromise: async () => { /**/ },
		ajaxFail: async () => { /**/ },
		ajaxDone: async () => { /**/ },
		ajaxAlways: async () => { /**/ },
		ajaxRedirected: async () => { /**/ },
	}
};

export class WinterRequestFrameworkBase<T = any> implements IWinterRequestFramework {
	protected readonly _handler: string;

	protected _axiosCancelToken: CancelTokenSource;
	protected _options: IWinterRequestFrameworkOptionsBase<WinterRequestFrameworkBase<T>>;
	protected _axios: AxiosInstance;

	constructor(handler?: string, options: IWinterRequestFrameworkOptionsBase<WinterRequestFrameworkBase> = {}) {
		validateHandler(handler);

		this._handler = handler;
		this.options = {
			...defaults,
			...options,
		};
		this._axiosCancelToken = axios.CancelToken.source();
		this._axios = axios.create({
			method: 'post',
			headers: {
				'X-REQUESTED-WITH': 'XMLHttpRequest', // Spoof XMLHttpRequest to trick Laravel
				'X-WINTER-REQUEST-HANDLER': this.handler,
			},
			cancelToken: this._axiosCancelToken.token,
		});

		if (typeof this._options.trackInput === 'number') {
			this._options.handlers.trackInput(this._options.trackInput);
		} else if (this._options.trackInput === true) {
			this._options.handlers.trackInput();
		}
	}

	get handler(): string {
		return this._handler;
	}

	get options(): IWinterRequestFrameworkOptionsBase<WinterRequestFrameworkBase<T>> {
		return this._options;
	}

	set options(options: IWinterRequestFrameworkOptionsBase<WinterRequestFrameworkBase<T>>) {
		this._options = options;
	}

	get axiosCancelToken(): CancelTokenSource {
		if (!this._axiosCancelToken) {
			this._axiosCancelToken = axios.CancelToken.source();
		}
		return this._axiosCancelToken;
	}

	/**
	 * Build the request data.
	 * 
	 * @param data Data to add to merge into request only.
	 * @returns The data to send with the request.
	 */
	protected getData(data?: T): T {
		return Object.assign<unknown, Record<string, any>, T>({}, this.options.data, data);
	}

	/**
	 * Generates the HTTP headers to use on the request to the server.
	 * 
	 * Axios will automatically add the following `Content-Type` headers based on the type of data:
	 * * `application/x-www-form-urlencoded;charset=utf-8` for `URLSearchParams`.
	 * * `application/json;charset=utf-8` for `Object`
	 * * `multipart/form-data; boundary=` for `FormData` with `Blob`/`File` values.
	 * 
	 * @returns A Headers object.
	 */
	protected getHeaders(): Headers {
		const requestHeaders = new Headers({
			'X-WINTER-REQUEST-PARTIALS': Object.keys(this.options.update).join('&'),
		});

		if (this.options.flash) {
			requestHeaders.set('X-WINTER-REQUEST-FLASH', 'true');
		}

		return requestHeaders;
	}

	protected async setup(data: T): Promise<AxiosRequestConfig> {
		await this.options.handlers.onSetup.call(this);

		return {
			url: this.options.url || window.location.href,
			data: this.getData(data),
			headers: this.getHeaders(),
		};
	}

	/**
	 * Initiates the request to the server.
	 * 
	 * @param data Optional data to merge into this request.
	 * @returns The response data.
	 */
	async send(data?: T): Promise<void | AxiosResponse<WinterRequestResponseData>> {
		// Handle confirm message
		if (this.options.confirm !== false) {
			const message = typeof this.options.confirm === 'string' ? this.options.confirm : null;
			const result = await this.options.handlers.onConfirmMessage.call(this, message);
			if (!result) return;
		}

		let response: AxiosResponse<WinterRequestResponseData>,
			error: AxiosError;

		// Send the request
		try {
			response = await this._axios.request(await this.setup(data));

			await this.options.handlers.onSuccess.call(this, response);

			return response;
		} catch (e) {
			error = e;

			await this.options.handlers.onError.call(this, error);

			//throw e;
		} finally {
			await this.options.handlers.onComplete.call(this, response, error);
		}
	}

	cancel(): void {
		this.axiosCancelToken.cancel();
	}
}