import { Controller } from "./routing";

export * from "./data";
export * from "./routing";
export * from "./session";
export * from "./utils";

declare module globalThis {
	var $ctrl: Controller;
}

globalThis.$ctrl = null;
