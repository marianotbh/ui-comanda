import { withHTML, withClass, withAttr } from "./utils";

interface ModalOptions {
	title?: string;
	body: string;
	style?: Style;
	size?: Size;
	okText?: string;
	hideable?: boolean;
	hideText?: string;
}

export const modal = (options: ModalOptions): Promise<void> => {
	const {
		title,
		body,
		size = "md",
		style = "default",
		okText = "Accept",
		hideable = true,
		hideText = "Cancel"
	} = options;

	return new Promise(resolve => {
		$(
			withHTML(`
				<div class="modal-dialog modal-${size}" role="document">
					<div class="modal-content">
						${
							title
								? `
                                    <div class="modal-header bg-${style}">
                                        <h5 class="modal-title">${title}</h5>
                                    </div>
								  `
								: ""
						}
						${
							hideable
								? `
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <i class="fas fa-times"></i>
                                    </button>
                                `
								: ""
						}
						<div class="modal-body">${body}</div>
						<div class="modal-footer">
							${
								hideable
									? `<button type="button" class="btn btn-default" data-dismiss="modal">${hideText}</button>`
									: ""
							}
							<button type="button" class="ok btn btn-${style}">${okText}</button>
						</div>
					</div>
				</div>
			`)(
				withAttr({
					tabindex: "-1",
					role: "dialog"
				})(withClass("modal fade")(document.createElement("div")))
			)
		)
			.modal({
				keyboard: hideable,
				backdrop: hideable ? "static" : true,
				focus: true,
				show: true
			})
			.on("hidden.bs.modal", function() {
				$(this).remove();
			})
			.find(".ok")
			.on("click", function() {
				$(this)
					.closest(".modal")
					.modal("hide");
				resolve();
			});
	});
};
