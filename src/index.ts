import "./setup";
import "./styles.scss";
import router from "./routing";
import { Session } from "./session";

$(document).ready(async () => {
	$("#navbar").animate(
		{
			opacity: 1
		},
		550
	);

	Session.begin();
	await router.start();

	setTimeout(() => {
		$("footer").animate(
			{
				opacity: 1
			},
			550
		);
	}, 500);
});

$(window).click((ev: JQuery.ClickEvent<any>) => {
	if (
		ev.target &&
		$(ev.target).parents("#sidebar").length === 0 &&
		$(ev.target).parents(".navbar-brand").length === 0
	) {
		$("#sidebar").removeClass("active");
		$("#chevron").removeClass("active");
	}
});

$(".navbar-brand").click(() => {
	if (window.innerWidth <= 768) {
		const chevron = document.querySelector("#chevron");
		const sidebar = document.querySelector("#sidebar");
		if (sidebar.classList.contains("active")) {
			chevron.classList.remove("active");
			sidebar.classList.remove("active");
		} else {
			chevron.classList.add("active");
			sidebar.classList.add("active");
		}
	} else {
		location.hash = "/";
	}
});
