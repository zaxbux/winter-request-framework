import { parse } from 'json5';
import { Request } from '../request';
import { WinterRequestResponseData } from '../request/base';
import { ajaxUpdate, ajaxBeforeReplace, ajaxUpdateComplete } from '../events';
import DataStore from './data-store';
import { HTMLInputLikeElements } from '../types';

/**
 * Validate the AJAX handler name. E.g.: `[componentName::]onHandlerName`.
 * 
 * @param {string} handler The AJAX handler name.
 * @throws {Error}
 */
export function validateHandler(handler: string): void {
	if (handler === undefined) {
		throw new Error('The request handler name is not specified.');
	}

	if (!handler.match(/^(?:\w+:{2})?on*/)) {
		throw new Error(`Invalid handler name "${handler}". The correct format is: "[componentName::]onHandlerName".`);
	}
}

/**
 * Converts the value of a data-* attribute into a JSON object.
 * 
 * @param name 
 * @param value 
 * 
 * @returns any
 */
export function paramToObj(value: string): any {
	if (value === undefined) value = '';
	if (typeof value == 'object') return value;

	return parse('{' + value + '}');
}

/**
 * Search the DOM for parents of the element that have [data-request-data].
 *
 * @since 0.0.1
 * @param el The starting element.
 * @returns The request data collected from the element's parents.
 */
export function getRequestDataAttrs(el: HTMLElement): Record<string, any> {
	const requestData = {};
	const elements = [];

	for (
		let current = el && el.parentElement;
		current;
		current = current.parentElement
	) {
		if (current.matches('[data-request-data]')) {
			elements.push(current);
		}
	}

	// Reverse the array so that parent data gets overridden by child request data.
	elements.reverse().forEach((element) => {
		Object.assign(requestData, paramToObj(element.dataset.requestData));
	});

	return requestData;
}

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

export function attachEventListeners(r: Request): void {
	const documentOnChange = 'select[data-request], input[type=radio][data-request], input[type=checkbox][data-request], input[type=file][data-request]';
	/*$(document).on('change', documentOnChange, function documentOnChange() {
		$(this).request();
	});*/

	document.addEventListener('change', (ev) => {
		if (ev.target instanceof HTMLElement && ev.target.matches(documentOnChange)) {
			Request.instance({ element: ev.target });
		}
	});
	
	const documentOnClick = 'a[data-request], button[data-request], input[type=button][data-request], input[type=submit][data-request]';

	/*$(document).on('click', documentOnClick, function documentOnClick(e) {
		e.preventDefault();

		$(this).request();

		if ($(this).is('[type=submit]'))
			return false;
	});*/

	document.addEventListener('click', (ev) => {
		if (ev.target instanceof HTMLElement && ev.target.matches(documentOnClick)) {
			ev.preventDefault();

			Request.instance({ element: ev.target });

			if (ev.target.matches('[type=submit]')) {
				ev.stopPropagation();
			}
		}
	});

	const documentOnKeydown = 'input[type=text][data-request], input[type=submit][data-request], input[type=password][data-request]';

	/*$(document).on('keydown', documentOnKeydown, function documentOnKeydown(e) {
		if (e.key === 'Enter') {
			if (this.dataTrackInputTimer !== undefined)
				window.clearTimeout(this.dataTrackInputTimer);

			$(this).request();
			return false;
		}
	});*/

	r.element.addEventListener('keydown', (ev) => {
		if (ev.key === 'Enter' && ev.target instanceof HTMLElement && ev.target.matches(documentOnKeydown)) {
			
			if (r.dataTrackInputTimer !== undefined) {
				window.clearTimeout(r.dataTrackInputTimer);
			}

			Request.instance({ element: ev.target });
			ev.preventDefault();
			ev.stopPropagation();
			
		}
	});

	const documentOnKeyup = 'input[data-request][data-track-input]';

	/*$(document).on('input', 'input[data-request][data-track-input]', function documentOnKeyup(e) {
		const
			$el = $(this),
			lastValue = $el.data('oc.lastvalue');

		if (!$el.is('[type=email],[type=number],[type=password],[type=search],[type=text]'))
			return;

		if (lastValue !== undefined && lastValue == this.value)
			return;

		$el.data('oc.lastvalue', this.value);

		if (this.dataTrackInputTimer !== undefined)
			window.clearTimeout(this.dataTrackInputTimer);

		let interval = $(this).data('track-input');
		if (!interval)
			interval = 300;

		const self = this;
		this.dataTrackInputTimer = window.setTimeout(function () {
			if (self.lastDataTrackInputRequest) {
				self.lastDataTrackInputRequest.abort();
			}
			self.lastDataTrackInputRequest = $(self).request();
		}, interval);
	});*/

	r.element.addEventListener('keyup', (ev) => {
		if (ev.target instanceof HTMLInputElement && ev.target.matches(documentOnKeyup)) {
			const lastValue = DataStore.get(ev.target, 'wn.lastValue');

			if (!ev.target.matches('[type=email], [type=number], [type=password], [type=search], [type=text]')) {
				return;
			}

			if (lastValue !== undefined && lastValue == this.value) {
				return;
			}

			DataStore.put(ev.target, 'wn.lastValue', ev.target.value);

			if (r.dataTrackInputTimer !== undefined) {
				window.clearTimeout(this.dataTrackInputTimer);
			}

			const interval = r.element.dataset.trackInput ? Number.parseInt(r.element.dataset.trackInput) : 300;

			const elem = ev.target;

			r.dataTrackInputTimer = window.setTimeout(() => {
				let lastDataTrackInputRequest = DataStore.get(elem, 'wn.lastRequest');

				if (lastDataTrackInputRequest) {
					lastDataTrackInputRequest.abort();
				}
				lastDataTrackInputRequest = new Request(r.element, r.handler, r.options);
				DataStore.put(elem, 'wn.lastRequest', lastDataTrackInputRequest);
				lastDataTrackInputRequest.send();

			}, interval);
		}
	});

	/*$(document).on('submit', '[data-request]', function documentOnSubmit() {
		$(this).request();
		return false;
	});*/

	r.element.addEventListener('submit', (ev) => {
		if (ev.target instanceof HTMLElement && ev.target.matches('[data-request]')) {
			r.send();

			ev.preventDefault();
			ev.stopPropagation();
		}
	});

	/*$(window).on('beforeunload', function documentOnBeforeUnload() {
		window.ocUnloading = true;
	});*/

	/* // Not implemented
	window.addEventListener('beforeunload', () => {
		window.wn.unloading = true;
	});
	*/

	/*
	 * Invent our own event that unifies document.ready with window.ajaxUpdateComplete
	 *
	 * $(document).render(function() { })
	 * $(document).on('render', function() { })
	 */

	/* // jQuery non-sense
	$(document).ready(function triggerRenderOnReady() {
		$(document).trigger('render');
	});

	$(window).on('ajaxUpdateComplete', function triggerRenderOnAjaxUpdateComplete() {
		$(document).trigger('render');
	});

	$.fn.render = function (callback) {
		$(document).on('render', callback);
	};
	*/
}

/**
 * Evaluate if a string is truthy.
 * 
 * @param string A "truthy" string value.
 * @returns True if `1`, `"1"`, `true`, `"true"`, or `[1]`.
 */
export function stringToBoolean(string: string | boolean): boolean {
	return (typeof string === 'string' && string.toLowerCase() === 'true') || string == true;
}

/**
 * Queries the DOM for a selector string and returns the first matching HTMLElement.
 * 
 * @param element A selector string, or HTMLElement.
 * @returns The matching element.
 */
export function getElement<E extends HTMLElement = HTMLElement>(element: string | E): E {
	if (typeof element === 'string') return document.querySelector<E>(element);

	return element;
}

/**
 * Checks if an element is input-like.
 * 
 * @param element The element to test.
 * @returns True if the element is an HTML input-like element.
 */
export function isInputLike<T extends HTMLInputLikeElements>(element: HTMLElement): element is T {
	return element instanceof HTMLInputElement ||
		element instanceof HTMLTextAreaElement ||
		element instanceof HTMLSelectElement ||
		element instanceof HTMLButtonElement;
}

/**
 * Checks if an object is empty.
 * 
 * @param obj The object to check.
 * @returns True if empty, false if not.
 */
export function isEmpty(obj: Record<string, unknown>): boolean {
	for (const _i in obj) return true;
	return false;
}