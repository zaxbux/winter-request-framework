import { AxiosError, AxiosResponse } from 'axios';
import WnRequest from '.';
import { WinterRequestResponseData } from '..';

/**
 * @event Request#ajaxBeforeSend Triggered on the window object before sending the request.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxBeforeSend = (detail: {context: WnRequest}): CustomEvent => new CustomEvent('ajaxBeforeSend', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event Request#ajaxBeforeUpdate  Triggered on the form object directly after the request is complete, but before the page is updated.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxBeforeUpdate = (detail: {context: WnRequest, response: AxiosResponse}): CustomEvent => new CustomEvent('ajaxBeforeUpdate', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event Request#ajaxUpdate Triggered on an element after it has been updated with the framework.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxUpdate = (detail: { context: WnRequest, data: any }): CustomEvent => new CustomEvent('ajaxUpdate', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event Request#ajaxUpdateComplete Triggered on the window object after all elements are updated by the framework.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxUpdateComplete = (detail: { context: WnRequest, data: WinterRequestResponseData }): CustomEvent => new CustomEvent('ajaxUpdateComplete', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event Request#ajaxSuccess  Triggered on the form object after the request is successfully completed.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxSuccess = (detail: { context: WnRequest, data: WinterRequestResponseData }): CustomEvent => new CustomEvent('ajaxSuccess', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event Request#ajaxComplete Triggered when the request is completed successfully or encounters an error.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxComplete = (detail: { context: WnRequest, response?: AxiosResponse<WinterRequestResponseData>, error?: AxiosError<WinterRequestResponseData> }): CustomEvent => new CustomEvent('ajaxComplete', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event Request#ajaxError Triggered on the form object if the request encounters an error
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxError = (detail: { context: WnRequest, error?: AxiosError<WinterRequestResponseData> }): CustomEvent => new CustomEvent('ajaxError', { bubbles: true,  detail });

/**
 * Display an error message to the user.
 * 
 * This is useful for implementing custom alert logic/interface instead of native javascript alert box.
 * 
 * @event Request#ajaxErrorMessage Triggered on the window object if the request encounters an error.
 * @param detail Additional data to pass to the event handler.
 * @param detail.context The request instance that triggered the event.
 * @param detail.message The error message to present to the user.
 * @returns The custom event that can be dispatched.
 */
export const ajaxErrorMessage = (detail: { context: WnRequest, message?: string}): CustomEvent => new CustomEvent('ajaxErrorMessage', { bubbles: true,  detail });

/**
 * This is useful for implementing custom confirm logic/interface instead of native javascript confirm box.
 * 
 * @event Request#ajaxConfirmMessage Triggered on the window object when the `confirm` option is given.
 * @param detail         Additional data to pass to the event handler.
 * @param detail.context The request instance that triggered the event.
 * @param detail.message The confirmation message to present to the user.
 * @returns The custom event that can be dispatched.
 */
export const ajaxConfirmMessage = (detail: {context: WnRequest, message?: string}): CustomEvent => new CustomEvent('ajaxConfirmMessage', { bubbles: true,  detail });

/**
 * 
 * 
 * The handler gets 3 parameters: the context, message, and fields.
 * 
 * @event Request#ajaxValidation Triggered on the form when the server returns validation errors.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxValidation = (detail: { context: WnRequest, message?: string, fields?: {[name: string]: Array<string>} }): CustomEvent => new CustomEvent('ajaxValidation', { bubbles: true,  detail });

/**
 * The handler gets 4 parameters: The element, the field name, the validation messages, and a boolean flag if this field is the first invalid one.
 * 
 * @event Request#ajaxInvalidField Triggered form field that have validation errors.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxInvalidField = (detail: { fieldElement: HTMLElement, arrayName: string, fieldMessages: Array<string>, isFirstInvalidField: boolean }): CustomEvent => new CustomEvent('ajaxInvalidField', { bubbles: true,  detail });

/**
 * Indicates that the AJAX request is finished if we're still on the current page so that the loading indicator for redirects
 * that just change the hash value of the URL (instead of leaving the page) will properly stop.
 * 
 * See {@link https://github.com/octobercms/october/issues/2780}.
 * 
 * @event Request#ajaxRedirected 
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxRedirected = (detail?: any): CustomEvent => new CustomEvent('ajRedirectedld', { bubbles: true,  detail });

/**
 * @event Request#ajaxBeforeReplace Triggered on an element before the contents is replaced with a partial from the server.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxBeforeReplace = (detail?: any): CustomEvent => new CustomEvent('ajBeforeReplaceld', { bubbles: true,  detail });

/*
 * These events are fired on the triggering element:
 */


/**
 * @event Request#ajaxSetup  Triggered before the request is formed, allowing options to be modified via the `context.options` object.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxSetup = (detail: { context: WnRequest }): CustomEvent => new CustomEvent('ajaxSetup', { bubbles: true,  detail });

/**
 * @event Request#ajaxPromise Triggered directly before the AJAX request is sent.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxPromise = (detail: {context: WnRequest}): CustomEvent => new CustomEvent('ajaxPromise', { bubbles: true,  detail });

/**
 * @event Request#ajaxDone Triggered finally if the AJAX request fails.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxDone = (detail: { context: WnRequest, response: AxiosResponse }): CustomEvent => new CustomEvent('ajaxDone', { bubbles: true,  detail });

/**
 * @event Request#ajaxFail Triggered finally if the AJAX request was successful.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxFail = (detail: {context: WnRequest, error: AxiosError}): CustomEvent => new CustomEvent('ajaxFail', { bubbles: true,  detail });

/**
 * @event Request#ajaxAlways Triggered regardless if the AJAX request fails or was successful.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxAlways = (detail: { context: WnRequest, response?: AxiosResponse, error?: AxiosError}): CustomEvent => new CustomEvent('ajaxAlways', { bubbles: true,  detail });

/*
 * JavaScript Events
 */
export const wnBeforeRequest = (detail?: any): CustomEvent => new CustomEvent('wn.beforeRequest', { bubbles: true, detail });
export const wnAfterRequest = (detail?: any): CustomEvent => new CustomEvent('wn.afterRequest', { bubbles: true, detail });
