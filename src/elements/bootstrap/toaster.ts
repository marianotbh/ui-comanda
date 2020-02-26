import { createIcon } from "./icon";
import { withClass, withStyle, withAttr, withHTML } from "./utils";

export const toaster = (
	message: string,
	style: Style = "primary",
	delay: number = 2500
): Promise<void> => {
	return new Promise(resolve => {
		$(
			withHTML(`
				<div class="toast-body">
					<button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
					${withClass("mr-2")(createIcon(style)).outerHTML}${message}
				</div>
			`)(
				withAttr({
					"role": "alert",
					"aria-live": "assertive",
					"aria-atomic": "true"
				})(
					withStyle({
						position: "absolute",
						bottom: "50px",
						left: "50%",
						color: "white",
						fontSize: "1rem",
						transform: "translateX(-50%)"
					})(withClass(`toast bg-${style}`)(document.createElement("div")))
				)
			)
		)
			.appendTo(document.body)
			.on("hidden.bs.toast", function() {
				$(this).remove();
				resolve();
			})
			.toast({ delay })
			.toast("show");
	});
};
