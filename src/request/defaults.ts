import { RequestOptions } from './types';

const defaults: RequestOptions = {
	url: window.location.href,
	confirm: false,
	data: {},
	redirect: null,
	json: false,
	update: {},
	flash: false,
	//handlers: {
	onSetup: async () => { /**/ },
	onSuccess: async function (response) {
		// Handle flash messages
		if (this.options.flash && response.data.X_WINTER_FLASH_MESSAGES) {
			for (const [type, message] of Object.entries<string>(response.data.X_WINTER_FLASH_MESSAGES)) {
				await this.options.onFlashMessage.call(this, message, type);
			}
		}

		// Proceed with the update process
		await this.options.onUpdateResponse.call(this, response.data);
	},
	onError: async function (error) {
		let errorMsg: string;

		// Status 406 is a 'smart error' that returns a response object.
		// It is processed the same way as a successful response.
		if (error.response && error.response.status == 406 && error.response.data) {
			errorMsg =  error.response.data.X_WINTER_ERROR_MESSAGE;
			await this.options.onUpdateResponse.call(this, error.response.data);
		}

		this.options.onErrorMessage.call(this, errorMsg || error.response.data);
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
			this.options.onRedirectResponse.call(this, data.X_WINTER_REDIRECT);
			return;
		}

		// Handle asset injection
		if (data.X_WINTER_ASSETS) {
			await this.options.onAssets.call(this, data.X_WINTER_ASSETS);
		}

		// Handle validation
		if (data.X_WINTER_ERROR_FIELDS) {
			this.options.onValidationMessage.call(this, data.X_WINTER_ERROR_MESSAGE, data.X_WINTER_ERROR_FIELDS);
		}
	},
	onRedirectResponse: async function (url) {
		window.location.assign(url);
	},
	onBeforeUpdate: async () => { /**/ },
	onAssets: async () => { /**/ },
	//},
};

export default defaults;