import { CountryService } from './../../../../../services/country.service';
import { Country } from './../../../../../models/country';
import { UserClickOn } from '@enums/user-click-on.enum';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { AdminLookupService } from '@services/admin-lookup.service';
import { AdminLookup } from '@models/admin-lookup';
import { AdminResult } from '@models/admin-result';
import { CommonService } from '@services/common.service';
import { EmployeeService } from '@services/employee.service';
import { Employment } from '@models/employment';
import { EmploymentService } from '@services/employment.service';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { OperationTypes } from '@enums/operation-types.enum';
import { EmploymentRequestType } from '@enums/service-request-types';
import { DialogService } from "@services/dialog.service";
import { DatepickerOptionsMap } from "@app/types/types";
import { DateUtils } from "@helpers/date-utils";
import { LookupService } from "@services/lookup.service";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { LangService } from "@services/lang.service";
import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { ContractTypes } from "@enums/contract-types.enum";
import { ContractStatus } from "@enums/contract-status.enum";
import { Employee } from '@models/employee';
import { Lookup } from '@models/lookup';
import { IGridAction } from '@contracts/i-grid-action';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';
import { IdentificationType } from '@enums/identification-type.enum';
import { ContractLocationTypes } from '@enums/contract-location-types.enum';
import { EmploymentCategory } from '@enums/employment-category.enum';
import { EmployeesDataComponent } from '@modules/services/employment/shared/employees-data/employees-data.component';
import { ImplementingAgencyTypes } from '@enums/implementing-agency-types.enum';
import { AdminLookupTypeEnum } from '@enums/admin-lookup-type-enum';
import { NpoEmployeeService } from '@app/services/npo-employee.service';
import { CharityBranch } from '@app/models/charity-branch';

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
  implementingAgencyList: AdminResult[] = [];
  charityBranch: CharityBranch[] = [];
  countriesList: Country[] = [];
  isLoadedImplementingAgencyList: boolean = false;
  isLoadedCharityBranch: boolean = false;
  functionalGroupsList: AdminLookup[] = [];
  skipConfirmUnsavedChanges: boolean = false;
  datepickerOptionsMap: DatepickerOptionsMap = {
    contractExpiryDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    workStartDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
    workEndDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
    expIdPass: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
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
        this.handlePreviewOfficeName();
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
        this.handlePreviewOfficeName();
        this.handleContractExpireDateValidationsByContractType();
        this.handleEndDateValidationsByContractStatus();
        this.handleIdentityNumberValidationsByIdentificationType();
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
    private dialogRef: DialogRef,
    private employeeService: EmployeeService,
    private adminLookupService: AdminLookupService,
    private commonService: CommonService,
    private npoEmployeeService: NpoEmployeeService,
    private countryService: CountryService,
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      service: EmploymentService;
      parentForm: UntypedFormGroup;
      employees: Employee[];
      model: Employment | undefined;
      operation: number
    }
  ) {
  }

  ngOnInit() {
    this.loadCountries();
    this._buildForm();
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.FUNCTIONAL_GROUP).subscribe((data) => {
      this.functionalGroupsList = data;
    })
  }

  private loadCountries(): void {
    this.countryService.loadAsLookups()
      .subscribe((countries) => {
        this.countriesList = countries;
      });
  }
  handlePreviewOfficeName() {
    if (this.isExternal()) {
      this.loadImplementingAgenciesByAgencyType();
    } else if (this.isInternal()) {
      this.loadCharityMainBranch();
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
      jobTitle: [null, [CustomValidators.required, CustomValidators.maxLength(150)]],
      identificationType: [null, CustomValidators.required],
      identificationNumber: [null, [CustomValidators.maxLength(50)]],
      passportNumber: [null],
      gender: [null, CustomValidators.required],
      nationality: [null, CustomValidators.required],
      phone: ["", [CustomValidators.required].concat(CustomValidators.commonValidations.phone)],
      email: ["", [CustomValidators.required].concat(CustomValidators.commonValidations.email)],
      department: ["", [CustomValidators.required, CustomValidators.maxLength(300)]],
      contractLocation: [null, CustomValidators.required],
      contractLocationType: [null, CustomValidators.required],
      officeId: [null, CustomValidators.maxLength(300)],
      contractStatus: [null, CustomValidators.required],
      contractType: [null, CustomValidators.required],
      jobContractType: [null, CustomValidators.required],
      contractExpiryDate: [null],
      workStartDate: [null, CustomValidators.required],
      workEndDate: [null],
      jobNumber: [null, [CustomValidators.maxLength(50)]],
      expIdPass: [null, CustomValidators.required],
      functionalGroup: [null, CustomValidators.required],
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
      this.handlePreviewOfficeName();
      this.handleContractExpireDateValidationsByContractType();
      this.handleEndDateValidationsByContractStatus();
      this.handleIdentityNumberValidationsByIdentificationType();
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
          id: this.form.value.id > 0 ? this.form.value.id : null
        }]);
      }
    }
  }

  isCreateOperation() {
    return this.data.operation === OperationTypes.CREATE;
  }

  setEmployee() {
    if (this.form.valid) {
      let index = this.employeesList.findIndex(e =>
        (this.form.value.passportNumber && e.passportNumber == this.form.value.passportNumber) ||
        (this.form.value.identificationNumber && e.identificationNumber == this.form.value.identificationNumber)
      )
      if (index != -1 && this.employeesList[index].id != this.form.value.id) {
        this.dialog.error(this.lang.map.msg_user_identifier_is_already_exist);
        return
      }
      index = this.employeesList.findIndex(e => (this.form.value.jobNumber && e.jobNumber == this.form.value.jobNumber));
      if (index != -1 && this.employeesList[index].id != this.form.value.id) {
        this.dialog.error(this.lang.map.msg_user_job_number_is_already_exist);
        return
      }
      if (!this.form.value.id) {
        this.employeesList = [
          { ...this.form.value, id: --this.starterId },
          ...this.employeesList,
        ];
      } else {
        const employee = this.employeesList.find((e) => e.id == this.form.value.id);
        employee && Object.assign(
          employee,
          {
            ...this.form.value
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

  closeDialog(): void {
    const sub = this.dialog.confirm(this.lang.map.msg_confirm_continue)
      .onAfterClose$
      .subscribe((click: UserClickOn) => {
        sub.unsubscribe();
        if (click === UserClickOn.YES) {
          this.dialogRef.close(click);
        }
      });
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
    this.handleIdentityNumberValidationsByIdentificationType();
  }

  handleOfficeNameValidationsByContractLocationType(): void {
    // set validators as empty
    this.officeId?.setValidators([]);
    if (this.isExternal()) {
      this.officeId.setValidators([Validators.required]);
      this.officeId.reset();
      if (!this.isLoadedImplementingAgencyList) {
        this.loadImplementingAgenciesByAgencyType();
      }
    } else if (this.isInternal()) {
      this.loadCharityMainBranch();
    }
    this.officeId.updateValueAndValidity();
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

    const contractExpiryDate: string = 'contractExpiryDate';
    DateUtils.setRelatedMinMaxDate({
      fromFieldName: contractExpiryDate,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        contractExpiryDate: this.contractExpiryDate,
        workEndDate: this.workEndDate
      }
    });
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName: contractExpiryDate,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        contractExpiryDate: this.contractExpiryDate,
        workStartDate: this.workStartDate
      }
    });
  }

  private loadImplementingAgenciesByAgencyType() {
    this.commonService.loadAgenciesByAgencyTypeAndCountry(ImplementingAgencyTypes.ExternalOffice)
      .subscribe((result) => {
        this.implementingAgencyList = result;
        this.isLoadedImplementingAgencyList = true;
      });
  }
  private loadCharityMainBranch() {
    this.npoEmployeeService.getCharityHeadQuarterBranch().subscribe((data: CharityBranch[]) => {
      this.charityBranch = data;
      this.officeId.setValue(data[0].id);
    })
  }
  isIdentificationNumberType() {
    return this.identificationType.value == IdentificationType.Identification
  }

  isPassportNumberType() {
    return this.identificationType.value == IdentificationType.Passport
  }

  isInterim() {
    return this.contractType.value == ContractTypes.Interim;
  }

  isExternal() {
    return this.contractLocationType.value == ContractLocationTypes.External;
  }
  isInternal() {
    return this.contractLocationType.value == ContractLocationTypes.Internal;
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

  get officeId() {
    return this.form.controls.officeId as UntypedFormControl;
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

  get id() {
    return this.form.controls.id.value;
  }
}
