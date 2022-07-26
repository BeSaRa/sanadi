import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {TransferringIndividualFundsAbroad} from '@app/models/transferring-individual-funds-abroad';
import {LangService} from '@app/services/lang.service';
import {TransferringIndividualFundsAbroadService} from '@services/transferring-individual-funds-abroad.service';
import {Observable} from 'rxjs';
import {LookupService} from '@services/lookup.service';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {LicenseService} from '@services/license.service';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {OpenFrom} from '@app/enums/open-from.enum';
import {EmployeeService} from '@services/employee.service';
import {Lookup} from '@app/models/lookup';
import {DatepickerControlsMap, DatepickerOptionsMap} from '@app/types/types';
import {DateUtils} from '@helpers/date-utils';
import {FormManager} from '@app/models/form-manager';

@Component({
  selector: 'transferring-individual-funds-abroad',
  templateUrl: './transferring-individual-funds-abroad.component.html',
  styleUrls: ['./transferring-individual-funds-abroad.component.scss']
})
export class TransferringIndividualFundsAbroadComponent extends EServicesGenericComponent<TransferringIndividualFundsAbroad, TransferringIndividualFundsAbroadService> implements AfterViewInit {
  form!: FormGroup;
  fm!: FormManager;
  requestTypes: Lookup[] = this.lookupService.listByCategory.TransferringIndividualRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  transfereeTypes: Lookup[] = this.lookupService.listByCategory.TransfereeType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality
    .sort((a, b) => a.lookupKey - b.lookupKey);
  headQuarterTypes: Lookup[] = this.lookupService.listByCategory.HeadQuarterType
    .sort((a, b) => a.lookupKey - b.lookupKey);
  countries: Lookup[] = this.lookupService.listByCategory.Countries
    .sort((a, b) => a.lookupKey - b.lookupKey);
  currencies: Lookup[] = this.lookupService.listByCategory.Currency
    .sort((a, b) => a.lookupKey - b.lookupKey);
  transferMethods: Lookup[] = this.lookupService.listByCategory.TransferMethod
    .sort((a, b) => a.lookupKey - b.lookupKey);
  transferTypes: Lookup[] = this.lookupService.listByCategory.TransferType
    .sort((a, b) => a.lookupKey - b.lookupKey);

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'})
  };

  constructor(public lang: LangService,
              public fb: FormBuilder,
              private cd: ChangeDetectorRef,
              public service: TransferringIndividualFundsAbroadService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              private licenseService: LicenseService,
              private employeeService: EmployeeService) {
    super();
  }

  get basicInfo(): FormGroup {
    return this.form.get('basicInfo')! as FormGroup;
  }

  get requesterInfo(): FormGroup {
    return this.form.get('requesterInfo')! as FormGroup;
  }

  get receiverOrganizationInfo(): FormGroup {
    return this.form.get('receiverOrganizationInfo')! as FormGroup;
  }

  get receiverPersonInfo(): FormGroup {
    return this.form.get('receiverPersonInfo')! as FormGroup;
  }

  get financialTransactionInfo(): FormGroup {
    return this.form.get('financialTransactionInfo')! as FormGroup;
  }

  get specialExplanation(): FormGroup {
    return this.form.get('explanation')! as FormGroup;
  }

  get establishmentDate(): FormControl {
    return this.form.get('receiverOrganizationInfo.establishmentDate')! as FormControl;
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  _initComponent(): void {
    // load initials here
  }

  _buildForm(): void {
    const model = new TransferringIndividualFundsAbroad();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      requesterInfo: this.fb.group(model.buildRequesterInfo(true)),
      receiverOrganizationInfo: this.fb.group(model.buildReceiverOrganizationInfo(true)),
      receiverPersonInfo: this.fb.group(model.buildReceiverPersonInfo(true)),
      financialTransactionInfo: this.fb.group(model.buildFinancialTransactionInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    });

    this._buildDatepickerControlsMap();
    this.fm = new FormManager(this.form, this.lang);
  }

  _afterBuildForm(): void {
    this.handleReadonly();
  }

  _updateForm(model: TransferringIndividualFundsAbroad | undefined): void {
    if (!model) {
      return;
    }

    this.model = new TransferringIndividualFundsAbroad().clone({...this.model, ...model});
    this.form.patchValue({
      // patch values here
    });
  }

  _resetForm(): void {
    this.form.reset();
  }

  _prepareModel(): TransferringIndividualFundsAbroad | Observable<TransferringIndividualFundsAbroad> {
    let model = new TransferringIndividualFundsAbroad().clone({
      ...this.model,
      // form
    });

    return model;
  }

  _getNewInstance(): TransferringIndividualFundsAbroad {
    return new TransferringIndividualFundsAbroad();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    // add extra validation if exist
    return this.form.valid;
  }

  _afterSave(model: TransferringIndividualFundsAbroad, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {

  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {

  }

  _destroyComponent(): void {

  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus();
    if (caseStatus == CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION) {
      this.readonly = true;
      return;
    }

    if (this.openFrom === OpenFrom.USER_INBOX) {
      if (this.employeeService.isCharityManager()) {
        this.readonly = false;
      } else if (this.employeeService.isCharityUser()) {
        this.readonly = !this.model.isReturned();
      }
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isCharityManager()) {
          this.readonly = false;
        } else if (this.employeeService.isCharityUser()) {
          this.readonly = !this.model.isReturned();
        }
      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }

  searchForLicense() {

  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      establishmentDate: this.establishmentDate
    };
  }
}
