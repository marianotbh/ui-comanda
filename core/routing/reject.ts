export class Reject {
	constructor(public reason: string) {}

	static because(reason: string = "") {
		return Promise.reject(new Reject(reason));
	}
}
