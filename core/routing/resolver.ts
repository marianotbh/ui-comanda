export abstract class Resolver<T = any> {
	abstract async resolve(params?: T): Promise<object | void>;
}
