import { UserClickOn } from '@enums/user-click-on.enum';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { OpenFrom } from '@enums/open-from.enum';
import { EmployeeService } from '@services/employee.service';
import { CommonUtils } from '@helpers/common-utils';
import { ExternalOrgAffiliationResult } from '@models/external-org-affiliation-result';
import { catchError, exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ExternalOrgAffiliationSearchCriteria } from '@models/external-org-affiliation-search-criteria';
import { LicenseService } from '@services/license.service';
import { Lookup } from '@models/lookup';
import { IKeyValue } from '@contracts/i-key-value';
import { ContactOfficer } from '@models/contact-officer';
import { CountryService } from '@services/country.service';
import { Country } from '@models/country';
import { ToastService } from '@services/toast.service';
import { ExternalOrgAffiliation } from '@models/external-org-affiliation';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { OperationTypes } from '@enums/operation-types.enum';
import { SaveTypes } from '@enums/save-types';
import { LangService } from '@services/lang.service';
import { Observable, of, Subject } from 'rxjs';
import { ExternalOrgAffiliationService } from '@services/external-org-affiliation.service';
import { LookupService } from '@services/lookup.service';
import { DialogService } from '@services/dialog.service';
import { AffiliationRequestType } from '@enums/service-request-types';
import { BankAccountComponent } from '@modules/services/shared-services/components/bank-account/bank-account.component';
import {
  ExecutiveManagementComponent
} from '@app/shared/components/executive-management/executive-management.component';

@Component({
  selector: 'app-external-org-affiliation',
  templateUrl: './external-org-affiliation.component.html',
  styleUrls: ['./external-org-affiliation.component.scss']
})
export class ExternalOrgAffiliationComponent extends EServicesGenericComponent<ExternalOrgAffiliation, ExternalOrgAffiliationService> implements AfterViewInit {
  form!: UntypedFormGroup;
  AffiliationRequestType: Lookup[] = this.lookupService.listByCategory.AffiliationRequestType.sort((a, b) => a.lookupKey - b.lookupKey);
  AffiliationCategory: Lookup[] = this.lookupService.listByCategory.AffiliationCategory;
  CurrencyDropDown: Lookup[] = this.lookupService.listByCategory.Currency;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  countriesList: Country[] = [];
  licenseSearch$: Subject<string> = new Subject<string>();
  @ViewChild('bankAccountsTab') bankAccountComponentRef!: BankAccountComponent;
  @ViewChild('managersTab') executiveManagementComponentRef!: ExecutiveManagementComponent;
  selectedLicense?: ExternalOrgAffiliation;

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
        return !this.bankAccountComponentRef || this.bankAccountComponentRef.list.length > 0;
      }
    },
    managers: {
      name: 'managersTab',
      langKey: 'managers',
      validStatus: () => {
        return !this.executiveManagementComponentRef ||
           this.executiveManagementComponentRef.list.length > 0;
      }
    },
    contactOfficer: {
      name: 'contactOfficer',
      langKey: 'managers',
      validStatus: () => {
        return this.form && this.form.get('contactOfficer')?.valid;
      }
    },
    specialExplanation: {
      name: 'specialExplanationTab',
      langKey: 'special_explanations',
      validStatus: () => this.form && this.form.get('explanation')?.valid
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
  };

  constructor(
    public service: ExternalOrgAffiliationService,
    public fb: UntypedFormBuilder,
    public lang: LangService,
    private cd: ChangeDetectorRef,
    private lookupService: LookupService,
    private licenseService: LicenseService,
    private dialog: DialogService,
    private toast: ToastService,
    private countryService: CountryService,
    private employeeService: EmployeeService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  _getNewInstance(): ExternalOrgAffiliation {
    return new ExternalOrgAffiliation();
  }

  _prepareModel(): ExternalOrgAffiliation | Observable<ExternalOrgAffiliation> {
    const value = (new ExternalOrgAffiliation()).clone({
      ...this.model, ...this.form.value.basicInfo,
      ...this.specialExplanation.getRawValue()
    });

    value.bankAccountDTOs = this.bankAccountComponentRef.list ?? [];
    value.executiveManagementDTOs = this.executiveManagementComponentRef.list ?? [];
    value.contactOfficerDTOs = [this.contactOfficerTab.value];
    return value;
  }

  _initComponent(): void {
    this.loadCountries();
    this.listenToLicenseSearch();
  }

  _buildForm(): void {
    const model = new ExternalOrgAffiliation();
    this.form = new UntypedFormGroup({
      basicInfo: this.fb.group(model.getFormFields(true)),
      contactOfficer: this.fb.group((new ContactOfficer()).getContactOfficerFields(true)),
      explanation: this.fb.group(model.buildExplanation(true)),
    });
  }

  _afterBuildForm(): void {
    this.handleReadonly();
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      // if (!(this.tabsData[key].formStatus() && this.tabsData[key].listStatus())) {
      if (!(this.tabsData[key].validStatus())) {
        // @ts-ignore
        failedList.push(this.lang.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.requestTypeField.value) {
      this.dialog.error(this.lang.map.msg_please_select_x_to_continue.change({x: this.lang.map.request_type}));
      return false;
    }
    if (saveType === SaveTypes.DRAFT) {
      return true;
    }
    const invalidTabs = this._getInvalidTabs();
    if (invalidTabs.length > 0) {
      const listHtml = CommonUtils.generateHtmlList(this.lang.map.msg_following_tabs_valid, invalidTabs);
      this.dialog.error(listHtml.outerHTML);
      return false;
    } else {
      return true;
    }
  }

  _afterSave(model: ExternalOrgAffiliation, saveType: SaveTypes, operation: OperationTypes): void {
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
    console.log('problem on save');
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {
    console.log('problem on lunch');
  }

  _destroyComponent(): void {
  }

  _updateForm(model: ExternalOrgAffiliation | undefined): void {
    this.model = model;
    this.contactOfficerTab.setValue(
      (new ContactOfficer().clone(model?.contactOfficerDTOs[0])).getContactOfficerFields(false)
    );
    this.basicTab.patchValue(model?.getFormFields());
    this.specialExplanation.patchValue(model?.buildExplanation());
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

  loadLicencesByCriteria(criteria: (Partial<ExternalOrgAffiliationSearchCriteria>)): (Observable<ExternalOrgAffiliationResult[]>) {
    return this.service.licenseSearch(criteria as Partial<ExternalOrgAffiliationSearchCriteria>);
  }

  listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(exhaustMap(oldLicenseFullSerial => {
        return this.loadLicencesByCriteria({
          fullSerial: oldLicenseFullSerial,
          licenseStatus: 1
        }).pipe(catchError(() => of([])));
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => {
          if (!list.length) {
            this.dialog.info(this.lang.map.no_result_for_your_search_criteria);
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
                  return {selected: licenses[0], details: data};
                }),
                catchError(() => {
                  return of(null);
                })
              );
          } else {
            const displayColumns = this.service.selectLicenseDisplayColumns;
            return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({requestType: this.requestTypeField.value || null}), true, displayColumns).onAfterClose$;
          }
        }),
        // allow only if the user select license
        filter<{ selected: ExternalOrgAffiliationResult, details: ExternalOrgAffiliation }>
        ((selection: { selected: ExternalOrgAffiliationResult, details: ExternalOrgAffiliation }) => {
          // noinspection SuspiciousTypeOfGuard
          return (selection && selection.selected instanceof ExternalOrgAffiliationResult && selection.details instanceof ExternalOrgAffiliation);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection.details);
      });
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    let value = '';
    if (this.requestTypeField.valid) {
      value = this.oldLicenseFullSerialField.value;
    }
    this.licenseSearch$.next(value);
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
      if(this.employeeService.isExternalUser() && this.model.isReturned()){
        this.readonly = false;
      }
     
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if(this.employeeService.isExternalUser() && this.model.isReturned()){
          this.readonly = false;
        }
       
      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
     
    }
  }

  private setSelectedLicense(licenseDetails: ExternalOrgAffiliation) {
    this.selectedLicense = licenseDetails;
    let requestType = this.requestTypeField?.value,
      result: Partial<ExternalOrgAffiliation> = {
        requestType
      };

    result.oldLicenseFullSerial = licenseDetails.fullSerial;
    result.oldLicenseId = licenseDetails.id;
    result.oldLicenseSerial = licenseDetails.serial;

    result.category = licenseDetails.category;
    result.arName = licenseDetails.arName;
    result.enName = licenseDetails.enName;
    result.country = licenseDetails.country;
    result.city = licenseDetails.city;
    result.phone = licenseDetails.phone;
    result.fax = licenseDetails.fax;
    result.website = licenseDetails.website;
    result.email = licenseDetails.email;
    result.mailBox = licenseDetails.mailBox;
    result.description = licenseDetails.description;
    result.introduction = licenseDetails.introduction;
    result.bankAccountDTOs = licenseDetails.bankAccountDTOs;
    result.executiveManagementDTOs = licenseDetails.executiveManagementDTOs;
    result.contactOfficerDTOs = licenseDetails.contactOfficerDTOs;

    this._updateForm((new ExternalOrgAffiliation()).clone(result));
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  // noinspection JSUnusedLocalSymbols
  private invalidFormMessage(): void {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }

  private loadCountries(): void {
    this.countryService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countriesList = countries);
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this.resetForm$.next();
          this.requestTypeField.setValue(requestTypeValue);
        }
        this.requestType$.next(requestTypeValue);
      } else {
        this.requestTypeField.setValue(this.requestType$.value);
      }
    });
  }

  isEditOrCancel() {
    return this.isEditRequestType() || this.isCancelRequestType();
  }

  isEditRequestType(): boolean {
    return this.requestTypeField.value && (this.requestTypeField.value == AffiliationRequestType.UPDATE);
  }

  isCancelRequestType(): boolean {
    return this.requestTypeField.value && (this.requestTypeField.value === AffiliationRequestType.CANCEL);
  }

  // Get Fields
  get requestTypeField(): UntypedFormControl {
    return this.form.get('basicInfo.requestType') as UntypedFormControl;
  }

  get specialExplanation(): UntypedFormGroup {
    return this.form.get('explanation')! as UntypedFormGroup;
  }

  get basicTab(): UntypedFormGroup {
    return (this.form.get('basicInfo')) as UntypedFormGroup;
  }

  get contactOfficerTab(): UntypedFormGroup {
    return (this.form.get('contactOfficer')) as UntypedFormGroup;
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return (this.form.get('basicInfo')?.get('oldLicenseFullSerial')) as UntypedFormControl;
  }
}
