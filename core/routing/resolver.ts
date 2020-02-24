export interface Resolver<T = any> {
	resolve(params?: T): Promise<object>;
}
