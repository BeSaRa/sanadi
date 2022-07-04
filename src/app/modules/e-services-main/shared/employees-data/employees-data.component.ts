import { Component, Input, OnInit } from "@angular/core";
import { IGridAction } from "@app/interfaces/i-grid-action";
import { Employee } from "@app/models/employee";
import { Lookup } from "@app/models/lookup";
import { LangService } from "@app/services/lang.service";
import { LookupService } from "@app/services/lookup.service";

@Component({
  selector: "app-employees-data",
  templateUrl: "./employees-data.component.html",
  styleUrls: ["./employees-data.component.scss"],
})
export class EmployeesDataComponent implements OnInit {
  Gender: Lookup[] = this.lookupService.listByCategory.Gender.slice().sort(
    (a, b) => a.lookupKey - b.lookupKey
  );
  _displayedColumns: string[] = [
    "arabicName",
    "englishName",
    "jobTitleInfo",
    "gender"
  ];
  get displayedColumns() {
    return !this.actions.length ? this._displayedColumns : [...this._displayedColumns
      , "actions"]
  }
  @Input() employees: Partial<Employee>[] = [];
  @Input() actions: IGridAction[] = [];
  constructor(public lang: LangService, private lookupService: LookupService) { }

  ngOnInit() { }
  getGenderName(gender: number) {
    return this.Gender.find((g) => g.lookupKey == gender)?.getName();
  }
  cb(e: Event, btn: any, data: any) {
    e.preventDefault();
    if (btn.callback) btn.callback(e, data);
  }
}
