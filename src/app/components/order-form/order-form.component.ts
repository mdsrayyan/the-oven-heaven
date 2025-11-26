import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "../../services/data.service";
import { ImageProxyService } from "../../services/image-proxy.service";
import { Order } from "../../models/order.model";

@Component({
  selector: "app-order-form",
  templateUrl: "./order-form.component.html",
  styleUrls: ["./order-form.component.scss"],
})
export class OrderFormComponent implements OnInit {
  orderForm: FormGroup;
  isEditMode = false;
  orderId: string | null = null;
  imagePreview: string | null = null; // Proxied URL for preview
  deliveredImagePreview: string | null = null; // Proxied URL for preview
  originalImageUrl: string | null = null; // Original URL for storage
  originalDeliveredImageUrl: string | null = null; // Original URL for storage
  imageError: string | null = null;
  deliveredImageError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private imageProxy: ImageProxyService
  ) {
    this.orderForm = this.fb.group({
      customerName: ["", Validators.required],
      customerPhone: [
        "",
        [Validators.pattern(/^[0-9]{10}$/)], // Optional, but if provided must be 10 digits
      ],
      cakeType: ["", Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      additionalCharges: [0, [Validators.required, Validators.min(0)]],
      deliveryCharge: [0, [Validators.required, Validators.min(0)]],
      otherDetails: [""],
      hasDelivery: [false],
      deliveryAddress: [""],
      dueDate: ["", Validators.required],
      isEggless: [false],
      status: ["pending"],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.isEditMode = true;
        this.orderId = params["id"];
        this.loadOrder();
      } else {
        // Set default due date to today
        const today = new Date().toISOString().split("T")[0];
        this.orderForm.patchValue({ dueDate: today });
      }
    });

    // Watch for delivery checkbox changes
    this.orderForm.get("hasDelivery")?.valueChanges.subscribe((hasDelivery) => {
      if (hasDelivery) {
        this.orderForm
          .get("deliveryAddress")
          ?.setValidators([Validators.required]);
        this.orderForm
          .get("deliveryCharge")
          ?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        this.orderForm.get("deliveryAddress")?.clearValidators();
        this.orderForm.get("deliveryCharge")?.setValue(0);
        this.orderForm.get("deliveryCharge")?.clearValidators();
      }
      this.orderForm.get("deliveryAddress")?.updateValueAndValidity();
      this.orderForm.get("deliveryCharge")?.updateValueAndValidity();
    });

    // Watch for status changes to show/hide delivered image upload
    this.orderForm.get("status")?.valueChanges.subscribe((status) => {
      // Delivered image upload will be shown when status is delivered
    });
  }

  loadOrder(): void {
    const orders = this.dataService.getOrders();
    const order = orders.find((o) => o.id === this.orderId);
    if (order) {
      // Handle backward compatibility for old orders
      const oldOrder = order as any;
      const dueDate =
        order.dueDate ||
        oldOrder.deliveryDate ||
        new Date().toISOString().split("T")[0];

      this.orderForm.patchValue({
        ...order,
        deliveryCharge: order.deliveryCharge || 0,
        additionalCharges: order.additionalCharges || 0,
        dueDate: dueDate,
        status: order.status || "pending",
      });
      if (order.cakeImage) {
        // Store original URL
        this.originalImageUrl = order.cakeImage;
        // Use proxy for preview to avoid CORS issues
        this.imagePreview = this.imageProxy.getProxiedUrl(order.cakeImage);
      }
      if (order.deliveredImage) {
        // Store original URL
        this.originalDeliveredImageUrl = order.deliveredImage;
        // Use proxy for preview to avoid CORS issues
        this.deliveredImagePreview = this.imageProxy.getProxiedUrl(
          order.deliveredImage
        );
      }
    }
  }

  onImageUrlChange(url: string): void {
    this.imageError = null;
    if (url && url.trim()) {
      // Validate URL format
      try {
        new URL(url);
        // Store original URL
        this.originalImageUrl = url;
        // Use proxy to bypass CORS issues for preview
        this.imagePreview = this.imageProxy.getProxiedUrl(url);
      } catch (error) {
        this.imageError =
          "Invalid URL format. Please enter a valid image URL (e.g., https://example.com/image.jpg)";
        this.imagePreview = null;
        this.originalImageUrl = null;
      }
    } else {
      this.imagePreview = null;
      this.originalImageUrl = null;
    }
  }

  onImageError(): void {
    this.imageError =
      "Failed to load image. The image may be blocked by CORS or the URL may be incorrect.";
    this.imagePreview = null;
  }

  onDeliveredImageUrlChange(url: string): void {
    this.deliveredImageError = null;
    if (url && url.trim()) {
      // Validate URL format
      try {
        new URL(url);
        // Store original URL
        this.originalDeliveredImageUrl = url;
        // Use proxy to bypass CORS issues for preview
        this.deliveredImagePreview = this.imageProxy.getProxiedUrl(url);
      } catch (error) {
        this.deliveredImageError =
          "Invalid URL format. Please enter a valid image URL (e.g., https://example.com/image.jpg)";
        this.deliveredImagePreview = null;
        this.originalDeliveredImageUrl = null;
      }
    } else {
      this.deliveredImagePreview = null;
      this.originalDeliveredImageUrl = null;
    }
  }

  onDeliveredImageError(): void {
    this.deliveredImageError =
      "Failed to load image. The image may be blocked by CORS or the URL may be incorrect.";
    this.deliveredImagePreview = null;
  }

  async onSubmit(): Promise<void> {
    if (this.orderForm.valid) {
      const formValue = this.orderForm.value;
      const order: Order = {
        id: this.orderId || this.dataService.generateId(),
        customerName: formValue.customerName,
        customerPhone: formValue.customerPhone || undefined,
        cakeType: formValue.cakeType,
        quantity: formValue.quantity,
        price: formValue.price,
        additionalCharges: formValue.additionalCharges || 0,
        deliveryCharge: formValue.hasDelivery
          ? formValue.deliveryCharge || 0
          : 0,
        otherDetails: formValue.otherDetails,
        // Store original URL, not proxied URL
        cakeImage: this.originalImageUrl || undefined,
        deliveredImage: this.originalDeliveredImageUrl || undefined,
        hasDelivery: formValue.hasDelivery,
        deliveryAddress: formValue.hasDelivery
          ? formValue.deliveryAddress
          : undefined,
        dueDate: formValue.dueDate,
        orderDate: this.isEditMode
          ? this.dataService.getOrders().find((o) => o.id === this.orderId)
              ?.orderDate || new Date().toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status:
          formValue.status ||
          (this.isEditMode
            ? this.dataService.getOrders().find((o) => o.id === this.orderId)
                ?.status || "pending"
            : "pending"),
        isEggless: formValue.isEggless,
      };

      try {
        if (this.isEditMode) {
          await this.dataService.updateOrder(order);
        } else {
          await this.dataService.addOrder(order);
        }
        this.router.navigate(["/orders"]);
      } catch (error) {
        console.error("Error saving order:", error);
        alert("Failed to save order. Please try again.");
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.orderForm.controls).forEach((key) => {
        this.orderForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel(): void {
    this.router.navigate(["/orders"]);
  }

  getGrandTotal(): number {
    const price = this.orderForm.get("price")?.value || 0;
    const additionalCharges =
      this.orderForm.get("additionalCharges")?.value || 0;
    const deliveryCharge = this.orderForm.get("hasDelivery")?.value
      ? this.orderForm.get("deliveryCharge")?.value || 0
      : 0;
    return price + additionalCharges + deliveryCharge;
  }
}
