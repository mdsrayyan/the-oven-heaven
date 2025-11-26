import { Injectable } from "@angular/core";
import { Order, Customer, Expense } from "../models/order.model";
import { BehaviorSubject, Observable } from "rxjs";
import { GoogleSheetsSyncService } from "./google-sheets-sync.service";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class DataService {
  private ordersKey = "bakery_orders";
  private customersKey = "bakery_customers";
  private expensesKey = "bakery_expenses";
  private googleSheetsEnabled = false;

  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  private expensesSubject = new BehaviorSubject<Expense[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(true);

  orders$: Observable<Order[]> = this.ordersSubject.asObservable();
  customers$: Observable<Customer[]> = this.customersSubject.asObservable();
  expenses$: Observable<Expense[]> = this.expensesSubject.asObservable();
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private googleSheetsSync: GoogleSheetsSyncService) {
    // Initialize asynchronously
    this.initialize().catch((error) => {
      console.error("Failed to initialize DataService:", error);
      // Fallback to localStorage only
      this.loadFromLocalStorage();
    });
  }

  private async initialize(): Promise<void> {
    this.loadingSubject.next(true);

    console.log("🔧 Initializing DataService...");
    console.log("Google Sheets config:", {
      enabled: environment.googleSheets?.enabled,
      hasSpreadsheetId: !!environment.googleSheets?.spreadsheetId,
      hasAppsScriptUrl: !!environment.googleSheets?.appsScriptUrl,
    });

    // Initialize Google Sheets sync if configured
    if (
      environment.googleSheets?.enabled &&
      environment.googleSheets.spreadsheetId &&
      environment.googleSheets.appsScriptUrl
    ) {
      console.log("✅ Google Sheets sync enabled");
      this.googleSheetsSync.initialize({
        spreadsheetId: environment.googleSheets.spreadsheetId,
        appsScriptUrl: environment.googleSheets.appsScriptUrl,
      });
      this.googleSheetsEnabled = true;
      console.log("📊 Google Sheets sync initialized with:", {
        spreadsheetId:
          environment.googleSheets.spreadsheetId.substring(0, 20) + "...",
        appsScriptUrl:
          environment.googleSheets.appsScriptUrl.substring(0, 50) + "...",
      });

      // Try to fetch data from Google Sheets first
      try {
        console.log("📥 Attempting to fetch data from Google Sheets...");
        const fetchedData = await this.googleSheetsSync.fetchAll();

        if (
          fetchedData.orders.length > 0 ||
          fetchedData.customers.length > 0 ||
          fetchedData.expenses.length > 0
        ) {
          console.log("✅ Loaded data from Google Sheets:", {
            orders: fetchedData.orders.length,
            customers: fetchedData.customers.length,
            expenses: fetchedData.expenses.length,
          });

          // Images are now stored in Google Sheets (compressed), so use fetched data directly
          // Merge with localStorage only if Google Sheets images are missing
          const ordersWithImages = this.mergeImagesIfMissing(
            fetchedData.orders
          );

          // Update subjects with fetched data
          this.ordersSubject.next(ordersWithImages);
          this.customersSubject.next(fetchedData.customers);
          this.expensesSubject.next(fetchedData.expenses);

          // Save to localStorage (including images)
          this.saveToLocalStorage(
            ordersWithImages,
            fetchedData.customers,
            fetchedData.expenses
          );

          this.loadingSubject.next(false);
          return; // Successfully loaded from Google Sheets
        } else {
          console.log(
            "ℹ️ Google Sheets is empty, falling back to localStorage"
          );
        }
      } catch (error) {
        console.warn(
          "⚠️ Failed to fetch from Google Sheets, falling back to localStorage:",
          error
        );
        // Continue to load from localStorage
      }
    } else {
      console.log("⚠️ Google Sheets sync is disabled or not configured");
      if (!environment.googleSheets?.enabled) {
        console.log("   Reason: enabled is false");
      }
      if (!environment.googleSheets?.spreadsheetId) {
        console.log("   Reason: spreadsheetId is missing");
      }
      if (!environment.googleSheets?.appsScriptUrl) {
        console.log("   Reason: appsScriptUrl is missing");
      }
    }

    // Load from localStorage (fallback or if Google Sheets is disabled)
    this.loadFromLocalStorage();
    this.loadingSubject.next(false);
  }

  private loadFromLocalStorage(): void {
    const orders = this.getOrdersFromStorage();
    const customers = this.getCustomersFromStorage();
    const expenses = this.getExpensesFromStorage();

    console.log("📦 Loaded data from localStorage:", {
      orders: orders.length,
      customers: customers.length,
      expenses: expenses.length,
    });

    this.ordersSubject.next(orders);
    this.customersSubject.next(customers);
    this.expensesSubject.next(expenses);
  }

  private saveToLocalStorage(
    orders: Order[],
    customers: Customer[],
    expenses: Expense[]
  ): void {
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    localStorage.setItem(this.customersKey, JSON.stringify(customers));
    localStorage.setItem(this.expensesKey, JSON.stringify(expenses));
  }

  /**
   * Merge images from localStorage only if they're missing from Google Sheets
   * This ensures images sync across devices while preserving local images as fallback
   */
  private mergeImagesIfMissing(orders: Order[]): Order[] {
    // Get local orders with images
    const localOrders = this.getOrdersFromStorage();
    const localOrdersMap = new Map<string, Order>();

    localOrders.forEach((order) => {
      localOrdersMap.set(order.id, order);
    });

    // Merge images from local storage only if Google Sheets doesn't have them
    return orders.map((order) => {
      const localOrder = localOrdersMap.get(order.id);
      if (localOrder) {
        // Use Google Sheets image if available, otherwise use local storage
        return {
          ...order,
          cakeImage: order.cakeImage || localOrder.cakeImage,
          deliveredImage: order.deliveredImage || localOrder.deliveredImage,
        };
      }
      return order;
    });
  }

  private saveAllData(): void {
    const orders = this.ordersSubject.value;
    const customers = this.customersSubject.value;
    const expenses = this.expensesSubject.value;

    // Save to localStorage
    localStorage.setItem(this.ordersKey, JSON.stringify(orders));
    localStorage.setItem(this.customersKey, JSON.stringify(customers));
    localStorage.setItem(this.expensesKey, JSON.stringify(expenses));

    // Sync to Google Sheets if enabled
    if (this.googleSheetsEnabled) {
      console.log("Syncing to Google Sheets...", {
        orders: orders.length,
        customers: customers.length,
        expenses: expenses.length,
      });

      this.googleSheetsSync
        .syncAll(orders, customers, expenses)
        .then(() => {
          console.log("✅ Google Sheets sync completed successfully");
        })
        .catch((error) => {
          // Log error but don't block the save operation
          console.error(
            "❌ Google Sheets sync failed (data still saved locally):",
            error
          );
          if (error.message) {
            console.error("Error details:", error.message);
          }
        });
    } else {
      console.log("Google Sheets sync is disabled");
    }
  }

  // Orders
  getOrders(): Order[] {
    return this.ordersSubject.value;
  }

  private getOrdersFromStorage(): Order[] {
    const data = localStorage.getItem(this.ordersKey);
    return data ? JSON.parse(data) : [];
  }

  async addOrder(order: Order): Promise<void> {
    const orders = this.getOrders();
    orders.push(order);
    this.ordersSubject.next(orders);

    // Save all data
    this.saveAllData();

    await this.updateCustomer(order);
  }

  async updateOrder(order: Order): Promise<void> {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    if (index !== -1) {
      orders[index] = order;
      this.ordersSubject.next(orders);

      // Save all data
      this.saveAllData();
    }
  }

  async deleteOrder(orderId: string): Promise<void> {
    const orders = this.getOrders().filter((o) => o.id !== orderId);
    this.ordersSubject.next(orders);

    // Save all data
    this.saveAllData();
  }

  // Customers
  getCustomers(): Customer[] {
    return this.customersSubject.value;
  }

  private getCustomersFromStorage(): Customer[] {
    const data = localStorage.getItem(this.customersKey);
    return data ? JSON.parse(data) : [];
  }

  private async updateCustomer(order: Order): Promise<void> {
    const customers = this.getCustomers();
    const existingCustomer = customers.find(
      (c) => c.phone === order.customerPhone
    );

    if (!existingCustomer && order.customerPhone) {
      const newCustomer: Customer = {
        id: this.generateId(),
        name: order.customerName,
        phone: order.customerPhone,
        firstOrderDate: order.orderDate,
      };
      customers.push(newCustomer);
      this.customersSubject.next(customers);

      // Save all data
      this.saveAllData();
    }
  }

  // Expenses
  getExpenses(): Expense[] {
    return this.expensesSubject.value;
  }

  private getExpensesFromStorage(): Expense[] {
    const data = localStorage.getItem(this.expensesKey);
    return data ? JSON.parse(data) : [];
  }

  async addExpense(expense: Expense): Promise<void> {
    const expenses = this.getExpenses();
    expenses.push(expense);
    this.expensesSubject.next(expenses);

    // Save all data
    this.saveAllData();
  }

  async updateExpense(expense: Expense): Promise<void> {
    const expenses = this.getExpenses();
    const index = expenses.findIndex((e) => e.id === expense.id);
    if (index !== -1) {
      expenses[index] = expense;
      this.expensesSubject.next(expenses);

      // Save all data
      this.saveAllData();
    }
  }

  async deleteExpense(expenseId: string): Promise<void> {
    const expenses = this.getExpenses().filter((e) => e.id !== expenseId);
    this.expensesSubject.next(expenses);

    // Save all data
    this.saveAllData();
  }

  // Analytics
  getMonthlyRevenue(year: number, month: number): number {
    const orders = this.getOrders();
    return orders
      .filter((order) => {
        const orderDate = new Date(order.orderDate);
        return (
          orderDate.getFullYear() === year && orderDate.getMonth() === month
        );
      })
      .reduce((sum, order) => {
        // Calculate grand total (price + additional charges + delivery charge)
        const grandTotal =
          order.price +
          (order.additionalCharges || 0) +
          (order.deliveryCharge || 0);
        return sum + grandTotal;
      }, 0);
  }

  getNewCustomersCount(year: number, month: number): number {
    const customers = this.getCustomers();
    return customers.filter((customer) => {
      const firstOrderDate = new Date(customer.firstOrderDate);
      return (
        firstOrderDate.getFullYear() === year &&
        firstOrderDate.getMonth() === month
      );
    }).length;
  }

  getMonthlyOrdersCount(year: number, month: number): number {
    const orders = this.getOrders();
    return orders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return orderDate.getFullYear() === year && orderDate.getMonth() === month;
    }).length;
  }

  getMonthlyEgglessCount(year: number, month: number): number {
    const orders = this.getOrders();
    return orders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return (
        orderDate.getFullYear() === year &&
        orderDate.getMonth() === month &&
        order.isEggless
      );
    }).length;
  }

  getUpcomingOrders(count: number = 3): Order[] {
    const orders = this.getOrders();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return orders
      .filter((order) => {
        const dueDate = new Date(order.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today && order.status !== "delivered";
      })
      .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
      })
      .slice(0, count);
  }

  getMonthlyExpenses(year: number, month: number): number {
    const expenses = this.getExpenses();
    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date);
        return (
          expenseDate.getFullYear() === year && expenseDate.getMonth() === month
        );
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }

  // Manual sync test method (for debugging)
  async testGoogleSheetsSync(): Promise<void> {
    console.log("🧪 Testing Google Sheets sync...");

    if (!this.googleSheetsEnabled) {
      console.error("❌ Google Sheets sync is not enabled");
      console.log("Current config:", {
        enabled: environment.googleSheets?.enabled,
        spreadsheetId: environment.googleSheets?.spreadsheetId,
        appsScriptUrl: environment.googleSheets?.appsScriptUrl,
      });
      return;
    }

    const orders = this.getOrders();
    const customers = this.getCustomers();
    const expenses = this.getExpenses();

    console.log("📦 Data to sync:", {
      orders: orders.length,
      customers: customers.length,
      expenses: expenses.length,
    });

    try {
      await this.googleSheetsSync.syncAll(orders, customers, expenses);
      console.log("✅ Test sync completed successfully!");
    } catch (error: any) {
      console.error("❌ Test sync failed:", error);
      if (error.message) {
        console.error("Error message:", error.message);
      }
    }
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
