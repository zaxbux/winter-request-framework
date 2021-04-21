import { AxiosRequestConfig } from 'axios';
import { WinterRequestExtras } from '.';
import { IWinterRequestFrameworkOptions } from '../request/types';

export interface RequestOptions extends IWinterRequestFrameworkOptions<WinterRequestExtras> {
	/**
	 * The request will accept file uploads.
	 */
	files?: boolean,

	/**
	 * A form element (or selector) to use for sourcing the form data sent with the request.
	 */
	form?: string | HTMLFormElement,

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
	loading?: string | HTMLElement,

	/**
	  * Track input on form fields.
	  */
	trackInput?: boolean | number,

	//handlers?: IWinterRequestFrameworkOptions<WinterRequestExtras>['handlers'] & {
	/**
	 * Callback function to execute when tracking keystrokes.
	 * 
	 * @param interval The interval between key-ups to wait before sending a request.
	 */
	onTrackInput? (interval?: number): void,
	//}

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