export const querify = (obj: object): string => {
	return Object.keys(obj)
		.filter(k => Boolean([obj[k]]))
		.map(k => {
			if (typeof obj[k] === "object") {
				return querify(obj[k]);
			} else {
				return `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`;
			}
		})
		.join("&");
};
