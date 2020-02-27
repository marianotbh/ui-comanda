import { Resolver, Reject } from "core";
import { Session } from "src/session";

export class ProfileResolver extends Resolver {
	async resolve({ username }): Promise<void | object> {
		if (Session.get().payload.name !== username && !(Session.isAdmin() || Session.isManager())) {
			return Reject.because("Unauthorized");
		}
	}
}
