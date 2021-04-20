import { WinterRequestResponseData } from '../request/base';
import { ajaxUpdate, ajaxBeforeReplace, ajaxUpdateComplete } from '../events';

/**
 * If a partial has been supplied on the client side that matches the server supplied key, look up
 * it's selector and use that. If not, we assume it is an explicit selector reference.
 */
export async function injectPartials(partials: { [name: string]: string }, data: WinterRequestResponseData): Promise<void> {
	for (const partial in data) {
		let element: HTMLElement;
		const selector = partials[partial] ? partials[partial] : partial;

		if (selector[0] === '^') {
			// Prepend
			element = document.querySelector(selector.substring(1));
			element.insertAdjacentHTML('afterbegin', data[partial]);
		} else if (selector[0] === '@') {
			// Append
			element = document.querySelector(selector.substring(1));
			element.insertAdjacentHTML('beforeend', data[partial]);
		} else {
			// Replace
			element = document.querySelector(selector);
			element.dispatchEvent(ajaxBeforeReplace());
			element.innerHTML = data[partial];
		}

		element.dispatchEvent(ajaxUpdate({ context: this, data }));
	}

	window.dispatchEvent(ajaxUpdateComplete({ context: this, data }));
	window.dispatchEvent(new Event('resize'));
}