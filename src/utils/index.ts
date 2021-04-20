import { parse } from 'json5';
import { InvalidHandlerError } from '../errors';

export * from './data-store';
export * from './track-input';
export * from './inject-partials';

type HTMLInputLikeElements = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | HTMLButtonElement;

/**
 * Validate the AJAX handler name. E.g.: `[componentName::]onHandlerName`.
 * 
 * @param {string} handler The AJAX handler name.
 * @throws {InvalidHandlerError} When the provided handler fails validation.
 */
export function validateHandler(handler: string): void {
	if (handler === undefined) {
		throw new InvalidHandlerError('The request handler name was not specified.');
	}

	if (!handler.match(/^(?:\w+:{2})?on*/)) {
		throw new InvalidHandlerError(`Invalid request handler name "${handler}".`);
	}
}

/**
 * Converts the value of a data-* attribute into a JSON object.
 * 
 * @param value E.g.: `'key': 'value', ...` or `{'key': 'value', ...}`.
 * 
 * @returns An object.
 */
export function paramToObj(value: string): any {
	if (value === undefined) value = '';
	if (typeof value == 'object') return value;

	if (value.startsWith('{') && value.endsWith('}')) return parse(value);

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
 * Evaluates if a string is truthy.
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