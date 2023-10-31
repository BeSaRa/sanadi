import { Component, Inject } from '@angular/core';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ToastService } from '@app/services/toast.service';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { Lookup } from '@app/models/lookup';
import { LookupService } from '@app/services/lookup.service';
import { UserTypes } from '@app/enums/user-types.enum';
import { NpoEmployee } from '@app/models/npo-employee';
import { DatepickerOptionsMap } from '@app/types/types';
import { DateUtils } from '@app/helpers/date-utils';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { ContractStatus } from '@app/enums/contract-status.enum';
import { ImplementingAgencyTypes } from '@app/enums/implementing-agency-types.enum';
import { CharityBranch } from '@app/models/charity-branch';
import { CustomValidators } from '@app/validators/custom-validators';
import { IdentificationType } from '@app/enums/identification-type.enum';
import { CommonService } from '@app/services/common.service';
import { AdminResult } from '@app/models/admin-result';
import { NpoEmployeeService } from '@app/services/npo-employee.service';
import { ContractLocationTypes } from '@app/enums/contract-location-types.enum';
import { ContractTypes } from '@app/enums/contract-types.enum';
import { AdminLookup } from '@app/models/admin-lookup';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { CountryService } from '@app/services/country.service';
import { Country } from '@app/models/country';

@Component({
  selector: 'npo-employee-popup',
  templateUrl: './npo-employee-popup.component.html',
  styleUrls: ['./npo-employee-popup.component.scss']
})
export class NpoEmployeePopupComponent extends AdminGenericDialog<NpoEmployee> {
  form!: UntypedFormGroup;
  model!: NpoEmployee;
  operation: OperationTypes;
  datepickerOptionsMap: DatepickerOptionsMap = {
    contractExpiryDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    workStartDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
    workEndDate: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
    expIdPass: DateUtils.getDatepickerOptions({ disablePeriod: "none" }),
  };
  saveVisible = true;
  userTypes: Lookup[] = this.lookupService.listByCategory.UserType.filter(x => x.lookupKey !== UserTypes.INTEGRATION_USER);
  implementingAgencyList: AdminResult[] = [];
  isLoadedImplementingAgencyList: boolean = false;
  charityBranch: CharityBranch[] = [];

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
  functionalGroupsList: AdminLookup[] = [];
  countriesList: Country[] = [];

  constructor(public dialogRef: DialogRef,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    private adminLookupService: AdminLookupService,
    private npoEmployeeService: NpoEmployeeService,
    private countryService: CountryService,
    private commonService: CommonService,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<NpoEmployee>,
    private toast: ToastService,
    private lookupService: LookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  initPopup(): void {
    this.loadCountries();
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.FUNCTIONAL_GROUP).subscribe((data) => {
      this.functionalGroupsList = data;
    })
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
    this.handlePreviewOfficeName();
    this.handleContractExpireDateValidationsByContractType();
    this.handleEndDateValidationsByContractStatus();
    this.handleIdentityNumberValidationsByIdentificationType();
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
  beforeSave(model: NpoEmployee, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: NpoEmployee, form: UntypedFormGroup): Observable<NpoEmployee> | NpoEmployee {
    return (new NpoEmployee()).clone({ ...model, ...form.value });
  }

  afterSave(model: NpoEmployee, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.operation === this.operationTypes.CREATE
      ? this.toast.success(message.change({ x: this.form.controls[this.lang.map.lang + 'Name'].value }))
      : this.toast.success(message.change({ x: model.getName() }));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_npo_employee;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  openDateMenu(ref: any) {
    if (this.saveVisible) ref.toggleCalendar();
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
    this.npoEmployeeService.getCharityHeadQuarterBranchByOrgId(this.model.orgId).subscribe((data: CharityBranch[]) => {
      this.charityBranch = data;
      this.charityId.setValue(data[0].id);
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

  isFinishedContract() {
    return this.contractStatus.value != ContractStatus.Finished;
  }
  isExternal() {
    return this.contractLocationType.value == ContractLocationTypes.External;
  }
  isInternal() {
    return this.contractLocationType.value == ContractLocationTypes.Internal;
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

  get charityId() {
    return this.form.controls.officeId as UntypedFormControl;
  }

  get contractStatus() {
    return this.form.controls.contractStatus as UntypedFormControl;
  }

  get contractLocationType() {
    return this.form.controls.contractLocationType as UntypedFormControl;
  }

  get identificationType() {
    return this.form.controls.identificationType as UntypedFormControl;
  }

  get identificationNumber() {
    return this.form.controls.qId as UntypedFormControl;
  }

  get passportNumber() {
    return this.form.controls.passportNumber as UntypedFormControl;
  }

  get id() {
    return this.form.controls.id.value;
  }
  destroyPopup(): void {
  }
}
