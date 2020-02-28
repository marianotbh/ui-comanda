import { Controller, block } from "core";
import { Order, User, Table, Role, State, Menu } from "src/classes";
import { setValidity, toaster, modal } from "src/elements/bootstrap";
import api from "../provider";
import * as moment from "moment";
import "./orders.scss";

export class OrdersController extends Controller {
	private list: HTMLElement;
	private form: HTMLFormElement;
	private modal: HTMLElement;
	private selected: Order;
	private orders: Order[];
	private states: State[];
	private users: User[];
	private tables: Table[];
	private menu: Menu[];

	async onInit() {
		this.form = document.querySelector("#order-form");
		this.form.addEventListener("submit", this.save, false);
		this.form.addEventListener("change", () => {
			this.form.classList.replace("was-validated", "needs-validation");
		});

		this.modal = document.querySelector("#order-modal");
		$(this.modal).on("hidden.bs.modal", () => {
			this.form.reset();
			this.form.classList.replace("was-validated", "needs-validation");
			this.selected = null;
		});

		this.list = document.querySelector("#order-list");
		$(this.list).click(ev => {
			const item =
				ev.target && ev.target.matches(".order-item")
					? $(ev.target)
					: $(ev.target).parents(".order-item")?.[0];

			if (item) {
				const code = $(item).attr("id");
				const order = this.orders.find(order => order.code == code);
				if (order) {
					this.selected = order;
					this.promptEdit();
				}
			}
		});

		await this.getStates();
		await this.getOrders();
	}

	private async getStates() {
		this.states = JSON.parse(localStorage.getItem("orderStates"));
		const [{ data: users }, { data: tables }, { data: menu }] = await Promise.all([
			api.list<User>("users", {
				pagination: { page: 1, length: 100 },
				sort: { field: "updatedAt", order: "DESC" }
			}),
			api.list<Table>("tables", {
				pagination: { page: 1, length: 100 },
				sort: { field: "updatedAt", order: "DESC" }
			}),
			api.list<Menu>("menu", {
				pagination: { page: 1, length: 100 },
				sort: { field: "updatedAt", order: "DESC" }
			})
		]);

		this.users = users;
		this.tables = tables;
		this.menu = menu;

		const empty = document.createElement("option");
		empty.value = "";
		empty.textContent = "-- Select an item from the list --";

		$("#state").append($(empty).clone());
		$("#state").append(
			...this.states.map(state => {
				const option = document.createElement("option");
				option.value = state.id.toString();
				option.textContent = state.name;
				return option;
			})
		);

		$("#table").append($(empty).clone());
		$("#table").append(
			...this.tables
				.filter(table => table.state === Table.Available)
				.map(table => {
					const option = document.createElement("option");
					option.value = table.code;
					option.textContent = `${table.code} (${table.capacity} ${
						table.capacity > 1 ? "people" : "person"
					})`;
					return option;
				})
		);

		$("#user").append($(empty).clone());
		$("#user").append(
			...this.users
				.filter(user => [Role.Floor, Role.Manager].indexOf(user.role) !== -1)
				.map(user => {
					const option = document.createElement("option");
					option.value = user.id.toString();
					option.textContent = `${user.name} (${user.firstName} ${user.lastName})`;
					return option;
				})
		);

		$("#menu").append($(empty).clone());
		$("#menu").append(
			...this.menu
				.filter(menu => menu.stock > 0)
				.map(menu => {
					const option = document.createElement("option");
					option.value = menu.id.toString();
					option.textContent = `${menu.name} (${menu.stock} left)`;
					return option;
				})
		);
	}

	private async getOrders() {
		const ref = block(this.list, "Loading...");
		this.list.innerHTML = null;
		return api
			.list<Order>("orders", {
				pagination: { page: 1, length: 100 },
				sort: { field: "updatedAt", order: "DESC" }
			})
			.then(({ data, total }) => {
				this.orders = data;
				if (this.orders.length) {
					this.list.append(...this.orders.map(this.mapOrder));
					this.list.append();
				} else {
					this.list.innerHTML = `
						<div class="alert alert-warning" role="alert">
							<i class="fas fa-exclamation-triangle mr-2"></i>
							<b>No orders to display</b>
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

	addDetail = () => {
		const menu = document.querySelector<HTMLSelectElement>("#menu");
		const amount = document.querySelector<HTMLSelectElement>("#amount");

		if (!menu.value) {
			modal({
				title: "Warning",
				body: "Please choose an item from the list",
				style: "warning",
				size: "sm",
				hideable: false
			});
		} else if (parseInt(amount.value) < 1 || parseInt(amount.value) > 100) {
			modal({
				title: "Warning",
				body: "Amount should not exceed 99 units",
				style: "warning",
				size: "sm",
				hideable: false
			});
		} else if (parseInt(amount.value) > this.menu.find(m => m.id === parseInt(menu.value)).stock) {
			modal({
				title: "Warning",
				body: "Cannot order more units than the ones in stock",
				style: "warning",
				size: "sm",
				hideable: false
			});
		} else {
			this.mapDetail(parseInt(menu.value), parseInt(amount.value));
		}
	};

	save = (ev: Event) => {
		ev.preventDefault();
		ev.stopPropagation();

		const detail = Array.from(document.querySelectorAll<HTMLElement>("#detail-list .detail-item"));
		const menu = document.querySelector<HTMLInputElement>("#menu");
		const amount = document.querySelector<HTMLInputElement>("#amount");
		const table = document.querySelector<HTMLInputElement>("#table");
		const state = document.querySelector<HTMLInputElement>("#state");
		const user = document.querySelector<HTMLInputElement>("#user");

		if (detail.length === 0) {
			setValidity(menu, "Select at least one item from the list");
			setValidity(amount, "*");
		} else if (
			!detail.every(d => {
				const menu = this.menu.find(m => m.id === parseInt(d.id));
				const amount = d.querySelector<HTMLInputElement>(".amount");
				if (menu.stock < parseInt(amount.value)) {
					setValidity(amount, "Ordered too many");
					return false;
				} else {
					setValidity(amount, true);
					return true;
				}
			})
		) {
			setValidity(menu, "Check the amounts");
			setValidity(amount, "*");
		} else {
			setValidity(menu, true);
			setValidity(amount, true);
		}

		if (!table.value) setValidity(table, "This field is required");
		else if (this.tables.map(t => t.code).indexOf(table.value) === -1)
			setValidity(table, "Table code is invalid");
		else setValidity(table, true);

		if (!user.value) setValidity(user, "This field is required");
		else if (this.users.map(u => u.id).indexOf(parseInt(user.value)) === -1)
			setValidity(user, "User selected is invalid");
		else setValidity(user, true);

		if (this.selected) {
			if (!state.value) setValidity(state, "This field is required");
			else if (this.states.map(s => s.id).indexOf(parseInt(state.value)) === -1)
				setValidity(state, "State is not a valid value");
			else setValidity(state, true);
		}

		this.form.classList.replace("needs-validation", "was-validated");

		if (this.form.checkValidity()) {
			if (this.selected) {
				const ref = block(this.form, "Saving changes...");
				api
					.put("orders", this.selected.code, {
						detail: detail.map(d => ({
							menu: parseInt(d.id),
							amount: parseInt(d.querySelector<HTMLInputElement>(".amount").value)
						})),
						table: table.value,
						state: parseInt(state.value),
						user: user.value
					})
					.then(async ({ message }) => {
						toaster(message, "success");
						this.getOrders();
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
					.post("orders", {
						detail: detail.map(d => ({
							menu: parseInt(d.id),
							amount: parseInt(d.querySelector<HTMLInputElement>(".amount").value)
						})),
						table: table.value,
						user: user.value
					})
					.then(async ({ message }) => {
						toaster(message, "success");
						this.getOrders();
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
	};

	promptNew = () => {
		$(this.modal)
			.find(".modal-title")
			.text("New order");

		$(this.form)
			.find("#state")
			.parents(".form-group")
			.hide();

		$("#delete").hide();

		this.show();
	};

	promptEdit = () => {
		const form = $(this.form);
		form.find("#capacity").val(this.selected.user);
		form.find("#capacity").val(this.selected.table);
		form.find("#state").val(this.selected.state);

		$(this.form)
			.find("#state")
			.parents(".form-group")
			.show();

		$("#delete").show();

		$(this.modal)
			.find(".modal-title")
			.text("Edit order");

		this.show();
	};

	promptDelete = () => {
		modal({
			title: "Wait a minute!",
			body: "Are you sure you want to delete this item?",
			style: "warning"
		}).then(() => {
			api
				.delete("orders", document.querySelector<HTMLInputElement>("#code").value)
				.then(({ message }) => {
					toaster(message, "success");
					this.getOrders();
					this.hide();
				})
				.catch(({ message }) => {
					toaster(message, "danger");
				});
		});
	};

	private show() {
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

	private mapOrder = (order: Order) => {
		const el = document.createElement("div");
		el.id = order.code;
		el.className = "order-item";
		el.style.alignItems = "center";
		el.style.padding = ".5rem";
		el.style.marginTop = ".5rem";
		el.innerHTML = `
            <div class="mr-3"><i class="fas fa-order-circle" style="font-size: 2rem;"></i></div>
            <div>
                <div>
                    <b class="mr-2">${order.code}</b>${this.toBadge(order.state).outerHTML}
                </div>
				<small>${order.updatedAt ? moment(order.updatedAt).fromNow() : ""}</small>
            </div>
        `;
		return el;
	};

	private mapDetail = (menuId: number, amount: number) => {
		const el =
			Array.from(document.querySelectorAll("#detail-list .detail-item")).find(
				item => parseInt(item.id) === menuId
			) ?? document.createElement("div");
		if (el.id) {
			const currentAmount = el.querySelector<HTMLInputElement>(".amount");
			currentAmount.value = (parseInt(currentAmount.value) + amount).toString();
		} else {
			el.id = menuId.toString();
			el.className = "detail-item";
			el.innerHTML = `
					<div>
						<b>${this.menu.find(m => m.id === menuId).name}</b>
						<i class="fas fa-times font-weight-bold text-warning ml-2 mr-1"></i>
						<input type="number" value=${amount} class="amount" readonly />
					</div>
					<div>
						<button type="button" class="btn btn-white delete">
							<i class="fas fa-times font-weight-bold"></i>
						</button>
					</div>
				`;
			$("#detail-list").append(el);
			$(el)
				.find(".delete")
				.click(() => {
					el.parentElement.removeChild(el);
				});
		}
	};

	private toBadge = (role: number) => {
		const badge = document.createElement("span");
		badge.className = "badge";
		badge.textContent = this.states.find(r => r.id == role)?.name;
		switch (role) {
			case Role.Admin:
				badge.classList.add("badge-warning");
				break;
			case Role.Manager:
				badge.classList.add("badge-info");
				break;
			default:
				badge.classList.add("badge-secondary");
				break;
		}
		return badge;
	};

	async onDispose() {
		this.form.removeEventListener("submit", this.save, false);
	}
}
