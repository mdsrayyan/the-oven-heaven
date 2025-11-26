import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DataService } from "../../services/data.service";
import { GoogleDriveService } from "../../services/google-drive.service";
import { Order } from "../../models/order.model";

@Component({
  selector: "app-order-list",
  templateUrl: "./order-list.component.html",
  styleUrls: ["./order-list.component.scss"],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm = "";
  statusFilter = "all";
  sortBy = "date-desc";

  constructor(
    private dataService: DataService,
    private router: Router,
    private googleDrive: GoogleDriveService
  ) {}

  ngOnInit(): void {
    this.dataService.orders$.subscribe((orders) => {
      this.orders = orders;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(term) ||
          order.cakeType.toLowerCase().includes(term) ||
          (order.customerPhone && order.customerPhone.includes(term))
      );
    }

    // Status filter
    if (this.statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === this.statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case "date-desc":
          return (
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          );
        case "date-asc":
          return (
            new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
          );
        case "price-desc":
          return b.price - a.price;
        case "price-asc":
          return a.price - b.price;
        default:
          return 0;
      }
    });

    this.filteredOrders = filtered;
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

  viewOrder(orderId: string): void {
    this.router.navigate(["/orders/view", orderId]);
  }

  editOrder(orderId: string): void {
    this.router.navigate(["/orders/edit", orderId]);
  }

  async deleteOrder(orderId: string): Promise<void> {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await this.dataService.deleteOrder(orderId);
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order. Please try again.");
      }
    }
  }

  async updateStatus(order: Order, newStatus: Order["status"]): Promise<void> {
    order.status = newStatus;
    try {
      await this.dataService.updateOrder(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
      // Revert the status change
      order.status =
        this.orders.find((o) => o.id === order.id)?.status || "pending";
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  getImageUrl(imageValue: string | undefined): string {
    if (!imageValue) return "";
    return this.googleDrive.getImageUrl(imageValue);
  }
}
