import { EmployeeService } from '@app/services/employee.service';
import { Employment } from '@app/models/employment';
import { EmploymentService } from '@app/services/employment.service';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { JobTitle } from '@app/models/job-title';
import { EmploymentRequestType } from '@app/enums/employment-request-type';
import { DialogService } from "@app/services/dialog.service";
import { DatepickerOptionsMap } from "@app/types/types";
import { DateUtils } from "@app/helpers/date-utils";
import { LookupService } from "@app/services/lookup.service";
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from "@angular/forms";
import { LangService } from "@app/services/lang.service";
import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { ContractTypes } from "@app/enums/contract-types.enum";
import { ContractStatus } from "@app/enums/contract-status.enum";
import { Employee } from '@app/models/employee';
import { Lookup } from '@app/models/lookup';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { IdentificationType } from '@app/enums/identification-type.enum';
import { ContractLocationTypes } from '@app/enums/contract-location-types.enum';
import { EmploymentCategory } from '@app/enums/employment-category.enum';
import { EmployeesDataComponent } from '../../shared/employees-data/employees-data.component';

@Component({
  selector: "app-employee-form-popup",
  templateUrl: "./employee-form-popup.component.html",
  styleUrls: ["./employee-form-popup.component.scss"],
})
export class EmployeeFormPopupComponent implements OnInit {
  @ViewChild("ETable") ETable!: EmployeesDataComponent;
  form!: UntypedFormGroup;
  starterId: number = 0;
  employeesList: Partial<Employee>[] = [];
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
        this.handleOfficeNameValidationsByContractLocationType();
        this.handleContractExpireDateValidationsByContractType();
        this.handleEndDateValidationsByContractStatus();
        this.handleIdentityNumberValidationsByIdentificationType();
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
    private fb: UntypedFormBuilder,
    private dialog: DialogService,
    private lookupService: LookupService,
    private employeeService: EmployeeService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      service: EmploymentService;
      parentForm: UntypedFormGroup;
      employees: Employee[];
      model: Employment | undefined;
      operation: number,
      jobTitleList: JobTitle[]
    }
  ) { }

  ngOnInit() {
    this._buildForm();
    this.JobTitleList = this.data.jobTitleList;
    if (!this.isApproval()) {
      this.identificationType.setValue(1);
      this.handleIdentityNumberValidationsByIdentificationType()
    }
  }

  _buildForm() {
    this.form = this.fb.group({
      id: [0],
      arabicName: ["", [
        CustomValidators.required,
        CustomValidators.pattern('AR_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)]],
      englishName: ["", [
        CustomValidators.required,
        CustomValidators.pattern('ENG_ONLY'),
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ]],
      jobTitleId: [null, CustomValidators.required],
      identificationType: [null, CustomValidators.required],
      identificationNumber: [null, [CustomValidators.maxLength(50)]],
      passportNumber: [null],
      gender: [null, CustomValidators.required],
      nationality: [null, CustomValidators.required],
      phone: ["", [CustomValidators.required].concat(CustomValidators.commonValidations.phone)],
      department: ["", [CustomValidators.required, CustomValidators.maxLength(300)]],
      contractLocation: ["", CustomValidators.required],
      contractLocationType: [null, CustomValidators.required],
      officeName: ["", CustomValidators.maxLength(300)],
      contractStatus: [null, CustomValidators.required],
      contractType: [null, CustomValidators.required],
      jobContractType: [null, CustomValidators.required],
      contractExpiryDate: [null],
      workStartDate: [null, CustomValidators.required],
      workEndDate: [null],
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
    if (!this.isApproval()) {
      this.employeesList = this.employeesList.map((e: Partial<Employee>) => {
        return {
          ...e,
          id: (e.id && e.id > 0) ? e.id : null
        }
      })
      this.data.service.onSubmit.emit(this.employeesList);
    } else {
      if (this.form.valid) {
        this.data.service.onSubmit.emit([{
          ...this.form.value,
          jobTitleInfo: this.selectedJobTitle,
          id: this.form.value.id > 0 ? this.form.value.id : null
        }]);
      }
    }
  }
  get selectedJobTitle() {
    return this.JobTitleList.find(jt => jt.id == this.form.value.jobTitleId)
  }
  isCreateOperation() {
    return this.data.operation === OperationTypes.CREATE;
  }
  setEmployee() {
    if (this.form.valid) {
      if (this.employeesList.findIndex(e => (this.form.value.passportNumber && e.passportNumber == this.form.value.passportNumber) || (this.form.value.identificationNumber && e.identificationNumber == this.form.value.identificationNumber)) != -1) {
        this.dialog.error(this.lang.map.msg_user_identifier_is_already_exist);
        return
      }
      if (!this.form.value.id) {
        this.employeesList = [
          { ...this.form.value, jobTitleInfo: this.selectedJobTitle, id: --this.starterId },
          ...this.employeesList,
        ];
      } else {
        const employee = this.employeesList.find((e) => e.id == this.form.value.id);
        employee && Object.assign(
          employee,
          {
            ...this.form.value,
            jobTitleInfo: this.selectedJobTitle,
          }
        );
      }
      this.reset()
    } else {
      this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
    }
  }
  canDraftModel() {
    return this.data.model?.canDraft();
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
    if (this.isExternal()) {
      this.officeName.setValidators([Validators.required]);
    }
    this.officeName.updateValueAndValidity();
  }
  handleContractExpireDateValidationsByContractType(): void {
    // set validators as empty
    this.contractExpiryDate?.setValidators([]);
    if (this.isInterim()) {
      this.contractExpiryDate.setValidators([Validators.required]);
    }
    this.contractExpiryDate.updateValueAndValidity();
  }
  handleEndDateValidationsByContractStatus(): void {
    // set validators as empty
    this.workEndDate?.setValidators([]);
    if (!this.isFinishedContract()) {
      this.workEndDate.setValidators([CustomValidators.required]);
    }
    this.workEndDate.updateValueAndValidity();
  }
  handleIdentityNumberValidationsByIdentificationType(): void {
    // set validators as empty
    this.identificationNumber?.setValidators([]);
    this.passportNumber?.setValidators([]);
    if (this.identificationType.value == IdentificationType.Identification) {
      this.identificationNumber.setValidators([Validators.required, ...CustomValidators.commonValidations.qId]);
      this.passportNumber.setValue(null);
    } else {
      this.passportNumber.setValidators([Validators.required, ...CustomValidators.commonValidations.passport]);
      this.identificationNumber.setValue(null);
    }
    this.identificationNumber.updateValueAndValidity();
    this.passportNumber.updateValueAndValidity();
  }
  handleJobTitleChange() {
    if (this.isExternalManagerJobTitle) {
      this.identificationType.setValue(2);
      this.handleIdentityNumberValidationsByIdentificationType()
    }
  }
  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        workStartDate: this.workStartDate,
        workEndDate: this.workEndDate
      }
    });
  }
  isIdentificationNumberType() {
    return this.identificationType.value == null || this.identificationType.value == IdentificationType.Identification
  }
  isPassportNumberNumberType() {
    return this.identificationType.value == IdentificationType.Passport
  }
  isInterim() {
    return this.contractType.value == ContractTypes.Interim;
  }
  isExternal() {
    return this.contractLocationType.value == ContractLocationTypes.External;
  }
  isApproval() {
    return this.category.value == EmploymentCategory.APPROVAL;
  }
  isFinishedContract() {
    return this.contractStatus.value != ContractStatus.Finished;
  }
  isNewRequestType() {
    return this.requestType.value == EmploymentRequestType.NEW
  }
  cancelRequestType() {
    return this.requestType.value == EmploymentRequestType.CANCEL;
  }

  get isEditRequestTypeAllowed(): boolean {
    return (
      !this.data.model?.id || (!!this.data.model?.id && this.data.model.canCommit())
      || (this.data.model.isReturned() && (this.employeeService.isCharityManager() || this.employeeService.isCharityUser()))
      || (!this.data.model.isCancelled() && !this.data.model.isFinalRejection() && !this.data.model.isFinalApproved() && this.employeeService.isCharityManager() && this.data.model.isClaimed())
    ) && !this.cancelRequestType()
  }

  get isExternalManagerJobTitle() {
    return this.jobTitleId.value == this.JobTitleList.find(jt => jt.enName.toLowerCase().includes("external"))?.id
  }

  get contractType() {
    return this.form.controls.contractType as UntypedFormControl
  }
  get workStartDate() {
    return this.form.controls.workStartDate as UntypedFormControl
  }
  get workEndDate() {
    return this.form.controls.workEndDate as UntypedFormControl;
  }
  get contractExpiryDate() {
    return this.form.controls.contractExpiryDate as UntypedFormControl;
  }
  get officeName() {
    return this.form.controls.officeName as UntypedFormControl;
  }
  get contractStatus() {
    return this.form.controls.contractStatus as UntypedFormControl;
  }
  get contractLocationType() {
    return this.form.controls.contractLocationType as UntypedFormControl;
  }
  get category() {
    return this.data.parentForm.controls.category as UntypedFormControl;
  }
  get requestType() {
    return this.data.parentForm.controls.requestType as UntypedFormControl;
  }
  get identificationType() {
    return this.form.controls.identificationType as UntypedFormControl;
  }
  get identificationNumber() {
    return this.form.controls.identificationNumber as UntypedFormControl;
  }
  get passportNumber() {
    return this.form.controls.passportNumber as UntypedFormControl;
  }
  get jobTitleId() {
    return this.form.controls.jobTitleId as UntypedFormControl;
  }
  get id() {
    return this.form.controls.id.value;
  }
}
