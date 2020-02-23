import { querify } from "core/utils";

interface IResponse<T> {
	headers: Headers;
	json: T;
}

interface IClient {
	<T>(url: string, options: object): Promise<IResponse<T>>;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELTE";

interface IOptions {
	body?: string;
	method?: Method;
	timeout?: number;
	headers?: Headers;
}

export class RestProvider implements IProvider {
	private endpoint: string;
	private client: IClient;

	constructor(endpoint: string, client: IClient) {
		this.endpoint = endpoint;
		this.client = client;
	}

	get<T>(resource: string, id: ID, options: IOptions = {}): Promise<T> {
		const url = `${this.endpoint}/${resource}/${id}`;
		return this.client<T>(url, options).then(({ json }) => json);
	}

	list<T = any>(
		resource: string,
		listOptions: ListOptions = {},
		options: IOptions = {}
	): Promise<ListResponse<T>> {
		const { pagination = {}, sort = {} } = listOptions;
		const { page, length } = pagination;
		const { field, order } = sort;

		const query = querify({
			page,
			length,
			field,
			order
		});

		const url = `${this.endpoint}/${resource}` + (query ? `?${query}` : "");

		return this.client<Array<T>>(url, options).then(({ headers, json }) => {
			return {
				data: { ...json },
				total: headers.has("content-range")
					? parseInt(
							headers
								.get("content-range")
								.split("/")
								.pop(),
							10
					  )
					: 0
			};
		});
	}

	post<T>(resource: string, data: object, options: IOptions = {}): Promise<T> {
		const url = `${this.endpoint}/${resource}`;
		return this.client<T>(url, {
			method: "POST",
			body: JSON.stringify(data)
		}).then(({ json }) => ({ ...json }));
	}

	put<T>(resource: string, id: ID, data: object, options: IOptions = {}): Promise<T> {
		const url = `${this.endpoint}/${resource}/${id}`;
		return this.client<T>(url, {
			method: "PUT",
			body: JSON.stringify(data)
		}).then(({ json }) => ({ ...json }));
	}

	patch<T>(resource: string, id: ID, data: object, options: IOptions = {}): Promise<T> {
		const url = `${this.endpoint}/${resource}/${id}`;
		return this.client<T>(url, {
			method: "PATCH",
			body: JSON.stringify(data)
		}).then(({ json }) => ({ ...json }));
	}

	delete<T>(resource: string, id: ID, options: IOptions = {}): Promise<T> {
		const url = `${this.endpoint}/${resource}/${id}`;
		return this.client<T>(url, {
			method: "DELETE"
		}).then(({ json }) => ({ ...json }));
	}
}
