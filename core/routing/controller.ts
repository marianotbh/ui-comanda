export abstract class Controller {
	onInit() {}
	onDispose() {}

	async initialize() {
		await this.onInit();
	}

	async dispose() {
		await this.onDispose();
	}
}
