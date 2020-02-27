export abstract class Controller {
	async onInit() {}
	async onDispose() {}

	async initialize() {
		await this.onInit();
	}

	async dispose() {
		await this.onDispose();
	}
}
