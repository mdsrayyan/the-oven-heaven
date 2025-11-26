import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { DataService } from "../../services/data.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  showExpenseForm = false;
  currentMonth = new Date().getMonth();
  currentYear = new Date().getFullYear();
  selectedMonth = this.currentMonth;
  selectedYear = this.currentYear;

  monthlyRevenue = 0;
  monthlyOrders = 0;
  monthlyEggless = 0;
  newCustomers = 0;
  monthlyExpenses = 0;
  netProfit = 0;
  upcomingOrders: any[] = [];

  months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  years: number[] = [];
  expenses: any[] = [];

  constructor(private dataService: DataService, private router: Router) {
    // Generate years from current year going back 2 years
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 3; i++) {
      this.years.push(currentYear - i);
    }
  }

  ngOnInit(): void {
    this.loadData();
    this.dataService.expenses$.subscribe(() => this.loadData());
    this.dataService.orders$.subscribe(() => this.loadData());
  }

  loadData(): void {
    this.monthlyRevenue = this.dataService.getMonthlyRevenue(
      this.selectedYear,
      this.selectedMonth
    );
    this.monthlyOrders = this.dataService.getMonthlyOrdersCount(
      this.selectedYear,
      this.selectedMonth
    );
    this.monthlyEggless = this.dataService.getMonthlyEgglessCount(
      this.selectedYear,
      this.selectedMonth
    );
    this.newCustomers = this.dataService.getNewCustomersCount(
      this.selectedYear,
      this.selectedMonth
    );
    this.monthlyExpenses = this.dataService.getMonthlyExpenses(
      this.selectedYear,
      this.selectedMonth
    );
    this.netProfit = this.monthlyRevenue - this.monthlyExpenses;
    this.upcomingOrders = this.dataService.getUpcomingOrders(3);
    this.loadExpenses();
  }

  loadExpenses(): void {
    const allExpenses = this.dataService.getExpenses();
    this.expenses = allExpenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getFullYear() === this.selectedYear &&
        expenseDate.getMonth() === this.selectedMonth
      );
    });
  }

  onMonthYearChange(): void {
    this.loadData();
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  testSync(): void {
    console.log("🧪 Manual sync test triggered from dashboard");
    this.dataService.testGoogleSheetsSync();
  }

  viewOrder(orderId: string): void {
    this.router.navigate(["/orders/view", orderId]);
  }
}
