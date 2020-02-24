import { Router, Redirect } from "core";
import { HomeController, LoginController } from "./views";
import { AuthResolver } from "./resolvers";

const main = document.querySelector<HTMLElement>("main#root");

const router = new Router(main);

const from = (name: string) => require(`./views/${name}.html`);

router
	.add("home", {
		path: "/",
		controller: HomeController,
		template: from("home"),
		resolver: [AuthResolver]
	})
	.add("login", {
		path: "/login",
		controller: LoginController,
		template: from("login")
	})
	.add("403", {
		path: "/403",
		template: from("not-authorized")
	})
	.add("404", {
		path: "/404",
		template: from("not-found")
	});

router.onBypassed = () => {
	return Redirect.to("404");
};

router.onRejected = () => {
	return Redirect.to("403");
};

export default router;
