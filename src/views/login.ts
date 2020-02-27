import { Controller } from "core";
import { toaster, setValidity } from "src/elements/bootstrap";
import { block } from "core/utils/block";
import { Session } from "src/session";
import api from "../provider";

export class LoginController extends Controller {
	private form: HTMLFormElement = null;
	private username: HTMLInputElement = null;
	private password: HTMLInputElement = null;
	private remember: HTMLInputElement = null;

	constructor() {
		super();
		this.login = this.login.bind(this);
	}

	async onInit() {
		$("#sidebar").hide();
		this.form = document.querySelector<HTMLFormElement>("#login");
		this.form.addEventListener("submit", this.login, false);
		this.username = document.querySelector<HTMLInputElement>("#username");
		this.password = document.querySelector<HTMLInputElement>("#password");
		this.remember = document.querySelector<HTMLInputElement>("#remember");
	}

	private async login(ev: Event) {
		ev.preventDefault();
		ev.stopPropagation();

		const { username, password, remember } = this;

		if (!username.value) setValidity(username, "This field is required");
		else setValidity(username, true);
		if (!password.value) setValidity(password, "This field is required");
		else setValidity(password, true);

		this.form.classList.replace("needs-validation", "was-validated");

		if (this.form.checkValidity()) {
			const ref = block(this.form);
			api
				.post<{ token: string }>("auth/login", {
					username: username.value,
					password: password.value,
					remember: remember.checked
				})
				.then(async ({ token }) => {
					Session.new(token);
					const { firstName, lastName } = Session.get().payload;
					await toaster(`Welcome back, ${firstName} ${lastName}`, "success");
					location.hash = "/";
				})
				.catch(async ({ message }: { message: string }) => {
					if (message.toLowerCase().includes("username")) setValidity(username, message);
					else if (message.toLowerCase().includes("password")) setValidity(password, message);
					else toaster(message, "danger");
				})
				.finally(() => {
					ref.unblock();
				});
		}
	}

	async onDispose() {
		this.form.removeEventListener("submit", this.login, false);
	}
}
