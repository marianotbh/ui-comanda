import "jquery";
import * as $ from "jquery";

declare module globalThis {
	var $: JQueryStatic;
	var jQuery: JQueryStatic;
}

globalThis.$ = $;
globalThis.jQuery = $;

import "popper.js";
import "bootstrap";
