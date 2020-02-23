/**
 * Combines an array of objects into a single object
 * @param items
 */
export const mix = (items: object[]): object => {
	return items.reduce((obj, item, idx) => {
		if (typeof item === "object") {
			obj = { ...obj, ...item };
		} else {
			obj[idx] = item;
		}
		return obj;
	}, {});
};
