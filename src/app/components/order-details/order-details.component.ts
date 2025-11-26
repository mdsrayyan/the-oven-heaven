import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "../../services/data.service";
import { Order } from "../../models/order.model";

@Component({
  selector: "app-order-details",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./order-details.component.html",
  styleUrls: ["./order-details.component.scss"],
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null;
  orderId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.orderId = params["id"];
      this.loadOrder();
    });
  }

  loadOrder(): void {
    if (this.orderId) {
      const orders = this.dataService.getOrders();
      this.order = orders.find((o) => o.id === this.orderId) || null;
    }
  }

  getGrandTotal(): number {
    if (!this.order) return 0;
    return (
      this.order.price +
      (this.order.additionalCharges || 0) +
      (this.order.deliveryCharge || 0)
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: "status-pending",
      "in-progress": "status-progress",
      ready: "status-ready",
      delivered: "status-delivered",
    };
    return statusMap[status] || "";
  }

  getStatusLabel(status: string): string {
    const labelMap: { [key: string]: string } = {
      pending: "Pending",
      "in-progress": "In Progress",
      ready: "Ready",
      delivered: "Delivered",
    };
    return labelMap[status] || status;
  }

  editOrder(): void {
    if (this.orderId) {
      this.router.navigate(["/orders/edit", this.orderId]);
    }
  }

  goBack(): void {
    this.router.navigate(["/orders"]);
  }
}
