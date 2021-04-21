import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, CancelTokenSource } from 'axios';
import merge from 'deepmerge';
import { WinterResponse } from '../types';
import { validateHandler } from '../utils';
import defaults from './defaults';
import { IWinterRequestFramework, RequestOptions } from './types';

export class WinterRequest<T = any> implements IWinterRequestFramework {
	protected _handler: string;
	protected _axiosCancelToken: CancelTokenSource;
	protected _options: RequestOptions<T>;
	protected _axios: AxiosInstance;

	constructor(handler?: string, options: RequestOptions = {}) {
		validateHandler(handler);

		this._handler = handler;
		this._options = merge<RequestOptions>(defaults, options);
		this._axiosCancelToken = axios.CancelToken.source();
		this._axios = axios.create({
			method: 'post',
			headers: {
				'X-REQUESTED-WITH': 'XMLHttpRequest', // Spoof XMLHttpRequest to trick Laravel
				'X-WINTER-REQUEST-HANDLER': this._handler,
			},
			cancelToken: this._axiosCancelToken.token,
		});
	}

	get handler(): string {
		return this._handler;
	}

	get options(): RequestOptions {
		return this._options;
	}

	set options(options: RequestOptions) {
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
	protected getHeaders(): Record<string, string> {
		const requestHeaders: Record<string, string> = {
			'X-WINTER-REQUEST-PARTIALS': Object.keys(this.options.update).join('&'),
		};

		if (this.options.flash) {
			requestHeaders['X-WINTER-REQUEST-FLASH'] = 'true';
		}

		return requestHeaders;
	}

	protected async setup(data: T): Promise<AxiosRequestConfig> {
		await this.options.onSetup.call(this);

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
	async send(data?: T): Promise<void | WinterResponse> {
		// Handle confirm message
		if (this.options.confirm !== false) {
			const message = typeof this.options.confirm === 'string' ? this.options.confirm : null;
			const result = await this.options.onConfirmMessage.call(this, message);
			if (!result) return;
		}

		let response: WinterResponse,
			error: AxiosError;

		// Send the request
		try {
			response = await this._axios.request(await this.setup(data));

			await this.options.onSuccess.call(this, response);

			return response;
		} catch (e) {
			error = e;

			await this.options.onError.call(this, error);

			//throw e;
		} finally {
			await this.options.onComplete.call(this, response, error);
		}
	}

	cancel(): void {
		this.axiosCancelToken.cancel();
	}
}