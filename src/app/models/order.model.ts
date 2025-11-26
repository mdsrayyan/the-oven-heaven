export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string; // Optional phone number
  cakeType: string;
  quantity: number;
  price: number;
  additionalCharges: number; // Additional charges (candles, toppers, middle stand, etc.)
  deliveryCharge: number; // Delivery charge amount
  otherDetails?: string;
  cakeImage?: string; // Base64 encoded reference image (from client)
  deliveredImage?: string; // Base64 encoded delivered cake image
  hasDelivery: boolean;
  deliveryAddress?: string;
  dueDate: string; // Due date for the order (applies to whole order)
  orderDate: string;
  status: "pending" | "in-progress" | "ready" | "delivered";
  isEggless: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  firstOrderDate: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}
