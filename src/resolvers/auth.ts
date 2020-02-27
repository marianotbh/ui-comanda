import { Resolver, Redirect } from "core";
import { Session } from "src/session";
import { User } from "src/classes";

export class AuthResolver extends Resolver {
	async resolve(): Promise<{ user: User } | void> {
		if (Session.online) {
			return Promise.resolve({ user: Session.get().payload });
		} else {
			return Redirect.to("login");
		}
	}
}
