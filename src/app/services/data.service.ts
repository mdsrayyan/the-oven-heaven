import { Injectable } from "@angular/core";
import { Order, Customer, Expense } from "../models/order.model";
import { BehaviorSubject, Observable } from "rxjs";
import { GoogleSheetsSyncService } from "./google-sheets-sync.service";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class DataService {
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
      this.loadingSubject.next(false);
      // Show empty state if initialization fails
      this.ordersSubject.next([]);
      this.customersSubject.next([]);
      this.expensesSubject.next([]);
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

    // Google Sheets is required
    if (
      !environment.googleSheets?.enabled ||
      !environment.googleSheets.spreadsheetId ||
      !environment.googleSheets.appsScriptUrl
    ) {
      console.error("❌ Google Sheets is not properly configured");
      if (!environment.googleSheets?.enabled) {
        console.error("   Reason: enabled is false");
      }
      if (!environment.googleSheets?.spreadsheetId) {
        console.error("   Reason: spreadsheetId is missing");
      }
      if (!environment.googleSheets?.appsScriptUrl) {
        console.error("   Reason: appsScriptUrl is missing");
      }
      this.loadingSubject.next(false);
      return;
    }

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

    // Fetch data from Google Sheets
    try {
      console.log("📥 Fetching data from Google Sheets...");
      const fetchedData = await this.googleSheetsSync.fetchAll();

      console.log("✅ Loaded data from Google Sheets:", {
        orders: fetchedData.orders.length,
        customers: fetchedData.customers.length,
        expenses: fetchedData.expenses.length,
      });

      // Update subjects with fetched data
      this.ordersSubject.next(fetchedData.orders);
      this.customersSubject.next(fetchedData.customers);
      this.expensesSubject.next(fetchedData.expenses);

      this.loadingSubject.next(false);
    } catch (error) {
      console.error("❌ Failed to fetch from Google Sheets:", error);
      this.loadingSubject.next(false);
      // Show empty state on error
      this.ordersSubject.next([]);
      this.customersSubject.next([]);
      this.expensesSubject.next([]);
    }
  }

  private saveAllData(): void {
    const orders = this.ordersSubject.value;
    const customers = this.customersSubject.value;
    const expenses = this.expensesSubject.value;

    // Sync to Google Sheets
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
          console.error("❌ Google Sheets sync failed:", error);
          if (error.message) {
            console.error("Error details:", error.message);
          }
        });
    } else {
      console.error(
        "❌ Google Sheets sync is not enabled - data cannot be saved"
      );
    }
  }

  // Orders
  getOrders(): Order[] {
    return this.ordersSubject.value;
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
