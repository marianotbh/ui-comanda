import { Controller, block } from "core";
import { Order, User, Table, Role, State, Menu } from "src/classes";
import { setValidity, toaster, modal } from "src/elements/bootstrap";
import api from "../provider";
import * as moment from "moment";
import "./orders.scss";

export class Detail {
	id: number;
	user: number;
	order: string;
	menu: number;
	amount: number;
	state: number;
	createdAt: string;
	updatedAt: string;
	removedAt: string;
}

export class OrdersController extends Controller {
	private list: HTMLElement;
	private form: HTMLFormElement;
	private modal: HTMLElement;
	private editMode: boolean = false;
	private orders: Order[];
	private states: State[];
	private users: User[];
	private tables: Table[];
	private menu: Menu[];
	private details: Detail[] = new Array();

	async onInit() {
		this.form = document.querySelector("#order-form");
		this.form.addEventListener("submit", this.save, false);

		this.modal = document.querySelector("#order-modal");
		$(this.modal).on("hidden.bs.modal", () => {
			this.form.reset();
			this.form.classList.replace("was-validated", "needs-validation");
			this.editMode = false;
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
					this.promptEdit(order);
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
			const el = document.createElement("div");
			el.id = menu.value;
			el.className = "detail-item";
			el.innerHTML = `
				<div>
				
					<b>${this.menu.find(m => m.id === parseInt(menu.value)).name}</b>
					<i class="fas fa-times font-weight-bold text-warning mx-2"></i>
					<span>${amount.value}</span>
				</div>
				<div>

				</div>
			`;
			$("#detail-list").append(el);
		}
	};

	save = (ev: Event) => {
		ev.preventDefault();
		ev.stopPropagation();

		const code = document.querySelector<HTMLInputElement>("#code");
		const capacity = document.querySelector<HTMLInputElement>("#capacity");
		const state = document.querySelector<HTMLInputElement>("#state");

		if (!code.value) setValidity(code, "This field is required");
		else if (code.value.length !== 5) setValidity(code, "Code must be 5 characters long");
		else setValidity(code, true);

		if (!capacity.value) setValidity(capacity, "This field is required");
		else if (capacity.value.length < 1) setValidity(capacity, "Capacity should be at least 1");
		else if (capacity.value.length > 12) setValidity(capacity, "Max capacity is 12");
		else setValidity(capacity, true);

		if (this.editMode) {
			if (!state.value) setValidity(state, "This field is required");
			else if (this.states.map(s => s.id).indexOf(parseInt(state.value)) === -1)
				setValidity(state, "State is not a valid value");
			else setValidity(state, true);
		}

		this.form.classList.replace("needs-validation", "was-validated");

		if (this.form.checkValidity()) {
			if (this.editMode) {
				const ref = block(this.form, "Saving changes...");
				api
					.put("orders", code.value, {
						capacity: capacity.value,
						state: parseInt(state.value)
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
						code: code.value,
						capacity: capacity.value,
						state: parseInt(state.value)
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
		this.editMode = false;

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

	promptEdit = (order: Order) => {
		this.editMode = true;

		const form = $(this.form);
		form.find("#code").val(order.code);
		form.find("#capacity").val(order.user);
		form.find("#capacity").val(order.table);
		form.find("#state").val(order.state);

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

	private mapOrder(order: Order) {
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
	}

	private toBadge = (role: number) => {
		const badge = document.createElement("span");
		badge.className = "badge";
		badge.textContent = this.states.find(r => r.id == role)?.name;
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

	async onDispose() {
		this.form.removeEventListener("submit", this.save, false);
	}
}
