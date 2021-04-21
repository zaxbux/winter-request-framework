import { WinterResponseData } from '../../types';
import { ajaxUpdate, ajaxBeforeReplace, ajaxUpdateComplete } from '../events';

/**
 * If a partial has been supplied on the client side that matches the server supplied key, look up
 * it's selector and use that. If not, we assume it is an explicit selector reference.
 */
export async function injectPartials(partials: { [name: string]: string }, data: WinterResponseData): Promise<void> {
	for (const partial in data) {
		let selector = partials[partial] ? partials[partial] : partial;
		let position: InsertPosition;

		if (selector[0] === '^') {
			// Prepend
			selector = selector.substring(1);
			position = 'afterbegin';
		} else if (selector[0] === '@') {
			// Append
			selector = selector.substring(1);
			position = 'beforeend', data[partial];
		}

		const element = document.querySelector<HTMLElement>(selector);

		if (element) {
			element.dispatchEvent(ajaxUpdate({ context: this, data }));

			if (position) {
				element.insertAdjacentHTML(position, data[partial]);
			} else {
				element.dispatchEvent(ajaxBeforeReplace());
				element.innerHTML = data[partial];
			}
		}
	}

	window.dispatchEvent(ajaxUpdateComplete({ context: this, data }));
	//window.dispatchEvent(new Event('resize'));
}