import { Resolver } from "core";
import { Session } from "src/session";
import router from "../routing";

const cleanHash = () => {
	const hash = location.hash.replace(/[\#]/g, "");
	return hash.charAt(0) === "/" ? hash.substr(1) : hash;
};

interface ActionsResolverOptions {
	onlyOn?: string[];
	exceptOn?: string[];
}

export class ActionsResolver extends Resolver {
	private checkedRoutes: string[];
	private exceptedRoutes: string[];

	constructor({ onlyOn = [], exceptOn = [] }: ActionsResolverOptions = {}) {
		super();
		this.checkedRoutes = onlyOn;
		this.exceptedRoutes = exceptOn;
	}

	async resolve(): Promise<object> {
		const current = cleanHash();
		return new Promise(async resolve => {
			const sidebar = $("#sidebar");
			if (Session.online && this.shouldShow(current)) {
				if (!sidebar.html().length) {
					if (Session.isAdmin() || Session.isManager()) {
						sidebar.append(createAction("📊 Dashboard", "/"));
					}

					sidebar.append(
						createAction("🙋‍♂️ Orders", "/orders"),
						createAction("🍽️ Tables", "/tables"),
						createAction("🍲 Menu", "/menu")
					);

					if (Session.isAdmin() || Session.isManager()) {
						sidebar.append(
							createAction("👥 Users", "/users"),
							createAction("📝 Reviews", "/reviews")
						);
					}
				}

				const actions = [...sidebar.find(".sidebar-action")];

				for (const action of actions) {
					if (action.classList.contains("active")) {
						action.classList.remove("active");
					}
				}

				const match = router.find(location.hash);
				if (match) {
					const [, route] = match;
					const active = actions.find(a => route.matches(a.getAttribute("data-route")));
					active.classList.add("active");
				}

				sidebar.show();
			} else {
				sidebar.hide();
				sidebar.html(null);
			}

			resolve();
		});
	}

	private shouldShow(currentHash: string) {
		const [name] = router.find(currentHash) ?? [];
		return this.checkedRoutes.length || this.exceptedRoutes.length
			? (this.checkedRoutes.length && this.checkedRoutes.indexOf(name) !== -1) ||
					(this.exceptedRoutes.length && this.exceptedRoutes.indexOf(name) === -1)
			: true;
	}
}

const createAction = (text: string, route: string) => {
	const action = document.createElement("button");
	action.textContent = text;
	action.className = "sidebar-action";
	action.setAttribute("data-route", route);
	action.onclick = () => (location.hash = route);
	return action;
};
