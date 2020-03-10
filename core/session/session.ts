import * as decode from "jwt-decode";
import { TokenDTO } from "./token-dto";

export class Session<T = any> {
	private token: TokenDTO<T>;
	private storage: Storage;
	private key: string;

	constructor(storage: Storage, key: string = "token") {
		this.storage = storage;
		this.key = key;
	}

	new(token: string) {
		const { storage, key } = this;
		storage.setItem(key, token);
		this.refresh();
	}

	begin() {
		this.refresh();
	}

	get online() {
		const { storage, key } = this;

		if (!(key in storage)) {
			this.refresh();
		}

		return this.token != null;
	}

	current(refresh = false): TokenDTO<T> {
		if (refresh || this.token == null) {
			this.refresh();
		}

		return this.token;
	}

	private refresh() {
		const { storage, key } = this;
		this.token = key in storage ? decode<TokenDTO<T>>(storage[key]) : null;
	}

	end() {
		const { storage, key } = this;
		storage.removeItem(key);
		this.refresh();
	}
}
