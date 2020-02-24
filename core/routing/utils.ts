export const normalizePath = (path: string) => {
	var normalized = path;
	if (path.charAt(0) != "/") {
		normalized = `/${path}`;
	}
	if (path.charAt(path.length - 1) == "/") {
		normalized = path.substring(-1, path.length - 1);
	}
	return normalized;
};
