/* eslint-disable @typescript-eslint/ban-types */

export class DOMDataStore<K extends object = object, V = any, T = any> {
	private static instance: DOMDataStore;
	private _storage: WeakMap<K, Map<V, T>>;

	constructor() {
		if (!DOMDataStore.instance) {
			this._storage = new WeakMap<K, Map<V, T>>();
			DOMDataStore.instance = this;
		}

		return DOMDataStore.instance;
	}

	clear(): void {
		this._storage = new WeakMap<K, Map<V, T>>();
	}

	remove(k: K, v: V): boolean {
		if (!this._storage.has(k)) {
			return false;
		}

		const r = this._storage.get(k).delete(v);

		if (this._storage.get(k).size === 0) {
			this._storage.delete(k);
		}

		return r;
	}

	get(k: K, v: V): T {
		return this._storage.get(k).get(v);
	}

	has(k: K, v: V): boolean {
		return this._storage.get(k) && this._storage.get(k).has(v);
	}

	put(k: K, key: V, v: T): DOMDataStore<K> {
		if (!this._storage.has(k)) {
			this._storage.set(k, new Map<V, T>());
		}

		this._storage.get(k).set(key, v);
		return this;
	}
}

const instance = new DOMDataStore<Node, string>();
Object.freeze(instance);

export default instance;