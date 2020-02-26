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
