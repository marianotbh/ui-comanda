import { Resolver } from "core";
import { Session } from "src/session";

const ex = `
	<a
		class="nav-link"
		id="v-pills-settings-tab"
		data-toggle="pill"
		href="#v-pills-settings"
		role="tab"
		aria-controls="v-pills-settings"
		aria-selected="false"
		>Settings</a
	>
`;

const cleanHash = () => {
	const hash = location.hash.replace(/[\#]/g, "");
	return hash.charAt(0) === "/" ? hash.substr(1) : hash;
};

export class ActionsResolver extends Resolver {
	constructor(private routes: string[] = [], private inCollection: boolean = true) {
		super();
	}

	async resolve(): Promise<object> {
		const current = cleanHash();
		return new Promise(async resolve => {
			const sidebar = $("#sidebar");
			if (Session.online && this.shouldShow(current)) {
				if (!sidebar.html().length) {
					sidebar.append(
						createAction("📊 Dashboard", "#"),
						createAction("🍽️ Tables", "#tables"),
						createAction("🙋‍♂️ Orders", "#orders"),
						createAction("🍲 Menu", "#menu"),
						createAction("👥 Users", "#users")
					);

					if (Session.isAdmin() || Session.isManager()) {
						sidebar.append(
							createAction("🔒 Permissions", "#permissions"),
							createAction("📝 Reviews", "#reviews")
						);
					}
				}

				for (const link of [...sidebar.find(".sidebar-link")]) {
					if (link.classList.contains("active")) {
						link.classList.remove("active");
					}
				}

				sidebar.find(`.sidebar-link[href="#${current}"]`)?.[0]?.classList.add("active");

				sidebar.show();
			} else {
				sidebar.hide();
				sidebar.html(null);
			}

			resolve();
		});
	}

	private shouldShow(currentHash: string) {
		if (this.inCollection) {
			return this.routes.find(x => x === currentHash);
		} else {
			return this.routes.find(x => x === currentHash) === undefined;
		}
	}
}

const createAction = (text: string, href: string) => {
	const a = document.createElement("a");
	a.href = href;
	a.textContent = text;
	a.className = "sidebar-link";
	return a;
};
