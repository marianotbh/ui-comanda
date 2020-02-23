export const stringify = (obj: object, deep: boolean = false): string => {
	return `${Object.keys(obj)
		.map(k => {
			if (obj.hasOwnProperty(k)) {
				let value = obj[k];
				if (typeof value === "object" && deep) {
					return `${k}: { ${stringify(value)} }`;
				} else {
					return `${k}: ${value}`;
				}
			}
		})
		.join(", ")}`;
};
