import { Injectable } from "@angular/core";
import { Order, Customer, Expense } from "../models/order.model";

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  appsScriptUrl: string; // Google Apps Script Web App URL
}

@Injectable({
  providedIn: "root",
})
export class GoogleSheetsSyncService {
  private config: GoogleSheetsConfig | null = null;
  private readonly ORDERS_SHEET = "Orders";
  private readonly CUSTOMERS_SHEET = "Customers";
  private readonly EXPENSES_SHEET = "Expenses";

  initialize(config: GoogleSheetsConfig): void {
    this.config = config;
  }

  isInitialized(): boolean {
    return this.config !== null;
  }

  // Sync orders to Google Sheets
  async syncOrders(orders: Order[]): Promise<void> {
    if (!this.config) return;

    try {
      const headers = this.getOrderHeaders();
      const rows = [headers, ...orders.map((order) => this.orderToRow(order))];
      await this.writeToSheet(this.ORDERS_SHEET, rows);
    } catch (error) {
      console.error("Error syncing orders to Google Sheets:", error);
      throw error;
    }
  }

  // Sync customers to Google Sheets
  async syncCustomers(customers: Customer[]): Promise<void> {
    if (!this.config) return;

    try {
      const headers = this.getCustomerHeaders();
      const rows = [
        headers,
        ...customers.map((customer) => this.customerToRow(customer)),
      ];
      await this.writeToSheet(this.CUSTOMERS_SHEET, rows);
    } catch (error) {
      console.error("Error syncing customers to Google Sheets:", error);
      throw error;
    }
  }

  // Sync expenses to Google Sheets
  async syncExpenses(expenses: Expense[]): Promise<void> {
    if (!this.config) return;

    try {
      const headers = this.getExpenseHeaders();
      const rows = [
        headers,
        ...expenses.map((expense) => this.expenseToRow(expense)),
      ];
      await this.writeToSheet(this.EXPENSES_SHEET, rows);
    } catch (error) {
      console.error("Error syncing expenses to Google Sheets:", error);
      throw error;
    }
  }

  // Sync all data at once
  async syncAll(
    orders: Order[],
    customers: Customer[],
    expenses: Expense[]
  ): Promise<void> {
    if (!this.config) return;

    try {
      await Promise.all([
        this.syncOrders(orders),
        this.syncCustomers(customers),
        this.syncExpenses(expenses),
      ]);
    } catch (error) {
      console.error("Error syncing all data to Google Sheets:", error);
      throw error;
    }
  }

  // Fetch data from Google Sheets
  async fetchAll(): Promise<{
    orders: Order[];
    customers: Customer[];
    expenses: Expense[];
  }> {
    if (!this.config) {
      throw new Error("Google Sheets sync not initialized");
    }

    try {
      console.log("📥 Fetching data from Google Sheets...");

      // Don't include Content-Type header for GET requests to avoid CORS preflight
      const url = `${this.config.appsScriptUrl}?action=fetch&spreadsheetId=${encodeURIComponent(
        this.config.spreadsheetId
      )}`;
      
      const response = await fetch(url, {
        method: "GET",
        // No custom headers to avoid CORS preflight
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Data fetched from Google Sheets:", {
        orders: data.orders?.length || 0,
        customers: data.customers?.length || 0,
        expenses: data.expenses?.length || 0,
      });

      return {
        orders: this.parseOrders(data.orders || []),
        customers: this.parseCustomers(data.customers || []),
        expenses: this.parseExpenses(data.expenses || []),
      };
    } catch (error) {
      console.error("Error fetching data from Google Sheets:", error);
      throw error;
    }
  }

  // Parse orders from Google Sheets rows
  private parseOrders(rows: string[][]): Order[] {
    if (rows.length < 2) return []; // No data rows (only header)

    const headers = rows[0];
    const dataRows = rows.slice(1);

    return dataRows
      .map((row) => {
        try {
          const order: any = {};
          headers.forEach((header, index) => {
            const value = row[index] || "";
            switch (header) {
              case "id":
                order.id = value;
                break;
              case "customerName":
                order.customerName = value;
                break;
              case "customerPhone":
                order.customerPhone = value || undefined;
                break;
              case "cakeType":
                order.cakeType = value;
                break;
              case "quantity":
                order.quantity = parseInt(value) || 1;
                break;
              case "price":
                order.price = parseFloat(value) || 0;
                break;
              case "additionalCharges":
                order.additionalCharges = parseFloat(value) || 0;
                break;
              case "deliveryCharge":
                order.deliveryCharge = parseFloat(value) || 0;
                break;
              case "otherDetails":
                order.otherDetails = value || undefined;
                break;
              case "cakeImage":
                // Image stored as base64 or "Yes"/"No"
                order.cakeImage = value === "Yes" ? "" : value || undefined;
                break;
              case "hasDelivery":
                order.hasDelivery = value === "true";
                break;
              case "deliveryAddress":
                order.deliveryAddress = value || undefined;
                break;
              case "dueDate":
              case "deliveryDate": // Backward compatibility
                order.dueDate = value;
                break;
              case "orderDate":
                order.orderDate = value;
                break;
              case "status":
                order.status = value || "pending";
                break;
              case "isEggless":
                order.isEggless = value === "true";
                break;
            }
          });

          // Validate required fields
          if (!order.id || !order.customerName || !order.cakeType) {
            return null;
          }

          return order as Order;
        } catch (error) {
          console.warn("Error parsing order row:", error, row);
          return null;
        }
      })
      .filter((order): order is Order => order !== null);
  }

  // Parse customers from Google Sheets rows
  private parseCustomers(rows: string[][]): Customer[] {
    if (rows.length < 2) return [];

    const headers = rows[0];
    const dataRows = rows.slice(1);

    return dataRows
      .map((row) => {
        try {
          const customer: any = {};
          headers.forEach((header, index) => {
            const value = row[index] || "";
            switch (header) {
              case "id":
                customer.id = value;
                break;
              case "name":
                customer.name = value;
                break;
              case "phone":
                customer.phone = value || undefined;
                break;
              case "email":
                customer.email = value || undefined;
                break;
              case "firstOrderDate":
                customer.firstOrderDate = value;
                break;
            }
          });

          if (!customer.id || !customer.name) {
            return null;
          }

          return customer as Customer;
        } catch (error) {
          console.warn("Error parsing customer row:", error, row);
          return null;
        }
      })
      .filter((customer): customer is Customer => customer !== null);
  }

  // Parse expenses from Google Sheets rows
  private parseExpenses(rows: string[][]): Expense[] {
    if (rows.length < 2) return [];

    const headers = rows[0];
    const dataRows = rows.slice(1);

    return dataRows
      .map((row) => {
        try {
          const expense: any = {};
          headers.forEach((header, index) => {
            const value = row[index] || "";
            switch (header) {
              case "id":
                expense.id = value;
                break;
              case "description":
                expense.description = value;
                break;
              case "amount":
                expense.amount = parseFloat(value) || 0;
                break;
              case "date":
                expense.date = value;
                break;
              case "category":
                expense.category = value || "";
                break;
            }
          });

          if (!expense.id || !expense.description) {
            return null;
          }

          return expense as Expense;
        } catch (error) {
          console.warn("Error parsing expense row:", error, row);
          return null;
        }
      })
      .filter((expense): expense is Expense => expense !== null);
  }

  // Private helper methods
  private async writeToSheet(
    sheetName: string,
    rows: string[][]
  ): Promise<void> {
    if (!this.config) {
      console.warn("Google Sheets sync not initialized");
      return;
    }

    try {
      console.log(`Syncing ${rows.length} rows to ${sheetName} sheet...`);

      // Use no-cors mode to bypass CORS restrictions completely
      // Google Apps Script Web Apps don't support CORS properly
      // The data will still be written, we just can't verify the response
      // This is the most reliable method that works without pop-ups
      await fetch(this.config.appsScriptUrl, {
        method: "POST",
        mode: "no-cors", // This bypasses CORS but we can't read response
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spreadsheetId: this.config.spreadsheetId,
          sheetName: sheetName,
          values: rows,
        }),
      });

      console.log(
        `✅ Sync request sent for ${sheetName} sheet (${rows.length} rows)`
      );
      console.log(
        `ℹ️ Note: Using no-cors mode - data is being written but we can't verify the response. Check your Google Sheet to confirm sync.`
      );
    } catch (error: any) {
      // With no-cors, errors are usually network-related
      console.warn(
        `⚠️ Sync request may have failed for ${sheetName}. Data is still saved locally.`
      );
      console.warn(
        `   Check your Google Sheet manually. If data didn't sync, try again.`
      );
      // Don't throw - let it fail silently since data is saved locally
    }
  }

  // Conversion methods
  private getOrderHeaders(): string[] {
    return [
      "id",
      "customerName",
      "customerPhone",
      "cakeType",
      "quantity",
      "price",
      "additionalCharges",
      "deliveryCharge",
      "grandTotal",
      "otherDetails",
      "cakeImage",
      "hasDelivery",
      "deliveryAddress",
      "dueDate",
      "orderDate",
      "status",
      "isEggless",
    ];
  }

  private orderToRow(order: Order): string[] {
    const additionalCharges = order.additionalCharges || 0;
    const deliveryCharge = order.deliveryCharge || 0;
    const grandTotal = order.price + additionalCharges + deliveryCharge;

    // Handle backward compatibility for old orders without dueDate
    const oldOrder = order as any;
    const dueDate = order.dueDate || oldOrder.deliveryDate || "";

    return [
      order.id || "",
      order.customerName || "",
      order.customerPhone || "",
      order.cakeType || "",
      String(order.quantity || 0),
      String(order.price || 0),
      String(additionalCharges),
      String(deliveryCharge),
      String(grandTotal),
      order.otherDetails || "",
      order.cakeImage ? "Yes" : "No", // Store as Yes/No instead of full base64
      String(order.hasDelivery || false),
      order.deliveryAddress || "",
      dueDate,
      order.orderDate || "",
      order.status || "pending",
      String(order.isEggless || false),
    ];
  }

  private getCustomerHeaders(): string[] {
    return ["id", "name", "phone", "email", "firstOrderDate"];
  }

  private customerToRow(customer: Customer): string[] {
    return [
      customer.id || "",
      customer.name || "",
      customer.phone || "",
      customer.email || "",
      customer.firstOrderDate || "",
    ];
  }

  private getExpenseHeaders(): string[] {
    return ["id", "description", "amount", "date", "category"];
  }

  private expenseToRow(expense: Expense): string[] {
    return [
      expense.id || "",
      expense.description || "",
      String(expense.amount || 0),
      expense.date || "",
      expense.category || "",
    ];
  }
}
