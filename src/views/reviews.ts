import { Controller, block } from "core";
import { setValidity, toaster } from "src/elements/bootstrap";
import api from "../provider";
import * as moment from "moment";
import "./reviews.scss";

export class Review {
	id: number;
	order: string;
	name: string;
	email: string;
	description: string;
	createdAt: string;
	updatedAt: string;
	removedAt: string;
}

export class ReviewsController extends Controller {
	private reviews: Review[];

	async onInit() {
		await this.getReviews();
	}

	private async getReviews() {
		const container = document.getElementById("review-list");
		const ref = block(container, "Loading...");
		container.innerHTML = null;
		return api
			.list<Review>("reviews", {
				pagination: { page: 1, length: 100 },
				sort: { field: "updatedAt", order: "DESC" }
			})
			.then(({ data, total }) => {
				this.reviews = data;
				if (this.reviews.length) {
					container.append(...this.reviews.map(this.mapReview));
					container.append();
				} else {
					container.innerHTML = `
						<div class="alert alert-warning" role="alert">
							<i class="fas fa-exclamation-triangle mr-2"></i>
							<b>No reviews to display</b>
						</div>
					`;
				}
			})
			.finally(() => {
				ref.unblock();
			});
	}

	private mapReview(review: Review) {
		const el = document.createElement("div");
		el.id = review.id.toString();
		el.className = "review-item";
		el.style.alignItems = "center";
		el.style.padding = ".5rem";
		el.style.marginTop = ".5rem";
		el.innerHTML = `
            <div class="mr-3"><i class="fas fa-review-circle" style="font-size: 2rem;"></i></div>
            <div>
                <div>
                    <b class="mr-2">${review.order}</b>
                </div>
				<small>${review.updatedAt ? moment(review.updatedAt).fromNow() : ""}</small>
            </div>
        `;
		return el;
	}
}
