import { Controller, block } from "core";
import { Table, State, Role } from "src/classes";
import { setValidity, toaster, modal } from "src/elements/bootstrap";
import api from "../provider";
import * as moment from "moment";
import "./tables.scss";
import { AppSession } from "src/session";

export class TablesController extends Controller {
	private tables: Table[];
	private states: State[];
	private list: HTMLElement;
	private form: HTMLFormElement;
	private modal: HTMLElement;
	private editMode: boolean = false;

	async onInit() {
		this.form = <HTMLFormElement>document.getElementById("table-form");
		this.form.addEventListener("submit", this.save, false);
		this.form.addEventListener("change", () => {
			this.form.classList.replace("was-validated", "needs-validation");
		});

		this.modal = document.getElementById("table-modal");
		$(this.modal).on("hidden.bs.modal", () => {
			this.form.reset();
			this.form.classList.replace("was-validated", "needs-validation");
			this.editMode = false;
		});

		this.list = document.getElementById("table-list");
		$(this.list).click(ev => {
			const item =
				ev.target && ev.target.matches(".table-item")
					? $(ev.target)
					: $(ev.target).parents(".table-item")?.[0];

			if (item) {
				const code = $(item).attr("id");
				const table = this.tables.find(table => table.code == code);
				if (table) {
					this.promptEdit(table);
				}
			}
		});

		if (!AppSession.isAdmin() && !AppSession.isManager() && AppSession.getRole() !== Role.Floor) {
			$("#new-btn").hide();
		}

		$("#capacity").on("input change", (ev: JQuery.ChangeEvent<HTMLInputElement>) => {
			$("#capacity-value").text(ev.target.value);
		});

		await this.getStates();
		await this.getTables();
	}

	private async getStates() {
		this.states = JSON.parse(localStorage.getItem("tableStates"));
		const empty = document.createElement("option");
		empty.value = "";
		empty.textContent = "-- Select an item from the list --";
		$("#state").append(empty);
		$("#state").append(
			...this.states.map(state => {
				const option = document.createElement("option");
				option.value = state.id.toString();
				option.textContent = state.name;
				return option;
			})
		);
	}

	private async getTables() {
		const container = document.getElementById("table-list");
		const ref = block(container, "Loading...");
		container.innerHTML = null;
		return api
			.list<Table>("tables", {
				pagination: { page: 1, length: 100 },
				sort: { field: "updatedAt", order: "ASC" }
			})
			.then(({ data, total }) => {
				this.tables = data;
				if (this.tables.length) {
					container.append(...this.tables.map(this.mapTable));
					container.append();
				} else {
					container.innerHTML = `
						<div class="alert alert-warning" role="alert">
							<i class="fas fa-exclamation-triangle mr-2"></i>
							<b>No tables to display</b>
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

	save = (ev: Event) => {
		ev.preventDefault();
		ev.stopPropagation();

		const code = <HTMLInputElement>document.getElementById("code");
		const capacity = <HTMLInputElement>document.getElementById("capacity");
		const state = <HTMLInputElement>document.getElementById("state");

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
					.put("tables", code.value, {
						capacity: capacity.value,
						state: parseInt(state.value)
					})
					.then(async ({ message }) => {
						toaster(message, "success");
						this.getTables();
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
					.post("tables", {
						code: code.value,
						capacity: capacity.value,
						state: parseInt(state.value)
					})
					.then(async ({ message }) => {
						toaster(message, "success");
						this.getTables();
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
		if (AppSession.isAdmin() || AppSession.isManager() || AppSession.getRole() === Role.Floor) {
			this.editMode = false;

			$(this.modal)
				.find(".modal-title")
				.text("Add a table");

			$(this.form)
				.find("#state")
				.parents(".form-group")
				.hide();

			$("#delete").hide();

			this.show();
		}
	};

	promptEdit = (table: Table) => {
		if (AppSession.isAdmin() || AppSession.isManager() || AppSession.getRole() === Role.Floor) {
			this.editMode = true;

			const form = $(this.form);
			form.find("#code").val(table.code);
			form.find("#capacity").val(table.capacity);
			form.find("#state").val(table.state);

			$(this.form)
				.find("#state")
				.parents(".form-group")
				.show();

			$("#delete").show();

			$(this.modal)
				.find(".modal-title")
				.text("Edit table");

			this.show();
		}
	};

	promptDelete = () => {
		if (AppSession.isAdmin() || AppSession.isManager() || AppSession.getRole() === Role.Floor) {
			modal({
				title: "Wait a minute!",
				body: "Are you sure you want to delete this item?",
				style: "warning"
			}).then(() => {
				api
					.delete("tables", (<HTMLInputElement>document.getElementById("code")).value)
					.then(({ message }) => {
						toaster(message, "success");
						this.getTables();
						this.hide();
					})
					.catch(({ message }) => {
						toaster(message, "danger");
					});
			});
		}
	};

	private show() {
		$("#capacity-value").text(
			$("#capacity")
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

	private mapTable = (table: Table) => {
		const el = document.createElement("div");
		el.id = table.code;
		el.className = "table-item";
		el.style.alignItems = "center";
		el.style.padding = ".5rem";
		el.style.marginTop = ".5rem";
		el.innerHTML = `
            <div class="mr-3"><i class="fas fa-table-circle" style="font-size: 2rem;"></i></div>
            <div>
                <div>
                    <b class="mr-2">${table.code}</b>${this.toBadge(table.state).outerHTML}
                </div>
				<small>${table.updatedAt ? moment(table.updatedAt).fromNow() : ""}</small>
            </div>
        `;
		return el;
	};

	private toBadge = (state: number) => {
		const badge = document.createElement("span");
		badge.className = "badge";
		badge.textContent = this.states.find(r => r.id == state)?.name;
		switch (state) {
			case Table.Available:
				badge.classList.add("badge-success");
				break;
			case Table.Waiting:
				badge.classList.add("badge-danger");
				break;
			case Table.Served:
				badge.classList.add("badge-info");
				break;
			case Table.Paying:
				badge.classList.add("badge-warning");
				break;
		}
		return badge;
	};

	async onDispose() {
		this.form.removeEventListener("submit", this.save, false);
	}
}
