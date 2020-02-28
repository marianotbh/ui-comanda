import { Router, Redirect, block } from "core";
import {
	DashboardController,
	LoginController,
	TablesController,
	OrdersController,
	UsersController,
	ProfileController,
	SettingsController,
	ReviewsController,
	MenuController
} from "./views";
import {
	AuthResolver,
	NavigationResolver,
	ActionsResolver,
	PrefetchResolver,
	ProfileResolver
} from "./resolvers";
import { Session } from "./session";

const main = document.querySelector<HTMLElement>("#root");

const router = new Router(main);

const from = (name: string) => require(`./views/${name}.html`);

router.use(AuthResolver);
router.use(PrefetchResolver);
router.use(new ActionsResolver({ exceptOn: ["login", "profile", "settings", "403", "404"] }));
router.use(NavigationResolver);

router
	.add("dashboard", {
		path: "/",
		controller: DashboardController,
		template: from("dashboard")
	})
	.add("login", {
		path: "/login",
		controller: LoginController,
		template: from("login"),
		resolver: false
	})
	.add("users", {
		path: "/users",
		controller: UsersController,
		template: from("users")
	})
	.add("orders", {
		path: "/orders",
		controller: OrdersController,
		template: from("orders")
	})
	.add("tables", {
		path: "/tables",
		controller: TablesController,
		template: from("tables")
	})
	.add("menu", {
		path: "/menu",
		controller: MenuController,
		template: from("menu")
	})
	.add("reviews", {
		path: "/reviews",
		controller: ReviewsController,
		template: from("reviews")
	})
	.add("profile", {
		path: "/profile/{username}",
		controller: ProfileController,
		template: from("profile"),
		resolver: ProfileResolver
	})
	.add("settings", {
		path: "/settings",
		controller: SettingsController,
		template: from("settings")
	})
	.add("403", {
		path: "/403",
		template: from("not-authorized")
	})
	.add("404", {
		path: "/404",
		template: from("not-found")
	});

if (Session.isAdmin() || Session.isManager()) {
	router.add("reviews", {
		path: "/reviews",
		controller: ReviewsController,
		template: from("reviews")
	});
}

router.onChange = () => {
	block(main, "Loading...");
	return new Promise(resolve => {
		$(main).fadeOut(200, () => resolve());
	});
};

router.onReady = () => {
	return new Promise(resolve => {
		$(main).fadeIn(300, () => {
			$(main).unblock();
			resolve();
		});
	});
};

router.onBypassed = () => {
	return Redirect.to("404");
};

router.onRejected = () => {
	return Redirect.to("403");
};

export default router;
