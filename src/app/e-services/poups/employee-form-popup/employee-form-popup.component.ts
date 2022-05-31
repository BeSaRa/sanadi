import { IGridAction } from "./../../../interfaces/i-grid-action";
import { EmployeesDataComponent } from "../../shared/employees-data/employees-data.component";
import { IEmployeeDto } from "./../../../interfaces/i-employee-dto";
import { DatepickerOptionsMap } from "@app/types/types";
import { DateUtils } from "@app/helpers/date-utils";
import { Lookup } from "./../../../models/lookup";
import { LookupService } from "@app/services/lookup.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { LangService } from "@app/services/lang.service";
import { Component, OnInit, ViewChild } from "@angular/core";

@Component({
  selector: "app-employee-form-popup",
  templateUrl: "./employee-form-popup.component.html",
  styleUrls: ["./employee-form-popup.component.scss"],
})
export class EmployeeFormPopupComponent implements OnInit {
  @ViewChild("ETable") ETable!: EmployeesDataComponent;
  form!: FormGroup;
  starterId: number = 0;
  employeesList: IEmployeeDto[] = [];
  datepickerOptionsMap: DatepickerOptionsMap = {
    contractExpiryDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    workStartDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
    workEndDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
  };
  Gender: Lookup[] = this.lookupService.listByCategory.Gender.slice().sort(
    (a, b) => a.lookupKey - b.lookupKey
  );
  Nationality: Lookup[] =
    this.lookupService.listByCategory.Nationality.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  IdentificationType: Lookup[] =
    this.lookupService.listByCategory.IdentificationType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  JobContractType: Lookup[] =
    this.lookupService.listByCategory.JobContractType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  ContractType: Lookup[] =
    this.lookupService.listByCategory.ContractType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  ContractStatus: Lookup[] =
    this.lookupService.listByCategory.ContractStatus.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  ContractLocationType: Lookup[] =
    this.lookupService.listByCategory.ContractLocationType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  actions: IGridAction[] = [
    {
      langKey: "btn_edit",
      icon: "pen",
      callback: (e, r) => {
        console.log(r);
        this.form.patchValue({
          ...r,
        });
      },
    },
    {
      langKey: "btn_delete",
      icon: "delete",
      callback: (e, r) => {
        let index = this.employeesList.findIndex((e) => e.id == r.id);
        this.employeesList.splice(index, 1);
        this.employeesList = this.employeesList.slice();
      },
    },
  ];
  constructor(
    public lang: LangService,
    private fb: FormBuilder,
    private lookupService: LookupService
  ) {}
  ngOnInit() {
    this._buildForm();
  }

  _buildForm() {
    this.form = this.fb.group({
      id: [0],
      arName: ["", Validators.required],
      enName: ["", Validators.required],
      jobTitle: [""],
      identificationType: [null, Validators.required], //  TODO: ?
      identificationNumber: [""], // مشروط
      passportNumber: ["", Validators.required],
      gender: [null, Validators.required],
      nationality: [null, Validators.required],
      phone: ["", Validators.required],
      department: ["", Validators.required],
      contractLocation: ["", Validators.required],
      contractLocationType: [null, Validators.required],
      officeName: ["", Validators.required],
      contractStatus: [null, Validators.required],
      contractType: [null, Validators.required],
      jobContractType: [null, Validators.required],
      contractExpiryDate: [new Date(), Validators.required], // مشروط
      workStartDate: [new Date(), Validators.required],
      workEndDate: [new Date(), Validators.required], // مشروط
    });
  }
  setEmployee() {
    if (this.form.valid) {
      if (!this.form.value.id) {
        this.employeesList = [
          { ...this.form.value, id: --this.starterId },
          ...this.employeesList,
        ];
      } else {
        Object.assign(
          this.employeesList.find((e) => e.id == this.form.value.id),
          {
            ...this.form.value,
          }
        );
      }
      this.form.reset();
    }
  }
  get id() {
    return this.form.controls['id'].value;
  }
  reset() {
    this.form.reset();
  }
}
