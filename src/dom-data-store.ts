/* eslint-disable @typescript-eslint/ban-types */

export type DOMDataStoreInit<K, V> = readonly [K, V][];

export class DOMDataStore<K extends object = object, V = any> {
	private _init: DOMDataStoreInit<K, V>;
	private _storage: WeakMap<K, V>;

	constructor(init?: DOMDataStoreInit<K, V>) {
		this._init = init;
		this._storage = new WeakMap<K, V>(init);
	}

	clear(): void {
		this._storage = new WeakMap<K, V>(this._init);
	}

	delete(k: K): boolean {
		return this._storage.delete(k);
	}

	get(k: K, key?: string): V {
		if (key) {
			return this._storage.get(k)[key];
		}

		return this._storage.get(k);
	}

	has(k: K): boolean {
		return this._storage.has(k);
	}

	set(k: K, v: V, key?: string): DOMDataStore<K, V> {
		if (key) {
			this._storage.set(k, {...this.get(k, key), ...v});
		} else {
			this._storage.set(k, v);
		}
		return this;
	}
}

declare global {
	interface Window {
		wn?: {
			dataStore?: DOMDataStore<Node>,
		},
	}
}

(() => {
	window.wn = {};
	window.wn.dataStore = new DOMDataStore<Node>();
})();