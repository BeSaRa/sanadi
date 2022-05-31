import { LookupService } from "./../../../services/lookup.service";
import { Lookup } from "./../../../models/lookup";
import { IGridAction } from "./../../../interfaces/i-grid-action";
import { Component, Input, OnInit } from "@angular/core";
import { IEmployeeDto } from "../../../interfaces/i-employee-dto";
import { LangService } from "@app/services/lang.service";

@Component({
  selector: "app-employees-data",
  templateUrl: "./employees-data.component.html",
  styleUrls: ["./employees-data.component.scss"],
})
export class EmployeesDataComponent implements OnInit {
  Gender: Lookup[] = this.lookupService.listByCategory.Gender.slice().sort(
    (a, b) => a.lookupKey - b.lookupKey
  );
  displayedColumns: string[] = [
    "arName",
    "enName",
    "jobTitle",
    "gender",
    "actions",
  ];
  @Input() employees: IEmployeeDto[] = [];
  @Input() actions: IGridAction[] = [];
  constructor(public lang: LangService, private lookupService: LookupService) {}

  ngOnInit() {}
  getGenderName(gender: number) {
    return this.Gender.find((g) => g.lookupKey == gender)?.getName();
  }
  cb(e: Event, btn: any, data: any) {
    if (btn.callback) btn.callback(e, data);
  }
}
