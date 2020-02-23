export const url = (() => {
	switch (process.env.NODE_ENV) {
		case "development":
			return "http://localhost:5000/api";
		case "production":
			return "http://localhost:5000/api";
		default:
			return "http://localhost:5000/api";
	}
})();
