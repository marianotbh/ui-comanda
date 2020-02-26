import { Session } from "core";
import { User } from "./classes/user";

const ADMIN = 1;
const MANAGER = 2;

class ComandaSession extends Session<User> {
	isAdmin() {
		return this.getRole() === ADMIN;
	}

	isManager() {
		return this.getRole() === MANAGER;
	}

	getRole() {
		return this.online ? this.get().payload.role : null;
	}
}

const session = new ComandaSession(localStorage, "token");

export { session as Session };
