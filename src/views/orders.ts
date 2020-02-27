import { Controller, block } from "core";
import { Order } from "src/classes";
import { setValidity, toaster } from "src/elements/bootstrap";
import api from "../provider";
import * as moment from "moment";
import "./orders.scss";

interface State {
	id: number;
	name: string;
}

export class OrdersController extends Controller {
	private list: HTMLElement;
	private form: HTMLFormElement;
	private modal: HTMLElement;

	private orders: Order[];
	private states: State[];

	async onInit() {
		this.form = document.querySelector("#order-form");
		this.modal = document.querySelector("#order-modal");
		this.list = document.querySelector("#order-list");

		await this.getStates();
		await this.getOrders();
	}

	private async getStates() {
		this.states = JSON.parse(localStorage.getItem("orderStates"));
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
			.finally(() => {
				ref.unblock();
			});
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
}
