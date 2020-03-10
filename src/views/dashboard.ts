import { Controller } from "core";
import { User } from "src/classes/user";
import { AppSession } from "src/session";
import api from "../provider";
import cover from "../assets/img/cover.jpg";
import "./dashboard.scss";

export class DashboardController extends Controller {
	async onInit() {
		const currentUser = await api.get<User>("users", AppSession.current().payload.username);

		const wrapper = document.getElementById("wrapper");
		const placeholder = document.getElementById("name-placeholder");

		placeholder.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
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
