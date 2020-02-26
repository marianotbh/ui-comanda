import { Resolver } from "core";
import { Session } from "src/session";
import { withClass } from "src/elements/bootstrap/utils";

export class NavigationResolver extends Resolver {
	async resolve(): Promise<object> {
		const navbar = $("#navbar");
		if (Session.online) {
			if (navbar.find(".dropdown") != null) {
				navbar.find(".navbar-nav").html(`
					<li class="nav-item dropdown">
						<a
							class="nav-link d-flex align-items-center"
							href="#"
							id="dropdown"
							role="button"
							data-toggle="dropdown"
							aria-haspopup="true"
							aria-expanded="false"
						>
							<b style="font-size:1.25rem">${Session.get().payload.name.toLowerCase()}</b>	
							<i class="fas fa-user-circle ml-2" style="font-size:1.75rem" aria-hidden="true"></i>
							<i class="fa fa-chevron-down ml-2" style="font-size:1rem" aria-hidden="true"></i>
						</a>
						<div class="dropdown-menu position-absolute dropdown-menu-right" aria-labelledby="dropdown"></div>
					</li>
				`);
				navbar.find(".dropdown-menu").append(
					createAction("Profile", () => (location.hash = "profile")),
					createAction("Settings", () => (location.hash = "settings")),
					withClass("dropdown-divider")(document.createElement("div")),
					createAction("Logout", () => {
						Session.end();
						location.reload();
					})
				);
			}
		} else {
			navbar.find(".navbar-nav").html(`
				<a class="nav-link" href="#login">Login</a>
			`);
		}
		return Promise.resolve({});
	}
}

const createAction = (text: string, action: (this: GlobalEventHandlers, ev: MouseEvent) => any) => {
	const btn = document.createElement("button");
	btn.className = "dropdown-item";
	btn.textContent = text;
	btn.onclick = action;
	return btn;
};
