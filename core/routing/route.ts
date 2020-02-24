import { Resolver } from "./resolver";
import { InvalidPathError, NotAuthorizedError } from "./errors";
import { Controller } from "./controller";
import { mix } from "core/utils";
import { Reject } from "./reject";

export class Route {
	private path: string;
	private controller: Type<Controller>;
	private resolvers: Resolver[];
	public isCurrent: boolean;
	private template: string;

	constructor(
		path: string,
		controller: Type<Controller>,
		template: string,
		resolve: Type<Resolver>[] = []
	) {
		if (path.charAt(0) !== "/")
			throw new InvalidPathError(
				`Route path string must start with a slash (i.e.: "/path/to/route").`
			);
		if (path.length > 1 && path.charAt(path.length - 1) === "/")
			throw new InvalidPathError(`Route path string must not end with a slash`);

		this.path = path;
		this.controller = controller;
		this.resolvers = resolve.map(ctor => new ctor(this));
		this.template = template;
		this.isCurrent = false;
	}

	matches(hash: string): boolean {
		const pathSegments = this.path
			.replace("#", "")
			.split("/")
			.filter(Boolean);
		const requestSegments = hash
			.replace("#", "")
			.split("/")
			.filter(Boolean);

		if (requestSegments.length !== pathSegments.length) {
			return false;
		}

		return requestSegments.every((val, idx) => {
			let matches = true;
			const part = pathSegments[idx];

			if (part.charAt(0) === "{" && part.charAt(part.length - 1)) {
				if (part.includes(":")) {
					const regex = new RegExp(val.substring(val.indexOf(":"), val.length - 1), "g");
					if (!regex.test(val)) {
						matches = false;
					}
				}
			} else if (val !== part) {
				matches = false;
			}

			return matches;
		});
	}

	async resolve(hash: string): Promise<{ controller: Controller; template: string }> {
		const { controller, resolvers, template } = this;

		const pathSegments = this.path
			.replace("#", "")
			.split("/")
			.filter(Boolean);
		const requestSegments = hash
			.replace("#", "")
			.split("/")
			.filter(Boolean);

		const params = pathSegments.reduce((params, segment, index) => {
			if (segment.charAt(0) === "{" && segment.charAt(segment.length - 1) === "}") {
				const name = segment.replace(/[\{\}]/g, "");
				Object.defineProperty(params, name, {
					value: requestSegments[index]
				});
			}

			return params;
		}, {}) as object;

		try {
			return Promise.resolve({
				controller: controller
					? new controller(
							resolvers.length
								? mix(await Promise.all(this.resolvers.map(r => r.resolve(params))))
								: params
					  )
					: null,
				template
			}).then(settings => {
				this.isCurrent = true;
				return settings;
			});
		} catch (error) {
			if (error instanceof Reject) {
				throw new NotAuthorizedError(error.reason);
			} else {
				throw error;
			}
		}
	}
}
