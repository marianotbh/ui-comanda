import { Route } from "./route";
import { Resolver } from "./resolver";
import { Controller } from "./controller";
import { NotFoundError, NotAuthorizedError } from "./errors";
import { Redirect } from "./redirect";

interface AddRouteOptions {
	path: string;
	controller?: Type<Controller>;
	template: string;
	resolver?: PossibleResolver | PossibleResolver[] | false;
}

type PossibleResolver = Resolver | Type<Resolver>;

export class Router {
	private root: HTMLElement;
	private routes: Map<string, Route>;
	private current: Controller;
	private resolvers: Set<Resolver>;

	constructor(root: HTMLElement = document.body) {
		this.root = root;
		this.routes = new Map<string, Route>();
		this.resolvers = new Set<Resolver>();
		this.setRoute = this.setRoute.bind(this);
		this.handle = this.handle.bind(this);
	}

	async start() {
		const { handle } = this;

		window.addEventListener("hashchange", async () => {
			await handle(this.setRoute);
		});

		await handle(this.setRoute);
	}

	private async setRoute() {
		await this.onChange();

		const { controller, template } = await this.parseHash();

		if (this.current instanceof Controller) {
			await this.current.dispose();
		}

		globalThis.$ctrl = controller;

		this.root.innerHTML = null;
		this.root.innerHTML = template;

		if (controller instanceof Controller) {
			await controller.initialize();
		}

		await this.onReady();
	}

	private async parseHash() {
		const { hash } = window.location;
		const match = this.find(hash);
		if (match) {
			const [, route] = match;
			return route.resolve(hash);
		} else {
			throw new NotFoundError();
		}
	}

	entries() {
		return [...this.routes.entries()];
	}

	has(name: string) {
		return this.routes.has(name);
	}

	get(name: string) {
		return { ...this.routes.get(name) };
	}

	find(hash: string) {
		const routes = this.entries();
		return routes.find(([, route]) => route.matches(hash));
	}

	add(name: string, config: AddRouteOptions): Router {
		const { path, controller, template, resolver } = config;

		const route = new Route(
			path,
			controller,
			template,
			(resolver === false
				? new Array()
				: Array.isArray(resolver)
				? [...this.resolvers, ...resolver]
				: [...this.resolvers, ...Array.of(resolver).filter(Boolean)]
			).map(r => (r instanceof Resolver ? r : new r(this)))
		);

		this.routes.set(name, route);

		return this;
	}

	use(resolver: PossibleResolver) {
		this.resolvers.add(resolver instanceof Resolver ? resolver : new resolver());
	}

	private bypassed() {
		const { handle } = this;

		if (this.current instanceof Controller) {
			this.current.dispose();
			this.current = null;
		}

		handle(this.onBypassed);
	}

	private rejected() {
		const { handle } = this;

		if (this.current instanceof Controller) {
			this.current.dispose();
			this.current = null;
		}

		handle(this.onRejected);
	}

	onBypassed = () => Promise.reject();

	onRejected = () => Promise.reject();

	onChange = () => Promise.resolve();

	onReady = () => Promise.resolve();

	private async handle(fn: Function, ...args) {
		try {
			return await fn(...args);
		} catch (error) {
			if (error instanceof Redirect) {
				location.hash = error.path;
			} else if (error instanceof NotFoundError) {
				this.bypassed();
			} else if (error instanceof NotAuthorizedError) {
				this.rejected();
			} else {
				throw error;
			}
		}
	}
}
