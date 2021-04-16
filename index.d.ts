import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import WnRequest from './src';

export interface WinterRequestOptions {
	/**
	 * URL to send the request to.
	 * Default: `window.location.href`
	 */
	url?: string,

	/**
	 * Specifies a list of partials and page elements (as CSS selectors) to update with content received from the server.
	 *   * If the selector begins with the `@` symbol, the content will be appended. E.g.: `@#myDiv`
	 *   * If the selector begins with the `^` symbol, the content will be prepended. E.g. `^#myDiv`
	 */
	update?: {
		[name: string]: string,
	},

	/**
	 * If set, this confirmation message is displayed before the request is sent. This allows the user to cancel the request.
	 */
	confirm?: boolean|string,

	/**
	 * Data to be sent to the server along with the form data. When `files` is true, you may also include files to be uploaded in this object by using `File` objects.
	 */
	data?: {
		[name: string]: any,
	},

	/**
	 * A URL to redirect the browser to after the successful request.
	 */
	redirect?: string,

	/**
	 * A form element (or selector) to use for sourcing the form data sent with the request.
	 */
	form?: string|HTMLFormElement,

	/**
	 * Instructs the server to clear and send any flash messages with the response.
	 */
	flash?: boolean,

	/**
	 * The request will accept file uploads.
	 * Default: false
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
	trackInput?: boolean,

	/**
	 * Optional handlers to extend the functionality of this instance.
	 */
	handlers?: {
		/**
		 * Callback function to execute before page elements are updated.
		 */
		onBeforeUpdate? (this: WnRequest, response: AxiosResponse<WinterRequestResponseData>): Promise<any>,

		/**
		 * Callback function to execute when the request is successful.
		 * If set, it overrides the default framework's functionality:
		 *   * Elements are not updated
		 *   * These events are not triggered: `beforeUpdate`, `ajaxUpdate`, and `ajaxUpdateComplete`.
		 * 
		 * @param response The response object.
		 */
		onSuccess? (this: WnRequest, response: AxiosResponse<WinterRequestResponseData>): Promise<any>,

		/**
		 * Callback function to execute in case of an error. By default the alert message is displayed.
		 * If this option is overridden the alert message won't be displayed.
		 * 
		 * @param error    The error object.
		 */
		onError? (this: WnRequest, error: AxiosError<WinterRequestResponseData>): Promise<any>,

		/**
		 * Callback function execute in case of a success or an error.
		 * 
		 * @param response The response object.
		 * @param error    The error object.
		 */
		onComplete? (this: WnRequest, response?: AxiosResponse<WinterRequestResponseData>, error?: AxiosError<WinterRequestResponseData>): Promise<any>,

		/**
		 * Callback function to execute in case assets are received from the server.
		 * 
		 * @param response The response object.
		 */
		onAssets? (this: WnRequest, assets: WinterRequestResponseAssets): Promise<any>,

		/**
		 * Called when requesting confirmation from the user.
		 * 
		 * @param message The confirmation message.
		 */
		onConfirmMessage? (this: WnRequest, message: string): Promise<boolean>,

		/**
		 * Called when an error message should be displayed.
		 * 
		 * @param message The error message.
		 */
		onErrorMessage? (this: WnRequest, message: string): Promise<any>,

		/**
		 * Called when form validation is used.
		 * 
		 * @param message The validation exception message.
		 * @param fields  The form fields with validation messages.
		 */
		onValidationMessage? (this: WnRequest, message: string, fields?: {[name: string]: Array<string>}): Promise<any>,

		/**
		 * Called when a flash message is provided.
		 * 
		 * @param message The flash message.
		 * @param string  Level, e.g.: `info`, `error`, `success`, `warning`.
		 */
		onFlashMessage? (this: WnRequest, message: string, type: string | WinterRequestFlashMessageType): Promise<any>,

		/**
		 * Called when the browser should redirect to another location.
		 * 
		 * @param url The URL to redirect to.
		 */
		onRedirectResponse? (this: WnRequest, url: string): Promise<any>,

		/**
		 * Called to handle any application specific response values
		 * 
		 * @param partials The response data.
		 */
		onUpdateResponse? (this: WnRequest, data: WinterRequestResponseData): Promise<any>,
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

export type WinterRequestFlashMessageType = 'info' | 'success' | 'warning' | 'error';

export type WinterRequestResponseAssets = {
	js?: Array<string>,
	css?: Array<string>,
	img?: Array<string>
};

export type WinterRequestResponseData = {
	X_WINTER_REDIRECT?: string,
	X_WINTER_ASSETS?: WinterRequestResponseAssets,
	X_WINTER_ERROR_MESSAGE?: string,
	X_WINTER_ERROR_FIELDS?: {
		[name: string]: Array<string>,
	},
	X_WINTER_FLASH_MESSAGES?: Record<WinterRequestFlashMessageType, string>,
	result: any,
	[key: string]: any,
};

export type WinterRequestStaticArgs = {
	element?: HTMLElement,
	handler?: string,
	options?: WinterRequestOptions,
};
