import { RestProvider } from "core";
import { url } from "./api";

const httpClient = <T>(url: string, { method = "GET", body = "", ...rest } = {}) => {
	return new Promise<{ json: T; headers: Headers }>((resolve, reject) => {
		$.ajax({
			url,
			method,
			...(body
				? {
						data: typeof body === "string" ? JSON.parse(body) : body
				  }
				: null),
			beforeSend: req => {
				if ("token" in localStorage) {
					req.setRequestHeader("Authorization", `Bearer ${localStorage.token}`);
				}
			},
			...rest
		})
			.done((json: T, status: string, jqXHR: JQuery.jqXHR) => {
				console.info(`[${method}] ${url} - ${status.toUpperCase()}`, json);
				resolve({
					json,
					headers: getParsedHeaders(jqXHR)
				});
			})
			.fail((jqXHR: JQuery.jqXHR, status: string) => {
				console.info(`[${method}] ${url} - ${status.toUpperCase()}`, jqXHR.statusText);
				reject({ message: jqXHR.statusText });
			});
	});
};

export default new RestProvider(url, httpClient);

const getParsedHeaders = (jqXHR: JQuery.jqXHR): Headers => {
	return jqXHR
		.getAllResponseHeaders()
		.split("\n")
		.filter(Boolean)
		.reduce((headers, header) => {
			const [name, value] = header.split(":").map(x => x.trim());
			headers.set(name, value);
			return headers;
		}, new Headers());
};
