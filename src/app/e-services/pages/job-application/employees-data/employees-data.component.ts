import { JobApplicationService } from "./../../../../services/job-application.service";
import { Component, Input, OnInit } from "@angular/core";
import { IEmployeeDto } from "./../../../../interfaces/i-employee-dto";
import { LangService } from "@app/services/lang.service";

@Component({
  selector: "app-employees-data",
  templateUrl: "./employees-data.component.html",
  styleUrls: ["./employees-data.component.scss"],
})
export class EmployeesDataComponent implements OnInit {
  displayedColumns: string[] = [
    "identificationNumber",
    "arName",
    "enName",
    "jobTitle",
    "gender",
    "actions",
  ];
  @Input() employees: IEmployeeDto[] = [];
  constructor(
    public lang: LangService,
    private jobApplicationService: JobApplicationService
  ) {}

  ngOnInit() {}

  openForm() {
    this.jobApplicationService.openAddNewEmployee()
  }
}
