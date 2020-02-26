export abstract class Resolver<T = any> {
	abstract resolve(params?: T): Promise<object>;
}
