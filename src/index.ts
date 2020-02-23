import "./jquery";
import api from "./provider";
import { User } from "./classes/user";

$(document).ready(async () => {
	const { user } = await api.get<{ user: User }>("users", 1);
});
