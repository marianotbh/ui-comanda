export const createIcon = (style: Style) => {
	const el = document.createElement("i");
	el.className = "fas";

	switch (style) {
		case "success":
			el.classList.add("fa-check-circle");
			break;
		case "warning":
			el.classList.add("fa-exclamation-circle");
			break;
		case "danger":
			el.classList.add("fa-exclamation-triangle");
			break;
		default:
			el.classList.add("fa-info-circle");
			break;
	}

	return el;
};
