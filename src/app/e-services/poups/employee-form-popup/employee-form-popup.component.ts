import { OperationTypes } from '@app/enums/operation-types.enum';
import { IdentificationType } from './../../../enums/identification-type.enum';
import { JobTitleService } from '@app/services/job-title.service';
import { JobTitle } from '@app/models/job-title';
import { EmploymentRequestType } from '@app/enums/employment-request-type';
import { JobApplication } from "./../../../models/job-application";
import { Employee } from "./../../../models/employee";
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
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
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
  JobTitleList: JobTitle[] = [];
  datepickerOptionsMap: DatepickerOptionsMap = {
    contractExpiryDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    workStartDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
    workEndDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
  };
  GenderList: Lookup[] = this.lookupService.listByCategory.Gender.slice().sort(
    (a, b) => a.lookupKey - b.lookupKey
  );
  NationalityList: Lookup[] =
    this.lookupService.listByCategory.Nationality.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  IdentificationTypeList: Lookup[] =
    this.lookupService.listByCategory.IdentificationType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  JobContractTypeList: Lookup[] =
    this.lookupService.listByCategory.JobContractType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  ContractTypeList: Lookup[] =
    this.lookupService.listByCategory.ContractType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  ContractStatusList: Lookup[] =
    this.lookupService.listByCategory.ContractStatus.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  ContractLocationTypeList: Lookup[] =
    this.lookupService.listByCategory.ContractLocationType.slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  actions: IGridAction[] = [
    {
      langKey: "btn_edit",
      icon: "pen",
      show: () => this.isEditRequestTypeAllowed,
      callback: (e, r) => {
        this.form.patchValue({
          ...r,
        });
      },
    },
    {
      langKey: "details",
      icon: "eye",
      show: () => !this.isEditRequestTypeAllowed,
      callback: (e, r) => {
        this.form.patchValue({
          ...r,
        });
      },
    },
    {
      langKey: "btn_delete",
      icon: "delete",
      show: () => this.isEditRequestTypeAllowed,
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
    private jobTitleService: JobTitleService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      service: JobApplicationService;
      parentForm: FormGroup;
      employees: Employee[];
      model: JobApplication | undefined;
      operation: number
    }
  ) { }

  ngOnInit() {
    this._buildForm();
    if (this.category.value == LookupEmploymentCategory.APPROVAL) {
      this.jobTitleService.getSystemJobTitle().subscribe((data: JobTitle[]) => {
        this.JobTitleList = [...data]
      })
    } else {
      this.jobTitleService.getExternalJobTitle().subscribe((data: JobTitle[]) => {
        this.JobTitleList = [...data]
      })
    }
  }

  _buildForm() {
    this.form = this.fb.group({
      id: [0],
      arabicName: ["", Validators.required],
      englishName: ["", Validators.required],
      jobTitleId: [null, Validators.required],
      identificationType: [1, Validators.required],
      identificationNumber: ["", Validators.required],
      passportNumber: [""],
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
    if (!this.isSingleEmployee()) {
      this.employeesList = [...this.data.employees];
    } else if (this.data.employees[0]) {
      this.form.patchValue({
        ...this.data.employees[0],
      });
    }
  }
  submit() {
    if (!this.isSingleEmployee()) {
      this.data.service.onSubmit.emit(this.employeesList);
    } else {
      if (this.form.valid) {
        this.data.service.onSubmit.emit([{ ...this.form.value }]);
      }
    }
  }
  get selectedJobTitle() {
    return this.JobTitleList.find(jt => jt.id == this.form.value.jobTitleId)?.getName()
  }
  isCreateOperation() {
    return this.data.operation === OperationTypes.CREATE;
  }
  setEmployee() {
    if (this.form.valid) {
      if (!this.form.value.id) {
        this.employeesList = [
          { ...this.form.value, jobTitle: this.selectedJobTitle, id: --this.starterId },
          ...this.employeesList,
        ];
      } else {
        Object.assign(
          this.employeesList.find((e) => e.id == this.form.value.id),
          {
            ...this.form.value,
            jobTitle: this.selectedJobTitle,
          }
        );
      }
      this.reset()
    } else {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
    }
  }

  openDateMenu(ref: any) {
    if (this.isEditRequestTypeAllowed) ref.toggleCalendar();
  }
  clearAll() {
    this.employeesList.splice(0, this.employeesList.length);
    this.employeesList = this.employeesList.slice();
    this.reset();
  }
  reset() {
    this.form.reset();
    this.form.patchValue({
      identificationType: 1
    });
    this.handleIdentityNumberValidationsByIdentificationType();
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
  handleIdentityNumberValidationsByIdentificationType(): void {
    // set validators as empty
    this.identificationNumber?.setValidators([]);
    this.passportNumber?.setValidators([]);
    if (this.identificationType.value == IdentificationType.Identification) {
      this.identificationNumber.setValidators([Validators.required]);
      this.passportNumber.setValue('');
    } else {
      this.passportNumber.setValidators([Validators.required]);
      this.identificationNumber.setValue('');
    }
    this.identificationNumber.updateValueAndValidity();
    this.passportNumber.updateValueAndValidity();
  }


  isIdentificationNumberType() {
    return this.identificationType.value == IdentificationType.Identification
  }
  isPassportNumberNumberType() {
    return this.identificationType.value == IdentificationType.Passport
  }
  isInterim() {
    return this.contractLocationType.value == ContractTypes.Interim;
  }
  isExternal() {
    return this.contractLocationType.value == ContractLocationTypes.External;
  }
  isSingleEmployee() {
    return this.category.value == LookupEmploymentCategory.APPROVAL;
  }
  isFinishedContract() {
    return this.contractStatus.value != ContractStatus.Finished;
  }
  isNewRequestType() {
    return this.requestType.value == EmploymentRequestType.NEW
  }
  cancelRequestType() {
    return this.requestType.value != EmploymentRequestType.CANCEL;
  }

  // TODO: complete it
  get isAttachmentsAdded() {
    return true;
  }
  get isEditRequestTypeAllowed(): boolean {
    return (
      !this.data.model?.id ||
      (!!this.data.model?.id && this.data.model.canCommit())
    ) && this.cancelRequestType()
  }

  get workEndDate() {
    return this.form.controls.workEndDate as FormControl;
  }
  get contractExpiryDate() {
    return this.form.controls.contractExpiryDate as FormControl;
  }
  get officeName() {
    return this.form.controls.officeName as FormControl;
  }
  get contractStatus() {
    return this.form.controls.contractStatus as FormControl;
  }
  get contractLocationType() {
    return this.form.controls.contractLocationType as FormControl;
  }
  get category() {
    return this.data.parentForm.controls.category as FormControl;
  }
  get requestType() {
    return this.data.parentForm.controls.requestType as FormControl;
  }
  get identificationType() {
    return this.form.controls.identificationType as FormControl;
  }
  get identificationNumber() {
    return this.form.controls.identificationNumber as FormControl;
  }
  get passportNumber() {
    return this.form.controls.passportNumber as FormControl;
  }
  get id() {
    return this.form.controls.id.value;
  }
}
