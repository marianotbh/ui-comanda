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

	async get<T>(resource: string, id: ID, options: IOptions = {}): Promise<T> {
		const url = `${this.endpoint}/${resource}/${id}`;
		const { json } = await this.client<T>(url, options);
		return json;
	}

	async list<T = any>(
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
		const { headers, json: data } = await this.client<Array<T>>(url, options);
		return {
			data,
			total: headers.has("content-range")
				? parseInt(
						headers
							.get("x-total-count")
							.split("/")
							.pop(),
						10
				  )
				: 0
		};
	}

	async post<T>(resource: string, data: object, options: IOptions = {}): Promise<T> {
		const url = `${this.endpoint}/${resource}`;
		const { json } = await this.client<T>(url, {
			method: "POST",
			body: JSON.stringify(data)
		});
		return { ...json };
	}

	async put<T>(resource: string, id: ID, data: object, options: IOptions = {}): Promise<T> {
		const url = `${this.endpoint}/${resource}/${id}`;
		const { json } = await this.client<T>(url, {
			method: "PUT",
			body: JSON.stringify(data)
		});
		return { ...json };
	}

	async patch<T>(resource: string, id: ID, data: object, options: IOptions = {}): Promise<T> {
		const url = `${this.endpoint}/${resource}/${id}`;
		const { json } = await this.client<T>(url, {
			method: "PATCH",
			body: JSON.stringify(data)
		});
		return { ...json };
	}

	async delete<T>(resource: string, id: ID, options: IOptions = {}): Promise<T> {
		const url = `${this.endpoint}/${resource}/${id}`;
		const { json } = await this.client<T>(url, {
			method: "DELETE"
		});
		return { ...json };
	}
}
