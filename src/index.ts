import "./setup";
import "./styles.scss";
import router from "./routing";
import { Session } from "./session";

$(document).ready(async () => {
	await Session.begin();
	await router.start();
});
