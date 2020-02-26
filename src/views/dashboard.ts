import { Controller } from "core";
import { User } from "src/classes/user";
import api from "../provider";

export class DashboardController extends Controller {
	private currentUser: User;

	constructor() {
		super();
	}

	async onInit() {
		const { data, total } = await api.list<User>("users", {
			pagination: { length: 10, page: 1 },
			sort: { field: "createdAt", order: "ASC" }
		});
	}
}
