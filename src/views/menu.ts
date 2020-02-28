import { Controller, block, group } from "core";
import { setValidity, toaster, modal } from "src/elements/bootstrap";
import { Menu, Role } from "src/classes";
import api from "../provider";
import * as moment from "moment";
import "./menu.scss";
import { Session } from "src/session";

export class MenuController extends Controller {
	private menu: Menu[];
	private roles: Role[];
	private modal: HTMLElement;
	private form: HTMLFormElement;
	private list: HTMLElement;

	async onInit() {
		this.form = document.querySelector("#menu-form");
		this.form.addEventListener("submit", this.save, false);
		this.form.addEventListener("change", () => {
			this.form.classList.replace("was-validated", "needs-validation");
		});

		this.modal = document.querySelector("#menu-modal");
		$(this.modal).on("hidden.bs.modal", () => {
			this.form.reset();
			this.form.classList.replace("was-validated", "needs-validation");
		});

		this.list = document.querySelector("#menu-list");
		$(this.list).click(ev => {
			const item =
				ev.target && ev.target.matches(".menu-item")
					? $(ev.target)
					: $(ev.target).parents(".menu-item")?.[0];

			if (item) {
				const id = parseInt($(item).attr("id") as string);
				const menu = this.menu.find(menu => menu.id == id);
				if (menu) {
					this.promptEdit(menu);
				}
			}
		});

		if (!Session.isAdmin() && !Session.isManager() && Session.getRole() !== Role.Kitchen) {
			$("#new-btn").hide();
		}

		$("#stock").on("input change", (ev: JQuery.ChangeEvent<HTMLInputElement>) => {
			$("#stock-value").text(ev.target.value);
		});

		$("#price").on("input change", (ev: JQuery.ChangeEvent<HTMLInputElement>) => {
			ev.target.value = parseFloat(ev.target.value.replace(/,/g, ""))
				.toFixed(2)
				.toString();
		});

		await this.getRoles();
		await this.getMenu();
	}

	async getRoles() {
		this.roles = JSON.parse(localStorage.getItem("roles"));
		const option = document.createElement("option");
		option.value = "";
		option.textContent = "-- Select an item from the list --";
		$("#role").append(option);
		$("#role").append(
			...this.roles
				.filter(role => [Role.Admin, Role.Manager, Role.Floor].indexOf(role.id) === -1)
				.map(role => {
					const option = document.createElement("option");
					option.value = role.id.toString();
					option.textContent = role.name;
					return option;
				})
		);
	}

	async getMenu() {
		const ref = block(this.list, "Loading...");
		this.list.innerHTML = null;
		return api
			.list<Menu>("menu", {
				pagination: { page: 1, length: 100 },
				sort: { field: "updatedAt", order: "DESC" }
			})
			.then(({ data, total }) => {
				this.menu = data;
				if (this.menu.length) {
					const groups = group(this.menu, item => item.role);
					this.roles.forEach(role => {
						const group = groups.get(role.id);
						if (group && group.length) {
							const title = document.createElement("h3");
							title.textContent = role.name;
							this.list.append(title);
							this.list.append(...group.map(this.mapMenu));
							this.list.append(document.createElement("hr"));
						}
					});
					this.list.append();
				} else {
					this.list.innerHTML = `
						<div class="alert alert-warning d-flex align-items-center" role="alert">
							<i class="fas fa-exclamation-triangle mr-3"></i>
							<b>No menu to display</b>
						</div>
					`;
				}
			})
			.catch(({ message }) => {
				this.list.innerHTML = `
					<div class="alert alert-danger d-flex align-items-center" role="alert">
						<i class="fas fa-exclamation-triangle mr-3"></i>
                        <div>
                            <div>Something went wrong!</div>
                            <div>${message}</div>
                        </div>
					</div>
				`;
			})
			.finally(() => {
				ref.unblock();
			});
	}

	promptAdd = () => {
		if (Session.isAdmin() || Session.isManager() || Session.getRole() === Role.Kitchen) {
			$(this.modal)
				.find(".modal-title")
				.text("Add a new item to our menu");

			$("#delete").hide();

			this.show();
		}
	};

	promptEdit = (menu: Menu) => {
		if (Session.isAdmin() || Session.isManager() || Session.getRole() === Role.Kitchen) {
			const form = $(this.form);
			form.find("#menu-id").val(menu.id);
			form.find("#name").val(menu.name);
			form.find("#description").val(menu.description);
			form.find("#price").val(menu.price);
			form.find("#stock").val(menu.stock);
			form.find("#role").val(menu.role);

			$("#delete").show();

			$(this.modal)
				.find(".modal-title")
				.text("Edit this item");

			this.show();
		}
	};

	promptDelete = () => {
		if (Session.isAdmin() || Session.isManager() || Session.getRole() === Role.Kitchen) {
			modal({
				title: "Wait a minute!",
				body: "Are you sure you want to delete this item?",
				style: "warning"
			}).then(() => {
				api
					.delete("menu", parseInt(document.querySelector<HTMLInputElement>("#menu-id").value))
					.then(({ message }) => {
						toaster(message, "success");
						this.getMenu();
						this.hide();
					})
					.catch(({ message }) => {
						toaster(message, "danger");
					});
			});
		}
	};

	save = (ev: Event) => {
		if (Session.isAdmin() || Session.isManager() || Session.getRole() === Role.Kitchen) {
			ev.preventDefault();
			ev.stopPropagation();

			const id = document.querySelector<HTMLInputElement>("#menu-id");
			const name = document.querySelector<HTMLInputElement>("#name");
			const description = document.querySelector<HTMLInputElement>("#description");
			const price = document.querySelector<HTMLInputElement>("#price");
			const stock = document.querySelector<HTMLInputElement>("#stock");
			const role = document.querySelector<HTMLSelectElement>("#role");

			if (!name.value) setValidity(name, "This field is required");
			else if (name.value.length < 5) setValidity(name, "Name must be at least 3 characters long");
			else setValidity(name, true);

			if (!description.value) setValidity(description, "This field is required");
			else if (description.value.length < 5)
				setValidity(description, "Description should be at least 10 characters long");
			else if (description.value.length > 255)
				setValidity(description, "Description can't exceed 255 characters");
			else setValidity(description, true);

			if (!price.value) setValidity(price, "This field is required");
			else if (isNaN(parseFloat(price.value))) setValidity(price, "Price is not a valid number");
			else setValidity(price, true);

			if (!stock.value) setValidity(stock, "This field is required");
			else if (
				isNaN(parseInt(stock.value)) ||
				parseInt(stock.value) < 0 ||
				parseInt(stock.value) > 100
			)
				setValidity(stock, "Stock is not a valid number between 1 and 100");
			else setValidity(stock, true);

			if (!role.value) setValidity(role, "This field is required");
			else if (this.roles.map(x => x.id).indexOf(parseInt(role.value)) === -1)
				setValidity(role, "Value of role is not in the list");
			else setValidity(role, true);

			this.form.classList.replace("needs-validation", "was-validated");

			if (this.form.checkValidity()) {
				if (id.value) {
					const ref = block(this.form, "Saving changes...");
					api
						.put("menu", parseInt(id.value), {
							name: name.value,
							description: description.value,
							price: parseFloat(price.value),
							stock: parseInt(stock.value),
							role: parseInt(role.value)
						})
						.then(async ({ message }) => {
							toaster(message, "success");
							this.getMenu();
							this.hide();
						})
						.catch(({ message }) => {
							toaster(message, "danger");
						})
						.finally(() => {
							ref.unblock();
						});
				} else {
					const ref = block(this.form, "Creating item...");
					api
						.post("menu", {
							name: name.value,
							description: description.value,
							price: parseFloat(price.value),
							stock: parseInt(stock.value),
							role: parseInt(role.value)
						})
						.then(async ({ message }) => {
							toaster(message, "success");
							this.getMenu();
							this.hide();
						})
						.catch(({ message }) => {
							toaster(message, "danger");
						})
						.finally(() => {
							ref.unblock();
						});
				}
			}
		}
	};

	private show() {
		$("#stock-value").text(
			$("#stock")
				.val()
				.toString()
		);

		$(this.modal).modal({
			backdrop: true,
			keyboard: true,
			focus: true,
			show: true
		});
	}

	private hide() {
		$(this.modal).modal("hide");
	}

	private mapMenu(menu: Menu) {
		const el = document.createElement("div");
		el.id = menu.id.toString();
		el.className = "menu-item";
		el.style.alignItems = "center";
		el.style.padding = ".5rem";
		el.style.marginTop = ".5rem";
		el.innerHTML = `
            <div class="mr-3"><i class="fas fa-menu-circle" style="font-size: 2rem;"></i></div>
            <div>
                <div>
                    <b class="mr-2">${menu.name}</b>
                </div>
                <small>${menu.description}</small>
				<small>${menu.updatedAt ? moment(menu.updatedAt).fromNow() : ""}</small>
            </div>
        `;
		return el;
	}

	async onDispose() {
		this.form.removeEventListener("submit", this.save, false);
	}
}
