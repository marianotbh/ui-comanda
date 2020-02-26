import { Controller } from "core";
import { User } from "src/classes/user";
import api from "../provider";
import * as moment from "moment";
import "./users.scss";
import { setValidity, toaster } from "src/elements/bootstrap";

var roles = null;

interface Role {
	id: number;
	name: string;
}

export class UsersController extends Controller {
	private roles: Array<Role>;
	private form: HTMLFormElement;
	private modal: HTMLElement;
	private users: Array<User>;

	constructor() {
		super();
		this.save = this.save.bind(this);
	}

	async onInit() {
		this.form = document.querySelector<HTMLFormElement>("#user-form");
		this.form.addEventListener("submit", this.save, false);

		this.modal = document.querySelector<HTMLElement>("#user-modal");
		$(this.modal).on("hidden.bs.modal", () => {
			this.form.reset();
			this.form.classList.replace("was-validated", "needs-validation");
		});

		$("#new-btn").click(this.promptNew);

		$("#user-list").click(ev => {
			const item =
				ev.target && ev.target.matches(".user-item")
					? $(ev.target)
					: $(ev.target).parents(".user-item")?.[0];

			if (item) {
				const id = parseInt($(item).attr("id") as string);
				const user = this.users.find(user => user.id == id);
				if (user) {
					this.promptEdit(user);
				}
			}
		});

		await this.loadRoles();
		await this.listUsers();
	}

	show = () => {
		$(this.modal).modal({
			backdrop: true,
			keyboard: true,
			focus: true,
			show: true
		});
	};

	hide = () => {
		$(this.modal).modal("hide");
	};

	promptNew = () => {
		const form = $(this.form);
		form.find("#username").prop("readonly", false);
		form.find("#password").prop("readonly", false);
		form.find("#password-repeat").prop("readonly", false);
		form.find("#role").removeAttr("disabled");

		$(this.modal)
			.find(".modal-title")
			.text("New user");

		this.show();
	};

	promptEdit = (user: User) => {
		const form = $(this.form);
		form.find("#user-id").val(user.id);
		form
			.find("#username")
			.prop("readonly", true)
			.val(user.name);
		form.find("#password").prop("readonly", true);
		form.find("#password-repeat").prop("readonly", true);
		form.find("#first-name").val(user.firstName);
		form.find("#last-name").val(user.lastName);
		form.find("#email").val(user.email);
		form
			.find("#role")
			.attr("disabled", "true")
			.val(user.role);

		$(this.modal)
			.find(".modal-title")
			.text("Edit user");

		this.show();
	};

	save(ev: Event) {
		ev.preventDefault();
		ev.stopPropagation();

		const id = document.querySelector<HTMLInputElement>("#user-id");
		const username = document.querySelector<HTMLInputElement>("#username");
		const password = document.querySelector<HTMLInputElement>("#password");
		const passwordRepeat = document.querySelector<HTMLInputElement>("#password-repeat");
		const firstName = document.querySelector<HTMLInputElement>("#first-name");
		const lastName = document.querySelector<HTMLInputElement>("#last-name");
		const email = document.querySelector<HTMLInputElement>("#email");
		const role = document.querySelector<HTMLSelectElement>("#role");

		if (!id.value) {
			if (!username.value) setValidity(username, "This field is required");
			else if (username.value.length < 5)
				setValidity(username, "Username must be at least 5 characters long");
			else if (/[^0-9a-zA-Z._-]/g.test(username.value))
				setValidity(username, "Username contains invalid characters");
			else setValidity(username, true);

			if (!password.value) setValidity(password, "This field is required");
			else if (password.value.length < 5)
				setValidity(password, "Username must be at least 5 characters long");
			else setValidity(password, true);

			if (!passwordRepeat.value) setValidity(passwordRepeat, "This field is required");
			else if (passwordRepeat.value.length < 5)
				setValidity(passwordRepeat, "Password must be at least 5 characters long");
			else setValidity(passwordRepeat, true);

			if (password.value != passwordRepeat.value) {
				setValidity(password, "Passwords don't match");
				setValidity(passwordRepeat, "Passwords don't match");
			}
		}

		if (!firstName.value) setValidity(firstName, "This field is required");
		else if (firstName.value.length < 3)
			setValidity(firstName, "First name must be at least 3 characters long");
		else if (/[^a-zA-Z]/g.test(firstName.value))
			setValidity(firstName, "First name contains invalid characters");
		else setValidity(firstName, true);

		if (!lastName.value) setValidity(lastName, "This field is required");
		else if (lastName.value.length < 3)
			setValidity(lastName, "Last name must be at least 3 characters long");
		else if (/[^a-zA-Z]/g.test(lastName.value))
			setValidity(lastName, "Last name contains invalid characters");
		else setValidity(lastName, true);

		if (!email.value) setValidity(email, "This field is required");
		else if (email.value.length < 3) setValidity(email, "Email must be at least 3 characters long");
		else if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g.test(email.value) === false)
			setValidity(email, "Email format is invalid");
		else setValidity(email, true);

		if (!role.value) setValidity(role, "This field is required");
		else if (this.roles.map(x => x.id).indexOf(parseInt(role.value)) === -1)
			setValidity(role, "Value of role is not in the list");
		else setValidity(role, true);

		this.form.classList.replace("needs-validation", "was-validated");

		if (this.form.checkValidity()) {
			if (id.value) {
				api
					.put("users", parseInt(id.value), {
						firstName: firstName.value,
						lastName: lastName.value,
						email: email.value
					})
					.then(async ({ message }) => {
						toaster(message, "success");
						this.listUsers();
						this.hide();
					})
					.catch(({ message }) => {
						toaster(message, "danger");
					});
			} else {
				api
					.post("users", {
						name: username.value.toLowerCase(),
						firstName: firstName.value,
						lastName: lastName.value,
						password: password.value,
						passwordRepeat: passwordRepeat.value,
						email: email.value,
						role: role.value
					})
					.then(async ({ message }) => {
						toaster(message, "success");
						this.listUsers();
						this.hide();
					})
					.catch(({ message }) => {
						toaster(message, "danger");
					});
			}
		} else {
			this.form.addEventListener("change", () => {
				this.form.classList.replace("was-validated", "needs-validation");
			});
		}
	}

	async loadRoles() {
		this.roles = (await api.list<Role>("auth/roles")).data;
		const option = document.createElement("option");
		option.value = "";
		option.textContent = "-- Select an item from the list --";
		$("#role").append(option);
		$("#role").append(
			...this.roles.map(role => {
				const option = document.createElement("option");
				option.value = role.id.toString();
				option.textContent = role.name;
				return option;
			})
		);
	}

	async listUsers() {
		const container = document.querySelector("#user-list");
		container.innerHTML = null;

		return api
			.list<User>("users", {
				pagination: { length: 10, page: 1 },
				sort: { field: "lastLoginAt", order: "DESC" }
			})
			.then(({ data = [], total }) => {
				this.users = data;
				if (this.users.length) {
					container.append(...this.users.map(this.mapUser));
					container.append();
				} else {
					container.innerHTML = `
						<div class="alert alert-warning" role="alert">
							<i class="fas fa-exclamation-triangle mr-2"></i>
							<b>No users found</b>
						</div>
					`;
				}
			});
	}

	private mapUser = (user: User) => {
		const el = document.createElement("div");
		el.id = user.id.toString();
		el.className = "user-item";
		el.style.alignItems = "center";
		el.style.padding = ".5rem";
		el.style.marginTop = ".5rem";
		el.innerHTML = `
            <div class="mr-3"><i class="fas fa-user-circle" style="font-size: 2rem;"></i></div>
            <div>
                <div>
                    <b class="mr-2">${user.name}</b>${this.toBadge(user.role).outerHTML}
                </div>
				<small>${user.lastLoginAt ? moment(user.lastLoginAt).fromNow() : ""}</small>
            </div>
        `;
		return el;
	};

	private toBadge = (role: number) => {
		const badge = document.createElement("span");
		badge.className = "badge";
		badge.textContent = this.roles.find(r => r.id == role)?.name;
		switch (role) {
			case 1:
				badge.classList.add("badge-warning");
				break;
			case 2:
				badge.classList.add("badge-info");
				break;
			default:
				badge.classList.add("badge-secondary");
				break;
		}
		return badge;
	};

	onDispose() {
		this.form.removeEventListener("submit", this.save, false);
	}
}
