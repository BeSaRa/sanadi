import { ExternalOrgAffiliationResult } from './../../../../models/external-org-affiliation-result';
import { map } from 'rxjs/operators';
import { switchMap } from 'rxjs/operators';
import { ExternalOrgAffiliationSearchCriteria } from './../../../../models/external-org-affiliation-search-criteria';
import { LicenseService } from './../../../../services/license.service';
import { filter } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { exhaustMap } from 'rxjs/operators';
import { Lookup } from '@app/models/lookup';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { ReadinessStatus } from '@app/types/types';
import { ContactOfficer } from '@app/models/contact-officer';
import { CountryService } from '@app/services/country.service';
import { Country } from '@app/models/country';
import { ToastService } from '@app/services/toast.service';
import { tap, takeUntil } from 'rxjs/operators';
import { ExternalOrgAffiliation } from '@app/models/external-org-affiliation';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { Component, ViewChild, ChangeDetectorRef, Pipe } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable, of, Subject } from 'rxjs';
import { ExternalOrgAffiliationService } from '@app/services/external-org-affiliation.service';
import { LookupService } from '@app/services/lookup.service';
import { DialogService } from '@app/services/dialog.service';
import { AffiliationRequestType } from '@app/enums/AffiliationRequestType.enum';
import { AffiliationCategory } from '@app/enums/AffiliationCategory.enum';
import { BankAccountComponent } from '@app/modules/e-services-main/shared/bank-account/bank-account.component';
import { ExecutiveManagementComponent } from '@app/modules/e-services-main/shared/executive-management/executive-management.component';
@Component({
  selector: 'app-external-org-affiliation',
  templateUrl: './external-org-affiliation.component.html',
  styleUrls: ['./external-org-affiliation.component.scss']
})
export class ExternalOrgAffiliationComponent extends EServicesGenericComponent<ExternalOrgAffiliation, ExternalOrgAffiliationService> {
  form!: FormGroup;
  AffiliationRequestType: Lookup[] = this.lookupService.listByCategory.AffiliationRequestType.sort((a, b) => a.lookupKey - b.lookupKey);
  AffiliationCategory: Lookup[] = this.lookupService.listByCategory.AffiliationCategory;
  CurrencyDropDown: Lookup[] = this.lookupService.listByCategory.Currency;
  countriesList: Country[] = [];
  managersTabStatus: ReadinessStatus = 'READY';
  bankDetailsTabStatus: ReadinessStatus = 'READY';
  licenseSearch$: Subject<string> = new Subject<string>();
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
        return !this.executiveManagementComponentRef ||
          (this.managersTabStatus === 'READY' && this.executiveManagementComponentRef.list.length > 0);
      }
    },
    contactOfficer: {
      name: 'contactOfficer',
      langKey: 'managers',
      validStatus: () => {
        return this.form && this.form.get('contactOfficer')?.valid;
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
    private licenseService: LicenseService,
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
    const value = (new ExternalOrgAffiliation()).clone({ ...this.model, ...this.form.value.basicInfo });

    value.bankAccountDTOs = this.bankAccountComponentRef.list;
    value.executiveManagementDTOs = this.executiveManagementComponentRef.list;
    value.contactOfficerDTOs = [this.contactOfficerTab.value];
    return value;
  }
  _initComponent(): void {
    this.loadCountries();
    this.listenToLicenseSearch();
  }
  _buildForm(): void {
    this.form = new FormGroup({
      basicInfo: this.fb.group((new ExternalOrgAffiliation()).getFormFields(true)),
      contactOfficer: this.fb.group((new ContactOfficer()).getContactOfficerFields(true))
    });
  }
  _afterBuildForm(): void {
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return of(this.form.valid)
      .pipe(tap(valid => !valid && this.invalidFormMessage()));
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
    this.model = model;
    this.contactOfficerTab.setValue(
      (new ContactOfficer().clone(model?.contactOfficerDTOs[0])).getContactOfficerFields(false)
    )
    this.basicTab.patchValue(model?.getFormFields());
    this.handleRequestTypeChange(model?.requestType || 0, false);
    this.cd.detectChanges();
  }
  _resetForm(): void {
    this.form.reset();
    this.model!.bankAccountDTOs = [];
    this.model!.executiveManagementDTOs = [];
    this.model!.contactOfficerDTOs = [];
    this.operation = OperationTypes.CREATE;
  }
  loadLicencesByCriteria(criteria: (Partial<ExternalOrgAffiliationSearchCriteria> | Partial<ExternalOrgAffiliationSearchCriteria>)): (Observable<ExternalOrgAffiliationResult[] | ExternalOrgAffiliationResult[]>) {
    return this.service.licenseSearch(criteria as Partial<ExternalOrgAffiliationSearchCriteria>);
  }

  listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(exhaustMap(oldLicenseFullSerial => {
        return this.loadLicencesByCriteria({ fullSerial: oldLicenseFullSerial }).pipe(catchError(() => of([])))
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => {
          if (!list.length) {
            this.dialog.info(this.lang.map.no_result_for_your_search_criteria)
          }
        }),
        // allow only the collection if it has value
        filter(result => !!result.length),
        // switch to the dialog ref to use it later and catch the user response
        switchMap(licenses => {
          if (licenses.length === 1) {
            return this.licenseService.validateLicenseByRequestType(this.model!.getCaseType(), this.requestTypeField.value, licenses[0].id)
              .pipe(
                map((data) => {
                  if (!data) {
                    return of(null);
                  }
                  return { selected: licenses[0], details: data };
                }),
                catchError((e) => {
                  return of(null);
                })
              )
          } else {
            const displayColumns = this.service.selectLicenseDisplayColumns;
            return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({ requestType: this.requestTypeField.value || null }), true, displayColumns).onAfterClose$
          }
        }),
        // allow only if the user select license
        filter<{ selected: ExternalOrgAffiliationResult, details: ExternalOrgAffiliation }>
          ((selection: { selected: ExternalOrgAffiliationResult, details: ExternalOrgAffiliation }) => {
            return (selection && selection.selected instanceof ExternalOrgAffiliationResult && selection.details instanceof ExternalOrgAffiliation)
          }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        console.log(selection)
        // this.setSelectedLicense(selection.details, false);
      })
  }
  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    let value = '';
    if (this.requestTypeField.valid) {
      value = this.oldLicenseFullSerialField.value;
    }
    this.licenseSearch$.next(value);
  }
  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }
  private invalidFormMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }
  private loadCountries(): void {
    this.countryService.loadCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countriesList = countries);
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
  isEditOrCancel() {
    return this.isEditRequestType() || this.isCancelRequestType();
  }
  isEditRequestType(): boolean {
    return this.requestTypeField.value && (this.requestTypeField.value == AffiliationRequestType.UPDATE)
  }
  isCancelRequestType(): boolean {
    return this.requestTypeField.value && (this.requestTypeField.value === AffiliationRequestType.CANCEL);
  }

  // Get Fields
  get requestTypeField(): FormControl {
    return this.form.get('basicInfo.requestType') as FormControl;
  }
  get basicTab(): FormGroup {
    return (this.form.get('basicInfo')) as FormGroup;
  }
  get contactOfficerTab(): FormGroup {
    return (this.form.get('contactOfficer')) as FormGroup;
  }
  get oldLicenseFullSerialField(): FormControl {
    return (this.form.get('basicInfo')?.get('oldLicenseFullSerial')) as FormControl;
  }
}
