import { Controller, block } from "core";
import { Table } from "src/classes";
import api from "../provider";
import * as moment from "moment";
import { setValidity, toaster } from "src/elements/bootstrap";

interface State {
	id: number;
	name: string;
}

export class TablesController extends Controller {
	private tables: Table[];
	private states: State[];

	async onInit() {
		await this.listTables();
	}

	async listTables() {
		const container = document.querySelector("#table-list");
		const ref = block(container, "Loading...");
		container.innerHTML = null;
		return api
			.list<Table>("tables", {
				pagination: { page: 1, length: 100 },
				sort: { field: "updatedAt", order: "DESC" }
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
			.finally(() => {
				ref.unblock();
			});
	}

	private mapTable(table: Table) {
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
}
