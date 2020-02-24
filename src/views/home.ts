import { Controller } from "core";
import { modal, createNavbar } from "src/elements/bootstrap";
import { User } from "src/classes/user";
import api from "../provider";

export class HomeController extends Controller {
	private currentUser: User;

	constructor({ user }) {
		super();
		this.currentUser = user;
	}

	async onInit() {
		const navbar = createNavbar("La Comanda", this.currentUser);

		const user = await api.get<User>("users", this.currentUser.id);
		const { data, total } = await api.list<User>("users", {
			pagination: { length: 10, page: 1 },
			sort: { field: "createdAt", order: "ASC" }
		});
	}
}

const createUserForm = async (user: User, mode: "read" | "edit" = "read") => {
	const form = document.createElement("form");

	form.innerHTML = `
		<div class="form-group">
			<label>Username</label>
			<input type="text" class="form-control" />
		</div>
	`;

	form.addEventListener("submit", ev => {});

	return form;
};
