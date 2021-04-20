/* eslint-disable @typescript-eslint/ban-types */

/**
 * Stores data associated to a object (usually a DOM Node), using a global WeakMap.
 */
export class DataStore<O extends object = object, K = any, V = any> {
	private static instance: DataStore;
	private _storage: WeakMap<O, Map<K, V>>;

	constructor() {
		if (!DataStore.instance) {
			this._storage = new WeakMap<O, Map<K, V>>();
			DataStore.instance = this;
		}

		return DataStore.instance;
	}

	/**
	 * Erase storage
	 */
	clear(): void {
		this._storage = new WeakMap<O, Map<K, V>>();
	}

	/**
	 * Removes a key and value from storage.
	 * 
	 * @param o The object.
	 * @param k The key.
	 * @returns True if deleted.
	 */
	remove(o: O, k: K): boolean {
		if (!this._storage.has(o)) {
			return false;
		}

		const r = this._storage.get(o).delete(k);

		if (this._storage.get(o).size === 0) {
			this._storage.delete(o);
		}

		return r;
	}

	/**
	 * Gets a value for a Node from storage with the specified key.
	 * 
	 * @param o The object.
	 * @param k The key.
	 * @returns The value.
	 */
	get(o: O, k: K): V {
		return this._storage.get(o).get(k);
	}

	/**
	 * Checks if the object has an associated key.
	 * 
	 * @param o The object.
	 * @param k The key.
	 * @returns True if the value exists.
	 */
	has(o: O, k?: K): boolean {
		return this._storage.get(o) && k && this._storage.get(o).has(k);
	}

	/**
	 * Stores a value associated to an object with a key.
	 * 
	 * @param o The object.
	 * @param k The key.
	 * @param v The value.
	 * @returns This instance.
	 */
	put(o: O, k: K, v: V): DataStore<O> {
		if (!this._storage.has(o)) {
			this._storage.set(o, new Map<K, V>());
		}

		this._storage.get(o).set(k, v);
		return this;
	}
}

const instance = new DataStore<EventTarget, string>();
Object.freeze(instance);

export default instance;