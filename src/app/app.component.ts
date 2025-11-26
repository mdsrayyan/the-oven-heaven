import { Component, OnInit } from "@angular/core";
import { DataService } from "./services/data.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "The Oven Heaven";
  loading$: Observable<boolean>;

  constructor(private dataService: DataService) {
    this.loading$ = this.dataService.loading$;
}

  ngOnInit(): void {}
}
