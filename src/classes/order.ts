export class Order {
	code: string;
	state: number;
	user: number;
	table: string;
	createdAt: string;
	updatedAt: string;
	removedAt: string;

	static Pending = 0;
	static Preparing = 1;
	static Done = 2;
	static Served = 3;
}
