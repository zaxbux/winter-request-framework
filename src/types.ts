import { AxiosResponse } from 'axios';

export type WinterRequestFlashMessageType = 'info' | 'success' | 'warning' | 'error';

export interface WinterResponseAssets {
	js?: Array<string>,
	css?: Array<string>,
	img?: Array<string>,
}

export interface WinterResponseData {
	/**
	 * A URL to redirect the user to.
	 */
	X_WINTER_REDIRECT?: string,

	/**
	 * Assets to inject into the page.
	 */
	X_WINTER_ASSETS?: WinterResponseAssets,

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
}

export interface WinterResponse extends AxiosResponse {
	data: WinterResponseData
}