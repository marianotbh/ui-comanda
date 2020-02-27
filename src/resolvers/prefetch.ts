import { Resolver } from "core";
import api from "../provider";

export class PrefetchResolver extends Resolver {
	async resolve(): Promise<void> {
		if (
			!("roles" in localStorage) ||
			!("orderStates" in localStorage) ||
			!("tableStates" in localStorage)
		) {
			const [{ data: roles }, { data: orderStates }, { data: tableStates }] = await Promise.all([
				api.list("auth/roles"),
				api.list("orders/states"),
				api.list("tables/states")
			]);
			localStorage.setItem("roles", JSON.stringify(roles));
			localStorage.setItem("orderStates", JSON.stringify(orderStates));
			localStorage.setItem("tableStates", JSON.stringify(tableStates));
		}
	}
}
