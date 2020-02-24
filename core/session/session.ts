import * as decode from "jwt-decode";
import { TokenDTO } from "./token-dto";

export class Session<T = any> {
	private storage: Storage;
	private key: string;
	private current: TokenDTO<T>;

	constructor(storage: Storage, key: string = "token") {
		this.storage = storage;
		this.key = key;
	}

	async new(token: string) {
		const { storage, key } = this;
		storage.setItem(key, token);
		this.refresh();
		return Promise.resolve();
	}

	begin() {
		this.refresh();
	}

	get online() {
		return this.current != null;
	}

	async get(refresh = false): Promise<TokenDTO<T>> {
		var token = null;

		if (refresh || !!this.current) {
			this.refresh();
			token = this.current;
		} else {
			token = this.current;
		}

		return Promise.resolve(token);
	}

	private refresh() {
		var token = null;

		const { storage, key } = this;

		if (key in storage) {
			token = decode<TokenDTO<T>>(storage[key]);
		}

		this.current = token;
	}

	async die() {
		const { storage, key } = this;
		storage.removeItem(key);
		this.refresh();
		return Promise.resolve();
	}
}
