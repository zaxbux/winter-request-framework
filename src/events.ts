import { AxiosError, AxiosResponse } from 'axios';
import { WinterRequestFrameworkBase, WinterRequestResponseData } from './request/base';

/**
 * @event WinterRequestFrameworkBase#ajaxBeforeSend Triggered on the window object before sending the request.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxBeforeSend = (detail: {context: WinterRequestFrameworkBase}): CustomEvent => new CustomEvent('ajaxBeforeSend', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event WinterRequestFrameworkBase#ajaxBeforeUpdate  Triggered on the form object directly after the request is complete, but before the page is updated.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxBeforeUpdate = (detail: {context: WinterRequestFrameworkBase, response: AxiosResponse}): CustomEvent => new CustomEvent('ajaxBeforeUpdate', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event WinterRequestFrameworkBase#ajaxUpdate Triggered on an element after it has been updated with the framework.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxUpdate = (detail: { context: WinterRequestFrameworkBase, data: any }): CustomEvent => new CustomEvent('ajaxUpdate', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event WinterRequestFrameworkBase#ajaxUpdateComplete Triggered on the window object after all elements are updated by the framework.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxUpdateComplete = (detail: { context: WinterRequestFrameworkBase, data: WinterRequestResponseData }): CustomEvent => new CustomEvent('ajaxUpdateComplete', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event WinterRequestFrameworkBase#ajaxSuccess  Triggered on the form object after the request is successfully completed.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxSuccess = (detail: { context: WinterRequestFrameworkBase, data: WinterRequestResponseData }): CustomEvent => new CustomEvent('ajaxSuccess', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event WinterRequestFrameworkBase#ajaxComplete Triggered when the request is completed successfully or encounters an error.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxComplete = (detail: { context: WinterRequestFrameworkBase, response?: AxiosResponse<WinterRequestResponseData>, error?: AxiosError<WinterRequestResponseData> }): CustomEvent => new CustomEvent('ajaxComplete', { bubbles: true,  detail });

/**
 * The handler gets 5 parameters: the event object, the context object, the data object received from the server, the status text string, and the jqXHR object.
 * 
 * @event WinterRequestFrameworkBase#ajaxError Triggered on the form object if the request encounters an error
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxError = (detail: { context: WinterRequestFrameworkBase, error?: AxiosError<WinterRequestResponseData> }): CustomEvent => new CustomEvent('ajaxError', { bubbles: true,  detail });

/**
 * Display an error message to the user.
 * 
 * This is useful for implementing custom alert logic/interface instead of native javascript alert box.
 * 
 * @event WinterRequestFrameworkBase#ajaxErrorMessage Triggered on the window object if the request encounters an error.
 * @param detail Additional data to pass to the event handler.
 * @param detail.context The request instance that triggered the event.
 * @param detail.message The error message to present to the user.
 * @returns The custom event that can be dispatched.
 */
export const ajaxErrorMessage = (detail: { context: WinterRequestFrameworkBase, message?: string}): CustomEvent => new CustomEvent('ajaxErrorMessage', { bubbles: true,  detail });

/**
 * This is useful for implementing custom confirm logic/interface instead of native javascript confirm box.
 * 
 * @event WinterRequestFrameworkBase#ajaxConfirmMessage Triggered on the window object when the `confirm` option is given.
 * @param detail         Additional data to pass to the event handler.
 * @param detail.context The request instance that triggered the event.
 * @param detail.message The confirmation message to present to the user.
 * @returns The custom event that can be dispatched.
 */
export const ajaxConfirmMessage = (detail: {context: WinterRequestFrameworkBase, message?: string}): CustomEvent => new CustomEvent('ajaxConfirmMessage', { bubbles: true,  detail });

/**
 * 
 * 
 * The handler gets 3 parameters: the context, message, and fields.
 * 
 * @event WinterRequestFrameworkBase#ajaxValidation Triggered on the form when the server returns validation errors.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxValidation = (detail: { context: WinterRequestFrameworkBase, message?: string, fields?: {[name: string]: Array<string>} }): CustomEvent => new CustomEvent('ajaxValidation', { bubbles: true,  detail });

/**
 * The handler gets 4 parameters: The element, the field name, the validation messages, and a boolean flag if this field is the first invalid one.
 * 
 * @event WinterRequestFrameworkBase#ajaxInvalidField Triggered form field that have validation errors.
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
 * @event WinterRequestFrameworkBase#ajaxRedirected 
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxRedirected = <T = any>(detail?: T): CustomEvent => new CustomEvent('ajaxRedirected', { bubbles: true,  detail });

/**
 * @event WinterRequestFrameworkBase#ajaxBeforeReplace Triggered on an element before the contents is replaced with a partial from the server.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxBeforeReplace = <T = any>(detail?: T): CustomEvent => new CustomEvent('ajaxBeforeReplace', { bubbles: true,  detail });

/*
 * These events are fired on the triggering element:
 */


/**
 * @event WinterRequestFrameworkBase#ajaxSetup  Triggered before the request is formed, allowing options to be modified via the `context.options` object.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxSetup = (detail: { context: WinterRequestFrameworkBase }): CustomEvent => new CustomEvent('ajaxSetup', { bubbles: true,  detail });

/**
 * @event WinterRequestFrameworkBase#ajaxPromise Triggered directly before the AJAX request is sent.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxPromise = (detail: {context: WinterRequestFrameworkBase}): CustomEvent => new CustomEvent('ajaxPromise', { bubbles: true,  detail });

/**
 * @event WinterRequestFrameworkBase#ajaxDone Triggered finally if the AJAX request fails.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxDone = (detail: { context: WinterRequestFrameworkBase, response: AxiosResponse }): CustomEvent => new CustomEvent('ajaxDone', { bubbles: true,  detail });

/**
 * @event WinterRequestFrameworkBase#ajaxFail Triggered finally if the AJAX request was successful.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxFail = (detail: {context: WinterRequestFrameworkBase, error: AxiosError}): CustomEvent => new CustomEvent('ajaxFail', { bubbles: true,  detail });

/**
 * @event WinterRequestFrameworkBase#ajaxAlways Triggered regardless if the AJAX request fails or was successful.
 * @param detail Additional data to pass to the event handler.
 * @returns The custom event that can be dispatched.
 */
export const ajaxAlways = (detail: { context: WinterRequestFrameworkBase, response?: AxiosResponse, error?: AxiosError}): CustomEvent => new CustomEvent('ajaxAlways', { bubbles: true,  detail });

/*
 * JavaScript Events
 */
export const wnBeforeRequest = <T = any>(detail?: T): CustomEvent => new CustomEvent('wn.beforeRequest', { bubbles: true, detail });
export const wnAfterRequest = <T = any>(detail?: T): CustomEvent => new CustomEvent('wn.afterRequest', { bubbles: true, detail });
