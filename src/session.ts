import { Session } from "core";

const ADMIN = 1;
const MANAGER = 2;

interface ComandaUser {
	id: number;
	username: string;
	role: number;
}

class ComandaSession extends Session<ComandaUser> {
	isAdmin() {
		return this.getRole() === ADMIN;
	}

	isManager() {
		return this.getRole() === MANAGER;
	}

	getRole() {
		return this.online ? this.current().payload.role : null;
	}
}

const session = new ComandaSession(localStorage, "token");

export { session as AppSession };
