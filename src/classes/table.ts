export class Table {
	code: string;
	capacity: number;
	state: number;
	createdAt: string;
	updatedAt: string;
	removedAt: string;

	static Available = 0;
	static Waiting = 1;
	static Served = 2;
	static Paying = 3;
}
