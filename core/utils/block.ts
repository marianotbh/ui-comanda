import "block-ui";

const css = {
	width: "auto",
	padding: "5px 10px",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	"background-color": "#fff",
	border: "none",
	"border-radius": "5px",
	"white-space": "nowrap",
	cursor: "wait",
	"user-select": "none",
	"box-shadow": "0 .5rem 1rem rgba(0,0,0,.15)"
};

const overlayCSS = {
	opacity: "0.5",
	"background-color": "#fff",
	cursor: "wait"
};

export const block = (el: Element, message = "") => {
	return $(el).block({
		message: `
            <span>
                <i class="fas fa-circle-notch fa-spin ${message ? "mr-2" : null}"></i>
                ${message}
            </span>
		`,
		centerX: false,
		centerY: false,
		fadeIn: 300,
		fadeOut: 300,
		css,
		overlayCSS
	});
};
