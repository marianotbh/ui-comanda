import { Controller } from "core";
import { User } from "src/classes/user";
import cover from "../assets/img/cover.jpg";
import "./dashboard.scss";

export class DashboardController extends Controller {
	private currentUser: User;

	constructor({ user }) {
		super();
		this.currentUser = user;
	}

	async onInit() {
		const placeholder = document.querySelector<HTMLSpanElement>("#name-placeholder");
		const wrapper = document.querySelector<HTMLDivElement>("#wrapper");

		placeholder.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
		wrapper.style.backgroundImage = `url(${cover})`;
		$(wrapper).animate(
			{
				opacity: 1
			},
			1000,
			() => {
				$("#wrapper .shadowed-text > *").animate(
					{
						opacity: 1
					},
					500
				);
			}
		);
	}
}
