import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {DialogService} from '@app/services/dialog.service';
import {ConfigurationService} from '@app/services/configuration.service';
import {ToastService} from '@app/services/toast.service';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {CustomValidators} from '@app/validators/custom-validators';
import {FinalExternalOfficeApproval} from '@app/models/final-external-office-approval';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FinalExternalOfficeApprovalService} from '@app/services/final-external-office-approval.service';
import {Lookup} from '@app/models/lookup';
import {Country} from '@app/models/country';
import {CountryService} from '@app/services/country.service';
import {DateUtils} from '@app/helpers/date-utils';
import {ServiceRequestTypes} from '@app/enums/service-request-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {EmployeeService} from '@app/services/employee.service';
import {InitialExternalOfficeApprovalService} from '@app/services/initial-external-office-approval.service';
import {InitialApprovalDocument} from '@app/models/initial-approval-document';
import {LicenseService} from '@app/services/license.service';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {SaveTypes} from '@app/enums/save-types';
import {ReadinessStatus} from '@app/types/types';
import {BankAccountComponent} from '@app/e-services/shared/bank-account/bank-account.component';
import {ExecutiveManagementComponent} from '@app/e-services/shared/executive-management/executive-management.component';
import {BankBranchComponent} from '@app/e-services/shared/bank-branch/bank-branch.component';

@Component({
  selector: 'final-external-office-approval',
  templateUrl: './final-external-office-approval.component.html',
  styleUrls: ['./final-external-office-approval.component.scss']
})
export class FinalExternalOfficeApprovalComponent extends EServicesGenericComponent<FinalExternalOfficeApproval, FinalExternalOfficeApprovalService> implements AfterViewInit {
  form!: FormGroup;

  @ViewChild('bankAccountsTab') bankAccountComponentRef!: BankAccountComponent;
  @ViewChild('managersTab') executiveManagementComponentRef!: ExecutiveManagementComponent;
  @ViewChild('branchesTab') bankBranchComponentRef!: BankBranchComponent;

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form && this.form.valid
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
    branches: {
      name: 'branchesTab',
      langKey: 'branches',
      validStatus: () => {
        return !this.bankAccountComponentRef || (this.branchesTabStatus === 'READY' && this.bankBranchComponentRef.list.length > 0);
      }
    },
    comments: {
      name: 'commentsTab',
      langKey: 'comments',
      validStatus: () => true
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    }
  };

  requestTypesList: Lookup[] = this.lookupService.listByCategory.ServiceRequestType.sort((a, b) => a.lookupKey - b.lookupKey);
  serviceRequestTypes = ServiceRequestTypes;

  operation: OperationTypes = OperationTypes.CREATE;

  countriesList: Country[] = [];
  regionsList: Country[] = [];

  unprocessedLicensesList: any[] = [];
  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: InitialApprovalDocument;

  datepickerOptionsMap: IKeyValue = {
    establishmentDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'})
  };

  readonly: boolean = false;

  public isInternalUser: boolean = this.employeeService.isInternalUser();
  private changeModel: BehaviorSubject<FinalExternalOfficeApproval | undefined> = new BehaviorSubject<FinalExternalOfficeApproval | undefined>(new FinalExternalOfficeApproval());

  bankDetailsTabStatus: ReadinessStatus = 'READY';
  managersTabStatus: ReadinessStatus = 'READY';
  branchesTabStatus: ReadinessStatus = 'READY';

  constructor(public lang: LangService,
              private cd: ChangeDetectorRef,
              public service: FinalExternalOfficeApprovalService,
              private initialApprovalService: InitialExternalOfficeApprovalService,
              public lookupService: LookupService,
              private licenseService: LicenseService,
              private dialogService: DialogService,
              public employeeService: EmployeeService,
              private configurationService: ConfigurationService,
              private toastService: ToastService,
              private countryService: CountryService,
              public fb: FormBuilder) {
    super();
  }

  ngAfterViewInit() {
    this._handleRequestTypeDependentValidations();
    this.cd.detectChanges();
  }

  _getNewInstance(): FinalExternalOfficeApproval {
    return new FinalExternalOfficeApproval();
  }

  _initComponent(): void {
    this.loadCountries();
    this.listenToLicenseSearch();
  }

  _buildForm(): void {
    const finalExternalOfficeApproval = new FinalExternalOfficeApproval();
    this.form = this.fb.group({
      basicInfo: this.fb.group(finalExternalOfficeApproval.getFormFields(true))
    });
  }

  _afterBuildForm(): void {
    this.listenToRequestTypeChange();
    this.listenToCountryChange();
    if (this.fromDialog) {
      this.loadSelectedLicense(this.model?.licenseNumber!);
    }
  }

  private _handleRequestTypeDependentValidations(): void {
    /*if (this.operation === OperationTypes.UPDATE) {

    }
    if (this.requestTypeField.value === this.serviceRequestTypes.UPDATE || this.requestTypeField.value === this.serviceRequestTypes.RENEW) {
      this.countryField.disable();
      this.regionField.disable();
    } else {
      this.countryField.enable();
      this.regionField.enable();
    }*/

    /*if (this.requestTypeField.value === this.serviceRequestTypes.EXTEND || this.requestTypeField.value === this.serviceRequestTypes.CANCEL) {
      this.basicTab.disable();
      this.specialExplanationField.enable();
    } else {
      this.basicTab.enable();
    }*/
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
    if (saveType == SaveTypes.DRAFT) {
      return true;
    }
    if (!this.selectedLicense) {
      this.dialogService.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
      const invalidTabs = this._getInvalidTabs();
      if (invalidTabs.length > 0) {
        const listHtml = CommonUtils.generateHtmlList(this.lang.map.msg_following_tabs_valid, invalidTabs);
        this.dialogService.error(listHtml.outerHTML);
        return false;
      } else {
        return true;
      }
    }
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this.toastService.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): FinalExternalOfficeApproval | Observable<FinalExternalOfficeApproval> {
    let value = (new FinalExternalOfficeApproval()).clone({...this.model, ...this.form.value.basicInfo});
    // if new request, and selected licence is available, use the licence number from selected licence instead of value in field
    if (!value.id && this.selectedLicense) {
      if (this.requestTypeField.value === this.serviceRequestTypes.NEW) {
        value.initialLicenseNumber = this.selectedLicense.licenseNumber;
      } else {
        value.licenseNumber = this.selectedLicense.licenseNumber
      }
    }
    value.bankAccountList = this.bankAccountComponentRef.list;
    value.executiveManagementList = this.executiveManagementComponentRef.list;
    value.branchList = this.bankBranchComponentRef.list;
    return value;
  }

  _afterSave(model: FinalExternalOfficeApproval, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialogService.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toastService.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {
    console.log('problem on save');
  }

  _launchFail(error: any): void {
    console.log(error);
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _updateForm(model: FinalExternalOfficeApproval): void {
    this.model = model;
    this.form.patchValue(model.getFormFields());
  }

  _resetForm(): void {
    this.form.reset();
    this.setDefaultValuesForExternalUser();
    this.bankAccountComponentRef.forceClearComponent();
    this.executiveManagementComponentRef.forceClearComponent();
    this.bankBranchComponentRef.forceClearComponent();
  }

  getFieldInvalidStatus(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && (ctrl?.touched || ctrl?.dirty));
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  private loadCountries(): void {
    this.countryService.loadCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countriesList = countries)
  }

  private setDefaultValuesForExternalUser(): void {
    if (!this.employeeService.isExternalUser() || this.operation !== this.operationTypes.CREATE) {
      return;
    }
    this.form.get('email')?.patchValue(this.employeeService.getUser()?.email);
    this.form.get('phone')?.patchValue(this.employeeService.getUser()?.phoneNumber);
  }

  listenToCountryChange(): void {
    this.countryField?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.regionField?.reset();
      this.loadRegionsList();
    });
  }

  private loadRegionsList(): void {
    this.regionsList = [];
    if (!this.countryField?.value) {
      return;
    }
    this.countryService.loadCountriesByParentId(this.countryField?.value)
      .subscribe((result: Country[]) => {
        this.regionsList = result;
      });
  }

  listenToRequestTypeChange(): void {
    this.requestTypeField?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this._handleRequestTypeDependentValidations();
      this.initialLicenseNumberField?.setValue(null);
      this.licenseNumberField?.setValue(null);
      this.selectedLicense = undefined;

      if (!CommonUtils.isValidValue(value)) {
        this.initialLicenseNumberField?.disable();
        this.licenseNumberField?.disable();
      } else {
        if (value === this.serviceRequestTypes.NEW) {
          this.initialLicenseNumberField?.enable();
          this.initialLicenseNumberField?.setValidators([CustomValidators.required]);
          this.licenseNumberField?.setValidators([]);
          this.licenseNumberField?.disable();
        } else {
          this.licenseNumberField?.enable();
          this.licenseNumberField?.setValidators([CustomValidators.required]);
          this.initialLicenseNumberField?.setValidators([]);
          this.initialLicenseNumberField?.disable();
        }
        this.initialLicenseNumberField.updateValueAndValidity();
        this.licenseNumberField.updateValueAndValidity();
      }
    });
  }

  licenseSearch($event: Event): void {
    $event.preventDefault();
    let value = '';
    if (this.requestTypeField.valid) {
      value = this.requestTypeField.value === this.serviceRequestTypes.NEW ? this.initialLicenseNumberField.value : this.licenseNumberField.value;
    }
    if (!CommonUtils.isValidValue(value)) {
      this.dialogService.info(this.lang.map.need_license_number_to_search);
      return;
    }
    this.licenseSearch$.next(value);
  }

  listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(exhaustMap(value => {
        if (this.requestTypeField?.value === this.serviceRequestTypes.NEW) {
          return this.loadInitialLicencesByCriteria(value)
            .pipe(catchError(() => of([])))
        } else {
          return this.loadFinalLicencesByCriteria(value)
            .pipe(catchError(() => of([])))
        }
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => {
          if (!list.length) {
            this.dialogService.info(this.lang.map.no_result_for_your_search_criteria)
          }
        }),
        // allow only the collection if it has value
        filter(result => !!result.length),
        // switch to the dialog ref to use it later and catch the user response
        switchMap(license => this.licenseService.openSelectLicenseDialog(license).onAfterClose$),
        // allow only if the user select license
        filter<null | InitialApprovalDocument, InitialApprovalDocument>
        ((selection): selection is InitialApprovalDocument => selection instanceof InitialApprovalDocument),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license);
      })
  }

  private setSelectedLicense(license?: InitialApprovalDocument) {
    this.selectedLicense = license;
    if (license) {
      this.basicTab.patchValue({
        initialLicenseNumber: license.licenseNumber,
        country: license.country,
        region: license.region
      });
    }
  }


  private loadSelectedLicense(licenseNumber: string): void {
    if (!this.model || !licenseNumber) {
      return;
    }
    let response;
    if (this.requestTypeField?.value === this.serviceRequestTypes.NEW) {
      response = this.loadInitialLicencesByCriteria(licenseNumber);
    } else {
      response = this.loadFinalLicencesByCriteria(licenseNumber);
    }
    response.pipe(
      filter(list => !!list.length),
      map(list => list[0]),
      takeUntil(this.destroy$)
    )
      .subscribe((license) => {
        this.setSelectedLicense(license)
      })
  }

  viewLicense(): void {
    if (!this.selectedLicense)
      return;

    this.licenseService.openSelectLicenseDialog([this.selectedLicense], false)
  }

  loadInitialLicencesByCriteria(value: any): Observable<InitialApprovalDocument[]> {
    return this.initialApprovalService.licenseSearch({licenseNumber: value});
  }

  loadFinalLicencesByCriteria(value: any): Observable<InitialApprovalDocument[]> {
    return this.service.licenseSearch({licenseNumber: value});
  }

  get basicTab(): FormGroup {
    return (this.form.get('basicInfo')) as FormGroup;
  }

  get requestTypeField(): FormControl {
    return (this.form.get('basicInfo')?.get('requestType')) as FormControl;
  }

  get initialLicenseNumberField(): FormControl {
    return (this.form.get('basicInfo')?.get('initialLicenseNumber')) as FormControl;
  }

  get licenseNumberField(): FormControl {
    return (this.form.get('basicInfo')?.get('licenseNumber')) as FormControl;
  }

  get countryField(): FormControl {
    return (this.form.get('basicInfo')?.get('country')) as FormControl;
  }

  get regionField(): FormControl {
    return (this.form.get('basicInfo')?.get('region')) as FormControl;
  }

  get establishmentDateField(): FormControl {
    return (this.form.get('basicInfo')?.get('establishmentDate')) as FormControl;
  }

  get specialExplanationField(): FormControl {
    return (this.form.get('basicInfo')?.get('description')) as FormControl;
  }
}
