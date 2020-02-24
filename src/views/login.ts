import { Controller } from "core";
import api from "../provider";
import { toaster } from "src/elements/bootstrap";
import { block } from "core/utils/block";
import { Session } from "src/session";

export class LoginController extends Controller {
	private form;

	constructor() {
		super();
		this.login = this.login.bind(this);
	}

	onInit() {
		const form = document.querySelector<HTMLFormElement>("#login");
		form.addEventListener("submit", this.login);
		this.form = form;
	}

	private async login(ev: Event) {
		ev.preventDefault();

		const username = document.querySelector<HTMLInputElement>("#username").value;
		const password = document.querySelector<HTMLInputElement>("#password").value;
		const remember = document.querySelector<HTMLInputElement>("#remember").checked;

		const ref = block(this.form);

		setTimeout(() => {
			api
				.post("login", {
					username,
					password,
					remember
				})
				.then(async ({ token }) => {
					await Session.new(token);
					await toaster("Welcome back, User", "success");
					location.hash = "/";
				})
				.catch(async ({ error }) => {
					await toaster(error, "danger");
				})
				.finally(() => {
					ref.unblock();
				});
		}, 1000);
	}

	onDispose() {
		const form = document.querySelector<HTMLFormElement>("#login");
		form.removeEventListener("submit", this.login);
	}
}
