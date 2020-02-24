export class Redirect {
	constructor(public path: string) {}

	static to(path: string) {
		return Promise.reject(new Redirect(path));
	}
}
