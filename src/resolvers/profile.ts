import { Resolver, Reject, Redirect } from "core";
import { AppSession } from "src/session";
import api from "../provider";
import { User } from "src/classes";

export class ProfileResolver extends Resolver {
	async resolve({ username }): Promise<void | object> {
		if (
			AppSession.current().payload.username === username ||
			AppSession.isAdmin() ||
			AppSession.isManager()
		) {
			const profile = await api.get<User>("users", username);
			if (profile) {
				return {
					profile
				};
			} else {
				return Redirect.to("404");
			}
		} else {
			return Reject.because("Unauthorized");
		}
	}
}
