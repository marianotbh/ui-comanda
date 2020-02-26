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

		return this.current != null;
	}

	get(refresh = false): TokenDTO<T> {
		if (refresh || this.current == null) {
			this.refresh();
		}

		return this.current;
	}

	private refresh() {
		const { storage, key } = this;
		this.current = key in storage ? decode<TokenDTO<T>>(storage[key]) : null;
	}

	end() {
		const { storage, key } = this;
		storage.removeItem(key);
		this.refresh();
	}
}
