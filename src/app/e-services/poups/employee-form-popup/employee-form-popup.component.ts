import { Employee } from './../../../models/employee';
import { DialogService } from "@app/services/dialog.service";
import { ContractLocationTypes } from "./../../../enums/contract-location-types.enum";
import { LookupEmploymentCategory } from "./../../../enums/lookup-employment-category";
import { JobApplicationService } from "./../../../services/job-application.service";
import { DIALOG_DATA_TOKEN } from "./../../../shared/tokens/tokens";
import { IGridAction } from "./../../../interfaces/i-grid-action";
import { EmployeesDataComponent } from "../../shared/employees-data/employees-data.component";
import { DatepickerOptionsMap } from "@app/types/types";
import { DateUtils } from "@app/helpers/date-utils";
import { Lookup } from "./../../../models/lookup";
import { LookupService } from "@app/services/lookup.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { LangService } from "@app/services/lang.service";
import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { ContractTypes } from "@app/enums/contract-types.enum";
import { ContractStatus } from "@app/enums/contract-status.enum";

@Component({
  selector: "app-employee-form-popup",
  templateUrl: "./employee-form-popup.component.html",
  styleUrls: ["./employee-form-popup.component.scss"],
})
export class EmployeeFormPopupComponent implements OnInit {
  @ViewChild("ETable") ETable!: EmployeesDataComponent;
  form!: FormGroup;
  starterId: number = 0;
  employeesList: Employee[] = [];
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
    private dialog: DialogService,
    private lookupService: LookupService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      service: JobApplicationService;
      parentForm: FormGroup;
      employees: Employee[];
    }
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
      identificationType: [null, Validators.required],
      identificationNumber: [""],
      passportNumber: ["", Validators.required],
      gender: [null, Validators.required],
      nationality: [null, Validators.required],
      phone: ["", Validators.required],
      department: ["", Validators.required],
      contractLocation: ["", Validators.required],
      contractLocationType: [null, Validators.required],
      officeName: [""],
      contractStatus: [null, Validators.required],
      contractType: [null, Validators.required],
      jobContractType: [null, Validators.required],
      contractExpiryDate: [new Date()],
      workStartDate: [new Date(), Validators.required],
      workEndDate: [new Date(), Validators.required],
    });
    this.data.employees.forEach((ei, i) => {
      if (!this.data.employees[i].id) {
        this.data.employees[i].id = -i - 1;
      }
    });
    this.starterId = -this.data.employees.length - 1;
    if (!this.isApproval()) {
      this.employeesList = [...this.data.employees];
    } else if (this.data.employees[0]) {
      this.form.patchValue({
        ...this.data.employees[0],
      });
    }
  }
  submit() {
    // if (!this.isApproval()) {
    //   this.data.service.onSubmit.emit(this.employeesList);
    // } else {
    //   if (this.form.valid) {
    //     this.data.service.onSubmit.emit([{ ...this.form.value }]);
    //   }
    // }
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
    } else {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
    }
  }
  // TODO: complete it
  attachmentsAdded() {
    return true;
  }
  isExternalOfficeManager() {
    return true;
  }
  clearAll() {
    this.employeesList.splice(0, this.employeesList.length);
    this.employeesList = this.employeesList.slice();
  }
  handleOfficeNameValidationsByContractLocationType(): void {
    // set validators as empty
    this.officeName?.setValidators([]);
    if (!this.isExternal()) {
      this.officeName.setValidators([Validators.required]);
    }
    this.officeName.updateValueAndValidity();
  }

  handleContractExpireDateValidationsByContractType(): void {
    // set validators as empty
    this.contractExpiryDate?.setValidators([]);
    if (!this.isInterim()) {
      this.contractExpiryDate.setValidators([Validators.required]);
    }
    this.contractExpiryDate.updateValueAndValidity();
  }
  handleEndDateValidationsByContractStatus(): void {
    // set validators as empty
    this.workEndDate?.setValidators([]);
    if (!this.isFinishedContract()) {
      this.workEndDate.setValidators([Validators.required]);
    }
    this.workEndDate.updateValueAndValidity();
  }
  isInterim() {
    return this.contractLocationType == ContractTypes.Interim;
  }
  isExternal() {
    return this.contractLocationType == ContractLocationTypes.External;
  }
  isApproval() {
    return this.category == LookupEmploymentCategory.APPROVAL;
  }
  isEditPreviousEmployee() {
    return this.id > 0;
  }
  isFinishedContract() {
    return this.contractStatus != ContractStatus.Finished;
  }

  get workEndDate() {
    return this.form.controls.workEndDate;
  }
  get contractStatus() {
    return this.form.controls.contractStatus.value;
  }
  get contractExpiryDate() {
    return this.form.controls.contractExpiryDate;
  }
  get contractLocationType() {
    return this.form.controls.contractLocationType.value;
  }
  get officeName() {
    return this.form.controls.officeName;
  }
  get category() {
    return this.data.parentForm.controls.category.value;
  }
  get requestType() {
    return this.data.parentForm.controls.requestType.value;
  }
  get id() {
    return this.form.controls.id.value;
  }
  reset() {
    this.form.reset();
  }
}
