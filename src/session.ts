import { Session } from "core";
import { User } from "./classes/user";

const session = new Session<User>(localStorage, "token");

export { session as Session };
