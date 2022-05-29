import { Component, Input, OnInit } from "@angular/core";
import { IEmployeeDto } from "../../../interfaces/i-employee-dto";
import { LangService } from "@app/services/lang.service";
interface IAction {
  icon: string,
  tooltip: string,
  action: (params: any) => void
}
@Component({
  selector: "app-employees-data",
  templateUrl: "./employees-data.component.html",
  styleUrls: ["./employees-data.component.scss"],
})
export class EmployeesDataComponent implements OnInit {
  displayedColumns: string[] = [
    "arName",
    "enName",
    "jobTitle",
    "gender",
    "actions",
  ];
  @Input() employees: IEmployeeDto[] = [];
  @Input() actions: IAction[] = [];
  constructor(public lang: LangService) {}

  ngOnInit() {}
}
