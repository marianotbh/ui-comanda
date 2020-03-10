import "./setup";
import "./styles.scss";
import { AppSession } from "./session";
import { AppRouter } from "./routing";

$(document).ready(async () => {
	$("#navbar").animate(
		{
			opacity: 1
		},
		550
	);

	AppSession.begin();
	await AppRouter.start();

	setTimeout(() => {
		$("footer").animate(
			{
				opacity: 1
			},
			550
		);
	}, 500);
});
