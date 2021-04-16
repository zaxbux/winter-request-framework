/* eslint-disable @typescript-eslint/ban-types */

export type DOMDataStoreInit<K, V> = readonly [K, V][];

export class DOMDataStore<K extends object = object, V = any> {
	private static instance: DOMDataStore;
	private _storage: WeakMap<K, V>;

	constructor(init?: DOMDataStoreInit<K, V>) {
		if (!DOMDataStore.instance) {
			this._storage = new WeakMap<K, V>(init);
			DOMDataStore.instance = this;
		}

		return DOMDataStore.instance;
	}

	clear(): void {
		this._storage = new WeakMap<K, V>();
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
			this._storage.set(k, { ...this.get(k, key), ...v });
		} else {
			this._storage.set(k, v);
		}
		return this;
	}
}

const instance = new DOMDataStore<Node>();
Object.freeze(instance);

export default instance;