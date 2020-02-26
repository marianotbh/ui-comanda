import { Resolver, Redirect } from "core";
import { Session } from "src/session";

const cleanHash = () => {
	const hash = location.hash.replace(/[\#]/g, "");
	return hash.charAt(0) === "/" ? hash.substr(1) : hash;
};

export class AuthResolver extends Resolver {
	async resolve(): Promise<object> {
		const current = cleanHash();
		if (current != "login") {
			if (Session.online) {
				return Promise.resolve({ user: Session.get().payload });
			} else {
				return Redirect.to("login");
			}
		} else {
			return Promise.resolve({});
		}
	}
}
