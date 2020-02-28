export const url = (() => {
	switch (process.env.NODE_ENV) {
		case "development":
			return "http://localhost:5000/api";
		case "production":
			return "https://api-comanda.000webhostapp.com";
		default:
			return "http://localhost:5000/api";
	}
})();
