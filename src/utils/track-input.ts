import DataStore from './data-store';
import { Request } from '../request';

export function trackInput(interval = 300): void {
	const documentOnKeydown = 'input[type=text][data-request], input[type=submit][data-request], input[type=password][data-request]';

	document.addEventListener('keydown', (ev) => {
		if (ev.key === 'Enter' && ev.target instanceof HTMLElement && ev.target.matches(documentOnKeydown)) {

			if (DataStore.has(document, 'track_input_timer')) {
				window.clearTimeout(DataStore.get(document, 'track_input_timer'));
				DataStore.remove(document, 'track_input_timer');
			}

			Request.instance({ element: ev.target });
			ev.preventDefault();
			ev.stopPropagation();
		}
	});

	const documentOnKeyup = 'input[data-request][data-track-input]';

	document.addEventListener('keyup', (ev) => {
		if (ev.target instanceof HTMLInputElement && ev.target.matches(documentOnKeyup)) {
			// Don't track inputs that we don't care about
			if (!ev.target.matches('[type=email], [type=number], [type=password], [type=search], [type=text]')) {
				return;
			}

			// Short-circuit if there's no value change
			const lastValue = DataStore.get(ev.target, 'track_input_last_value');
			if (lastValue !== undefined && lastValue == this.value) {
				return;
			}

			DataStore.put(ev.target, 'track_input_last_value', ev.target.value);

			if (DataStore.has(document, 'track_input_timer')) {
				window.clearTimeout(DataStore.get(document, 'track_input_timer'));
				DataStore.remove(document, 'track_input_timer');
			}

			const target = ev.target;

			DataStore.put(ev.currentTarget, 'track_input_timer', window.setTimeout(() => {
				let lastDataTrackInputRequest: Request = DataStore.get(ev.currentTarget, 'track_input_last_request');

				if (lastDataTrackInputRequest) {
					lastDataTrackInputRequest.cancel();
				}

				lastDataTrackInputRequest = Request.instance({element: target});
				DataStore.put(ev.currentTarget, 'track_input_last_request', lastDataTrackInputRequest);
				lastDataTrackInputRequest.send();

			}, interval));
		}
	});
}