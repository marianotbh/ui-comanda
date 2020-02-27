import { Controller } from "core";

export class ProfileController extends Controller {
	private username: string;

	constructor({ username }) {
		super();
		this.username = username;
	}

	async onInit() {}
}
