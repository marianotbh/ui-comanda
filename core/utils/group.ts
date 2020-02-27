export const group = <T = any, K = any>(arr: T[], callback: (obj: T) => K) => {
	return arr.reduce((map: Map<K, T[]>, item: T) => {
		const key = callback(item);
		const collection = map.get(key);
		if (!collection) {
			map.set(key, Array.of(item));
		} else {
			collection.push(item);
		}
		return map;
	}, new Map<K, T[]>());
};
