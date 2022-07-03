import { IKeyValue } from '@app/interfaces/i-key-value';
import { ReadinessStatus } from '@app/types/types';
import { ExternalOrgAffiliationRequestTypes } from './../../../../enums/ExternalOrgAffiliationRequestTypes.enum';
import { ContactOfficer } from '@app/models/contact-officer';
import { ExecutiveManagementComponent } from '@app/modules/office-services/shared/executive-management/executive-management.component';
import { BankAccountComponent } from '@app/modules/office-services/shared/bank-account/bank-account.component';
import { CountryService } from '@app/services/country.service';
import { Country } from '@app/models/country';
import { ToastService } from '@app/services/toast.service';
import { DialogService } from './../../../../services/dialog.service';
import { LookupService } from './../../../../services/lookup.service';
import { Lookup } from './../../../../models/lookup';
import { ExternalOrgAffiliationService } from './../../../../services/external-org-affiliation.service';
import { tap, takeUntil } from 'rxjs/operators';
import { ExternalOrgAffiliation } from '@app/models/external-org-affiliation';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable, of } from 'rxjs';
@Component({
  selector: 'app-external-org-affiliation',
  templateUrl: './external-org-affiliation.component.html',
  styleUrls: ['./external-org-affiliation.component.scss']
})
export class ExternalOrgAffiliationComponent extends EServicesGenericComponent<ExternalOrgAffiliation, ExternalOrgAffiliationService> {
  form!: FormGroup;
  RequestTypeDropDown: Lookup[] = this.lookupService.listByCategory.LicenseDurationType;
  OrgClassificationDropDown: Lookup[] = this.lookupService.listByCategory.LicenseDurationType;
  CurrencyDropDown: Lookup[] = this.lookupService.listByCategory.Currency;
  countriesList: Country[] = [];

  managersTabStatus: ReadinessStatus = 'READY';
  bankDetailsTabStatus: ReadinessStatus = 'READY';

  @ViewChild('bankAccountsTab') bankAccountComponentRef!: BankAccountComponent;
  @ViewChild('managersTab') executiveManagementComponentRef!: ExecutiveManagementComponent;

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form && this.form.get('basicInfo')?.valid
    },
    bankAccounts: {
      name: 'bankAccountsTab',
      langKey: 'bank_details',
      validStatus: () => {
        return !this.bankAccountComponentRef || (this.bankDetailsTabStatus === 'READY' && this.bankAccountComponentRef.list.length > 0);
      }
    },
    managers: {
      name: 'managersTab',
      langKey: 'managers',
      validStatus: () => {
        return !this.executiveManagementComponentRef || (this.managersTabStatus === 'READY' && this.executiveManagementComponentRef.list.length > 0);
      }
    },
    contactOfficer: {
      name: 'contactOfficer',
      langKey: 'managers',
      validStatus: () => {
        return this.form && this.form.get('contactOfficer')?.valid
      }
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
  };

  constructor(
    public service: ExternalOrgAffiliationService,
    public fb: FormBuilder,
    public lang: LangService,
    private cd: ChangeDetectorRef,
    private lookupService: LookupService,
    private dialog: DialogService,
    private toast: ToastService,
    private countryService: CountryService
  ) {
    super();
  }

  _getNewInstance(): ExternalOrgAffiliation {
    return new ExternalOrgAffiliation();
  }
  _prepareModel(): ExternalOrgAffiliation | Observable<ExternalOrgAffiliation> {
    let value = (new ExternalOrgAffiliation()).clone({ ...this.model, ...this.form.value.basicInfo });

    value.bankAccountDTOs = this.bankAccountComponentRef.list;
    value.executiveManagementDTOs = this.executiveManagementComponentRef.list;
    return value;
  }
  _initComponent(): void {
    this.loadCountries();
  }
  _buildForm(): void {
    this.form = new FormGroup({
      basicInfo: this.fb.group((new ExternalOrgAffiliation()).getFormFields(true)),
      contactOfficer: this.fb.group((new ContactOfficer()).getContactOfficerFields(true))
    })
  }
  _afterBuildForm(): void {
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return of(this.form.valid)
      .pipe(tap(valid => !valid && this.invalidFormMessage()))
  }
  _afterSave(model: ExternalOrgAffiliation, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }
  _saveFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    return true;
  }
  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }
  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _destroyComponent(): void { }
  _updateForm(model: ExternalOrgAffiliation | undefined): void {
    console.log(model)
    this.model = model;
    this.basicTab.patchValue(model?.getFormFields());
    this.handleRequestTypeChange(model?.requestType || 0, false);
    this.cd.detectChanges();
  }
  _resetForm(): void {
    this.form.reset();
    this.operation = OperationTypes.CREATE;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }
  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }
  private loadCountries(): void {
    this.countryService.loadCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countriesList = countries)
  }
  isCancelRequestType(): boolean {
    return this.requestTypeField.value && (this.requestTypeField.value === ExternalOrgAffiliationRequestTypes.CANCEL)
  }
  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this._resetForm();
      this.requestTypeField.setValue(requestTypeValue);
    }
    if (!requestTypeValue) {
      requestTypeValue = this.requestTypeField && this.requestTypeField.value;
    }
  }

  // Get Fields
  get requestTypeField() {
    return this.form.get('basicInfo.requestType') as FormControl
  }
  get basicTab(): FormGroup {
    return (this.form.get('basicInfo')) as FormGroup;
  }
  get contactOfficerTab(): FormGroup {
    return (this.form.get('contactOfficer')) as FormGroup;
  }
}
