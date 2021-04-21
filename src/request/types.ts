import { AxiosError } from 'axios';
import { WinterRequest } from '.';
import { WinterRequestFlashMessageType, WinterResponse, WinterResponseAssets, WinterResponseData } from '../types';

export type RequestOptions<T = any> = IWinterRequestFrameworkOptions<WinterRequest<T>>;

export interface IWinterRequestFramework {
	send(data?: any): Promise<any>;
	cancel(): void;
}

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
	 * Instructs the server to clear and send any flash messages with the response.
	 */
	flash?: boolean,

	/**
	 * Specifies a list of partials and page elements (as CSS selectors) to update with content received from the server.
	 *   * If the selector begins with the `@` symbol, the content will be appended. E.g.: `@#myDiv`
	 *   * If the selector begins with the `^` symbol, the content will be prepended. E.g. `^#myDiv`
	 */
	update?: {
		[name: string]: string,
	},

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
	//handlers?: {
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
	onSuccess? (this: C, response: WinterResponse): Promise<any>,

	/**
	 * Callback function to execute in case of an error. By default the alert message is displayed.
	 * If this option is overridden the alert message won't be displayed.
	 * 
	 * @param error    The error object.
	 */
	onError? (this: C, error: AxiosError<WinterResponseData>): Promise<any>,

	/**
	 * Callback function execute in case of a success or an error.
	 * 
	 * @param response The response object.
	 * @param error    The error object.
	 */
	onComplete? (this: C, response?: WinterResponse, error?: AxiosError<WinterResponseData>): Promise<any>,

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
	onConfirmMessage?(this: C, message: string): Promise<boolean>,

	/**
	 * Called when form validation is used.
	 * 
	 * @param message The validation exception message.
	 * @param fields  The form fields with validation messages.
	 */
	onValidationMessage?(this: C, message: string, fields?: { [name: string]: Array<string> }): Promise<any>,

	/**
	 * Called when a flash message is provided.
	 * 
	 * @param message The flash message.
	 * @param string  Level, e.g.: `info`, `error`, `success`, `warning`.
	 */
	onFlashMessage?(this: C, message: string, type: string | WinterRequestFlashMessageType): Promise<any>,

	/**
	 * Called when the browser should redirect to another location.
	 * 
	 * @param url The URL to redirect to.
	 */
	onRedirectResponse?(this: C, url: string): Promise<any>,

	/**
	 * Called to handle any application specific response values
	 * 
	 * @param partials The response data.
	 */
	onUpdateResponse?(this: C, data: WinterResponseData): Promise<any>,

	/**
	 * Callback function to execute before page elements are updated.
	 * 
	 * @param this 
	 * @param response 
	 */
	onBeforeUpdate?(this: C, response: WinterResponse): Promise<any>,

	/**
	 * Callback function to execute in case assets are received from the server.
	 * 
	 * @param response The response object.
	 */
	onAssets?(this: C, assets: WinterResponseAssets): Promise<any>,
	//},
}

