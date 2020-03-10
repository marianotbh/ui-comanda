import { Resolver, Redirect } from "core";
import { AppSession } from "src/session";
import { User } from "src/classes";
import api from "../provider";

export class AuthResolver extends Resolver {
	async resolve(): Promise<{ user: User }> {
		if (AppSession.online) {
			try {
				await api.get("auth", "status");
			} catch (error) {
				return Redirect.to("login");
			}
		} else {
			return Redirect.to("login");
		}
	}
}
