export const withClass = (className: string) => (el: HTMLElement) => {
	el.className += " " + className;
	return el;
};

export const withHTML = (html: string) => (el: HTMLElement) => {
	el.innerHTML = html;
	return el;
};

export const withChild = (children: Node | Node[]) => (el: HTMLElement) => {
	if (Array.isArray(children)) {
		el.append(...children);
	} else {
		el.appendChild(children);
	}
	return el;
};

export const withAttr = (attribute: string | object, value?: string) => (el: HTMLElement) => {
	if (typeof attribute === "object") {
		Object.keys(attribute).forEach(key => {
			el.setAttribute(key, attribute[key]);
		});
	} else {
		el.setAttribute(attribute, value);
	}
	return el;
};

export const withStyle = (attribute: string | object, value?: string) => (el: HTMLElement) => {
	if (typeof attribute === "object") {
		Object.keys(attribute).forEach(key => {
			el.style[key] = attribute[key];
		});
	} else {
		el.style[attribute] = value;
	}
	return el;
};

export const withListener = (
	type: string,
	listener: EventListenerOrEventListenerObject,
	options?: boolean | AddEventListenerOptions
) => (el: HTMLElement) => {
	el.addEventListener(type, listener, options);
	return el;
};

export const setValidity = (el: HTMLInputElement | HTMLSelectElement, message: string | true) => {
	if (message !== true) {
		el.setCustomValidity(message);
		if (el.nextElementSibling?.classList.contains("invalid-feedback")) {
			el.nextElementSibling.textContent = message;
		} else {
			el.parentElement.insertBefore(
				withHTML(message)(withClass("invalid-feedback")(document.createElement("div"))),
				el.nextElementSibling
			);
		}
	} else {
		el.setCustomValidity("");
		if (el.nextElementSibling?.classList.contains("invalid-feedback")) {
			el.parentElement.removeChild(el.nextElementSibling);
		}
	}
};
