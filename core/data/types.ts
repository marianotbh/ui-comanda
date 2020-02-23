declare type ID = string | number;
declare type Order = "ASC" | "DESC";

declare interface IProvider {
	get<T>(resource: string, id: ID): Promise<T>;
	list<T>(resource: string, params?: ListOptions): Promise<ListResponse<T>>;
	post<T>(resource: string, data: object): Promise<T>;
	put<T>(resource: string, id: ID, data: object): Promise<T>;
	patch<T>(resource: string, id: ID, data: object): Promise<T>;
	delete<T>(resource: string, id: ID): Promise<T>;
}

declare interface ListResponse<T> {
	data: Array<T>;
	total: number;
}

declare interface ListOptions {
	pagination?: PaginationsOptions;
	sort?: SortOptions;
}

declare interface PaginationsOptions {
	page?: number;
	length?: number;
}

declare interface SortOptions {
	field?: string;
	order?: Order;
}
