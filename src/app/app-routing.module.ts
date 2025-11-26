import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { OrderFormComponent } from "./components/order-form/order-form.component";
import { OrderListComponent } from "./components/order-list/order-list.component";
import { OrderDetailsComponent } from "./components/order-details/order-details.component";

const routes: Routes = [
  { path: "", redirectTo: "/dashboard", pathMatch: "full" },
  { path: "dashboard", component: DashboardComponent },
  { path: "orders", component: OrderListComponent },
  { path: "orders/new", component: OrderFormComponent },
  { path: "orders/view/:id", component: OrderDetailsComponent },
  { path: "orders/edit/:id", component: OrderFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
