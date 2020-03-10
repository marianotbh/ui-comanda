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

const main = document.getElementById("root");

const router = new Router(main);

const resolve = (name: string) => ({
	template: require(`./views/${name}.html`)
});

router.use(AuthResolver);
router.use(PrefetchResolver);
router.use(new ActionsResolver({ exceptOn: ["login", "profile", "settings", "403", "404"] }));
router.use(NavigationResolver);

router
	.add("dashboard", {
		path: "/",
		controller: DashboardController,
		...resolve("dashboard")
	})
	.add("login", {
		path: "/login",
		controller: LoginController,
		...resolve("login"),
		resolver: false
	})
	.add("users", {
		path: "/users",
		controller: UsersController,
		...resolve("users")
	})
	.add("orders", {
		path: "/orders",
		controller: OrdersController,
		...resolve("orders")
	})
	.add("tables", {
		path: "/tables",
		controller: TablesController,
		...resolve("tables")
	})
	.add("menu", {
		path: "/menu",
		controller: MenuController,
		...resolve("menu")
	})
	.add("reviews", {
		path: "/reviews",
		controller: ReviewsController,
		...resolve("reviews")
	})
	.add("profile", {
		path: "/profile/{username}",
		controller: ProfileController,
		...resolve("profile"),
		resolver: ProfileResolver
	})
	.add("settings", {
		path: "/settings",
		controller: SettingsController,
		...resolve("settings")
	})
	.add("403", {
		path: "/403",
		...resolve("not-authorized")
	})
	.add("404", {
		path: "/404",
		...resolve("not-found")
	});

if (Session.isAdmin() || Session.isManager()) {
	router.add("reviews", {
		path: "/reviews",
		controller: ReviewsController,
		...resolve("reviews")
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
