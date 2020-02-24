import { Resolver, Redirect } from "core";
import { Session } from "src/session";

export class AuthResolver implements Resolver {
	async resolve(): Promise<object> {
		if (Session.online) {
			return Promise.resolve({ user: (await Session.get()).payload });
		} else {
			return Redirect.to("/login");
		}
	}
}
