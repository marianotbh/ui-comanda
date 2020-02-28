import { Controller } from "core";
import { User } from "src/classes";
import { Session } from "src/session";

export class ProfileController extends Controller {
	private user: User;

	constructor({ profile }) {
		super();
		this.user = profile;
	}

	async onInit() {
		if (this.user) {
			const name = $("#name-placeholder");
			if (Session.get().payload.id == this.user.id) {
				name.text("My ");
			} else {
				name.text(`${this.user.name}'s `);
			}
		}
	}
}
