import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { ImplementingAgencyTypes } from '@app/enums/implementing-agency-types.enum';
import { OpenFrom } from '@app/enums/open-from.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { ServiceRequestTypes } from '@app/enums/service-request-types';
import { SubmissionMechanisms } from '@app/enums/submission-mechanisms.enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';
import { Bank } from '@app/models/bank';
import { BankAccount } from '@app/models/bank-account';
import { FinancialTransferLicensing } from '@app/models/financial-transfer-licensing';
import { FinancialTransferLicensingSearchCriteria } from '@app/models/financial-transfer-licesing-search-criteria';
import { Lookup } from '@app/models/lookup';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { FinalExternalOfficeApprovalService } from '@app/services/final-external-office-approval.service';
import { FinancialTransferLicensingService } from '@app/services/financial-transfer-licensing.service';
import { LangService } from '@app/services/lang.service';
import { LicenseService } from '@app/services/license.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import {
  DatepickerOptionsMap,
  ReadinessStatus,
  TabMap,
} from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { CountryService } from '@services/country.service';
import { Observable, of, Subject } from 'rxjs';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { FinancialTransferRequestTypes } from '../../../../enums/financial-transfer-request-types.enum';
import { FinancialTransferTypes } from '../../../../enums/financial-transfer-types.enum';
import { FinancialTransfereeTypes } from '../../../../enums/financial-transferee-types.enum';
import { AdminResult } from '../../../../models/admin-result';
import { Country } from '../../../../models/country';
import { FinalExternalOfficeApproval } from '../../../../models/final-external-office-approval';
import { PartnerApproval } from '../../../../models/partner-approval';
import { CommonService } from '../../../../services/common.service';
import { PartnerApprovalService } from '../../../../services/partner-approval.service';
import { FinancialTransfersProjectsComponent } from '../../shared/financial-transfers-projects/financial-transfers-projects.component';

@Component({
  selector: 'app-financial-transfers-licensing',
  templateUrl: './financial-transfers-licensing.component.html',
  styleUrls: ['./financial-transfers-licensing.component.scss'],
})
export class FinancialTransfersLicensingComponent extends EServicesGenericComponent<
  FinancialTransferLicensing,
  FinancialTransferLicensingService
> {
  constructor(
    public fb: UntypedFormBuilder,
    public service: FinancialTransferLicensingService,
    public employeeService: EmployeeService,
    public lang: LangService,
    private cd: ChangeDetectorRef,
    private toastService: ToastService,
    private dialogService: DialogService,
    private lookupService: LookupService,
    private licenseService: LicenseService,
    private countryService: CountryService,
    private commonService: CommonService,
    private partnerApprovalService: PartnerApprovalService,
    private finalExternalOfficeApprovalService: FinalExternalOfficeApprovalService
  ) {
    super();
    this.submissionMechanism =
      this.employeeService.getProfile()?.submissionMechanism ?? 1;
  }

  //#region Setup
  form!: UntypedFormGroup;
  loadAttachments: boolean = false;
  requestTypesList: Lookup[] =
    this.lookupService.listByCategory.FinancialTransferRequestType.sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  financialTransferTypeList: Lookup[] =
    this.lookupService.listByCategory.FinancialTransferType.sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  financialTransfereeTypeList: Lookup[] =
    this.lookupService.listByCategory.FinancialTransfereeType.sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  financialTransferRequestTypeList: Lookup[] =
    this.lookupService.listByCategory.FinancialTransferRequestType.sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  submissionMechanisms: Lookup[] =
    this.lookupService.listByCategory.SubmissionMechanism.sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  implementingAgencyType: Lookup[] =
    this.lookupService.listByCategory.ImplementingAgencyType.sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  currencies: Lookup[] = this.lookupService.listByCategory.Currency.sort(
    (a, b) => a.lookupKey - b.lookupKey
  );

  datepickerOptionsMap: DatepickerOptionsMap = {
    actualTransferDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'none',
    }),
  };
  countries: Country[] = [];
  licenseSearch$: Subject<string> = new Subject<string>();
  authorizedEntitySearch$: Subject<{ type: number; country: number }> =
    new Subject();
  preRegisteredSearch$: Subject<null> = new Subject();
  selectedLicense?: FinancialTransferLicensing;
  authorizedEntityBankAccounts: BankAccount[] = [];
  transferEntityBankAccounts: BankAccount[] = [];
  bankAccountsControl!: UntypedFormControl;

  financialTransfersProjectsTabStatus: ReadinessStatus = 'READY';
  @ViewChild('financialTransfersProjectsTab')
  financialTransfersProjectsComponentRef!: FinancialTransfersProjectsComponent;
  submissionMechanism!: number;
  tabsData: TabMap = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => this.basicInfoTab && this.basicInfoTab.valid,
    },
    transferOperationGroup: {
      name: 'transferOperationTab',
      langKey: 'transfer_operation',
      index: 1,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return this.transferOperationGroup && this.transferOperationGroup.valid;
      },
    },
    transfereeBankAccountGroup: {
      name: 'transfereeBankAccountTab',
      langKey: 'transferee_bank_account',
      index: 2,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () => {
        return (
          this.transfereeBankAccountGroup &&
          this.transfereeBankAccountGroup.valid
        );
      },
    },
    transferBankAccountGroup: {
      name: 'transfereeBankAccountTab',
      langKey: 'transfer_bank_account',
      index: 3,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () => {
        return (
          this.transferBankAccountGroup && this.transferBankAccountGroup.valid
        );
      },
    },
    financialTransfersProjects: {
      name: 'financialTransfersProjectsTab',
      langKey: 'financial_transfers_projects',
      index: 4,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => true,
      show: () => this.isFinancialTransfersProjectsRequired(),
      validStatus: () => true,
    },
    affidavitOfCompletionGroup: {
      name: 'affidavitOfCompletionTab',
      langKey: 'affidavit_of_completion',
      index: 5,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () => {
        return (
          this.affidavitOfCompletionGroup &&
          this.affidavitOfCompletionGroup.valid
        );
      },
    },
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      index: 6,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () =>
        this.specialExplanationsField && this.specialExplanationsField.valid,
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 7,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true,
    },
  };
  tabIndex$: Subject<number> = new Subject<number>();
  ngAfterViewInit(): void {
    this.cd.detectChanges();
    this._listenToTransferTypeChange();
    this._listenToTargetCountryChange();
    this._listenToTransfereeTypeChange();
    this._listenToCountryChange();
    this._listenToBankAccountsChange();
  }
  //#endregion

  //#region Case Model
  _initComponent(): void {
    this._loadCountries();
    this._listenToLicenseSearch();
    this._listenToAuthorizedEntitySearch();
    this._listenToPreRegisteredSearch();
    this._loadTransferEntityBankAccounts();
    this._loadExternalProjects();
  }

  _buildForm(): void {
    let objFinancialTransferLicensing = this._getNewInstance();
    this.form = this.fb.group({
      basicInfo: this.fb.group(
        objFinancialTransferLicensing.getBasicInfoFields(true)
      ),
      transferOperation: this.fb.group(
        objFinancialTransferLicensing.getTransferOperationFields(true)
      ),
      transfereeBankAccount: this.fb.group(
        objFinancialTransferLicensing.getTransfereeBankAccountFields(true)
      ),
      transferBankAccount: this.fb.group(
        objFinancialTransferLicensing.getTransferBankAccountFields(true)
      ),
      financialTransfersProjects: this.fb.array([]),
      affidavitOfCompletion: this.fb.group(
        objFinancialTransferLicensing.getAffidavitOfCompletionFields(true)
      ),
      description: this.fb.control(objFinancialTransferLicensing.description),
    });
    this.bankAccountsControl = this.fb.control([]);
  }

  _afterBuildForm(): void {
    this.handleReadonly();
    if (!this.model?.id) {
      this._setDefaultValues();
    }
    if (this.fromDialog) {
      this._loadSelectedLicenseById(this.model!.oldLicenseId, () => {
        this.oldLicenseFullSerialField.updateValueAndValidity();
      });
    }
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toastService.success(this.lang.map.request_has_been_sent_successfully);
  }

  _afterSave(
    model: FinancialTransferLicensing,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    this._updateModelAfterSave(model);

    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialogService.success(
        this.lang.map.msg_request_has_been_added_successfully.change({
          serial: model.fullSerial,
        })
      );
    } else {
      this.toastService.success(
        this.lang.map.request_has_been_saved_successfully
      );
    }
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (
      this.requestTypeField.value !== ServiceRequestTypes.NEW &&
      !this.selectedLicense
    ) {
      this.dialogService.error(
        this.lang.map.please_select_license_to_complete_save
      );
      return false;
    } else {
      if (saveType === SaveTypes.DRAFT) {
        return true;
      }
      const invalidTabs = this._getInvalidTabs();
      if (invalidTabs.length > 0) {
        const listHtml = CommonUtils.generateHtmlList(
          this.lang.map.msg_following_tabs_valid,
          invalidTabs
        );
        this.dialogService.error(listHtml.outerHTML);
        return false;
      }
      return true;
    }
  }

  _destroyComponent(): void {

  }

  _getNewInstance(): FinancialTransferLicensing {
    return new FinancialTransferLicensing().clone();
  }

  _launchFail(error: any): void {
    console.log('problem in launch');
  }

  _prepareModel():
    | Observable<FinancialTransferLicensing>
    | FinancialTransferLicensing {
    return new FinancialTransferLicensing().clone({
      ...this.model,
      ...this.basicInfoTab.getRawValue(),
      ...this.transferOperationGroup.getRawValue(),
      ...this.transfereeBankAccountGroup.getRawValue(),
      ...this.transferBankAccountGroup.getRawValue(),
      ...this.financialTransfersProjects.getRawValue(),
      ...this.affidavitOfCompletionGroup.getRawValue(),
      description: this.specialExplanationsField.value,
    });
  }
  _setDefaultValues(): void {
    this.requestTypeField.setValue(ServiceRequestTypes.NEW);
    this.handleRequestTypeChange(ServiceRequestTypes.NEW, false);
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.bankAccountsControl.reset();
    this.operation = this.operationTypes.CREATE;
    this.setSelectedLicense(undefined, true);
    this._setDefaultValues();
  }

  _saveFail(error: any): void {
    console.log('problem in save');
  }

  _updateForm(model: FinancialTransferLicensing | undefined): void {
    this.model = model;
    if (!model) {
      this.cd.detectChanges();
      return;
    }
    // patch the form here
    this.form.patchValue({
      basicInfo: model.getBasicInfoFields(),
      transferOperation: model.getTransferOperationFields(),
      transfereeBankAccount: model.getTransfereeBankAccountFields(),
      transferBankAccount: model.getTransferBankAccountFields(),
      affidavitOfCompletion: model.getAffidavitOfCompletionFields(),
      description: model.description,
    });
    this.handleRequestTypeChange(model.requestType, false);
    this.cd.detectChanges();
  }

  //#endregion

  //#region Privates
  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      if (!this.tabsData[key].validStatus()) {
        // @ts-ignore
        failedList.push(this.lang.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }
  private _updateModelAfterSave(model: FinancialTransferLicensing): void {
    if (
      (this.openFrom === OpenFrom.USER_INBOX ||
        this.openFrom === OpenFrom.TEAM_INBOX) &&
      this.model?.taskDetails &&
      this.model.taskDetails.tkiid
    ) {
      this.service.getTask(this.model.taskDetails.tkiid).subscribe((model) => {
        this.model = model;
      });
    } else {
      this.model = model;
    }
  }
  private _handleLicenseValidationsByRequestType(): void {
    let requestTypeValue = this.requestTypeField && this.requestTypeField.value;
    // set validators to empty
    if (!requestTypeValue || requestTypeValue === ServiceRequestTypes.NEW) {
      this.oldLicenseFullSerialField?.setValidators([]);
      if (!this.model?.id || this.model.canCommit()) {
        this.oldLicenseFullSerialField?.setValue(null);
        this.setSelectedLicense(undefined, true);

        if (this.model) {
          this.model.licenseNumber = '';
          this.model.licenseDuration = 0;
          this.model.licenseStartDate = '';
        }
      }
    } else {
      this.oldLicenseFullSerialField?.setValidators([
        CustomValidators.required,
        CustomValidators.maxLength(250),
      ]);
    }
    this.oldLicenseFullSerialField.updateValueAndValidity();
  }
  private _handleAffidavitOfCompletionFieldsValidations(): void {
    this._resetAffidavitOfCompletionGroup();

    const isAffidavitOfCompletionRequired =
      this.requestType$.value ===
        FinancialTransferRequestTypes.TRANSFER_STATEMENT_TRANSFERRED &&
      this.submissionMechanism === SubmissionMechanisms.NOTIFICATION;

    if (isAffidavitOfCompletionRequired) {
      this._addRequiredToAffidavitOfCompletionGroup();
    }
    this.currency.updateValueAndValidity();
    this.currencyTransferTransactionAmount.updateValueAndValidity();
    this.actualTransferDate.updateValueAndValidity();
    this.transferNumber.updateValueAndValidity();
  }
  private _resetAffidavitOfCompletionGroup() {
    this.currency.setValidators([]);
    this.currencyTransferTransactionAmount.setValidators([
      CustomValidators.decimal(CustomValidators.defaultLengths.DECIMAL_PLACES),
    ]);
    this.actualTransferDate.setValidators([]);
    this.transferNumber.setValidators([
      CustomValidators.number,
      CustomValidators.maxLength(
        CustomValidators.defaultLengths.ENGLISH_NAME_MAX
      ),
    ]);
  }
  private _addRequiredToAffidavitOfCompletionGroup() {
    this.currency.addValidators([CustomValidators.required]);
    this.currencyTransferTransactionAmount.addValidators([
      CustomValidators.required,
    ]);
    this.actualTransferDate.addValidators([CustomValidators.required]);
    this.transferNumber.addValidators([CustomValidators.required]);
  }
  private _loadSelectedLicenseById(id: string, callback?: any): void {
    if (!id) {
      return;
    }
    this.licenseService
      .loadFinancialTransferLicensingByLicenseId(id)
      .pipe(
        filter((license) => !!license),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(
          license.convertToFinancialTransferLicensing(),
          true
        );

        callback && callback();
      });
  }

  private _listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((oldLicenseFullSerial) => {
          return this.loadLicensesByCriteria({
            fullSerial: oldLicenseFullSerial,
          }).pipe(catchError(() => of([])));
        })
      )
      .pipe(
        // display message in case there is no returned license
        tap((list) =>
          !list.length
            ? this.dialogService.info(
                this.lang.map.no_result_for_your_search_criteria
              )
            : null
        ),
        // allow only the collection if it has value
        filter((result) => !!result.length),
        exhaustMap((licenses) => {
          return licenses.length === 1
            ? this._validateSingleLicense(licenses[0]).pipe(
                map((data) => {
                  if (!data) {
                    return of(null);
                  }
                  return licenses[0];
                }),
                catchError(() => {
                  return of(null);
                })
              )
            : this._openSelectLicense(licenses);
        }),
        filter((info): info is FinancialTransferLicensing => {
          return !!info;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection, false);
      });
  }
  private _listenToAuthorizedEntitySearch() {
    this.authorizedEntitySearch$
      .pipe(
        takeUntil(this.destroy$),
        filter((searchEntity) => !!searchEntity.type && !!searchEntity.country)
      )
      .pipe(
        exhaustMap((searchEntity) =>
          this.commonService
            .loadAgenciesByAgencyTypeAndCountry(
              searchEntity.type,
              searchEntity.country
            )
            .pipe(catchError(() => of([])))
        )
      )
      .pipe(
        exhaustMap((list) => this._openSelectAuthorizedEntities(list)),

        filter((info): info is AdminResult => {
          return !!info;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.transferringEntityName.setValue(selection.getName());
      });
  }
  private _listenToPreRegisteredSearch() {
    this.preRegisteredSearch$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((_) =>
          this.service.search({}).pipe(catchError(() => of([])))
        )
      )
      .pipe(
        exhaustMap((list) => this._openSelectedPreRegisteredEntities(list)),

        filter((info): info is FinancialTransferLicensing => {
          return !!info;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.transferringEntityName.setValue(selection.transferringEntityName);
        this.transferAccountNumber.setValue(selection.transferAccountNumber);
        this.transfereeIBAN.setValue(selection.transfereeIBAN);
        this.transfereeBankName.setValue(selection.transfereeBankName);
      });
  }
  private _validateSingleLicense(
    license: FinancialTransferLicensing
  ): Observable<undefined | FinancialTransferLicensing> {
    return this.licenseService.validateLicenseByRequestType<FinancialTransferLicensing>(
      this.model!.caseType,
      this.requestTypeField.value,
      license.id
    ) as Observable<undefined | FinancialTransferLicensing>;
  }

  private _openSelectLicense(
    licenses: FinancialTransferLicensing[]
  ): Observable<undefined | FinancialTransferLicensing> {
    console.log(licenses);

    return this.licenseService
      .openSelectLicenseDialog(
        licenses,
        this.model?.clone({ requestType: this.requestTypeField.value || null }),
        true,
        this.service.selectLicenseDisplayColumnsReport
      )
      .onAfterClose$.pipe(
        map(
          (
            result:
              | {
                  selected: FinancialTransferLicensing;
                  details: FinancialTransferLicensing;
                }
              | undefined
          ) => {
            return result ? result.selected : result;
          }
        )
      );
  }
  private _openSelectAuthorizedEntities(
    entities: AdminResult[]
  ): Observable<undefined | AdminResult> {
    const service = this._getSearchService();
    return this.service
      .openAuthorizedSelect(
        entities,
        true,
        ['arName', 'enName', 'actions'],
        service
      )
      .onAfterClose$.pipe(
        map(
          (
            result:
              | {
                  selected: AdminResult;
                  details: PartnerApproval | FinalExternalOfficeApproval;
                }
              | undefined
          ) => {
            if (result) {
              this.service
                .openBankAccountSelect(result.details.bankAccountList, true, [
                  'accountNumber',
                  'bankName',
                  'iBan',
                  'actions',
                ])
                .onAfterClose$.pipe(
                  take(1),
                  map((bankAccount: BankAccount) => {
                    this.transfereeBankName.setValue(bankAccount.bankName);
                    this.transfereeIBAN.setValue(bankAccount.iBan);
                    this.transferAccountNumber.setValue(
                      bankAccount.accountNumber
                    );
                  })
                )
                .subscribe();
            }

            return result ? result.selected : result;
          }
        )
      );
  }
  private _openSelectedPreRegisteredEntities(
    entities: FinancialTransferLicensing[]
  ): Observable<undefined | FinancialTransferLicensing> {
    return this.service
      .openPreRegisteredSelect(entities, true, [
        'fullSerial',
        'transferringEntityName',
        'transferAccountNumber',
        'transfereeIBAN',
        'transfereeBankName',
        'actions',
      ])
      .onAfterClose$.pipe(
        map(
          (
            result:
              | {
                  selected: FinancialTransferLicensing;
                  details: FinancialTransferLicensing;
                }
              | undefined
          ) => {
            return result ? result.selected : result;
          }
        )
      );
  }
  private _loadCountries() {
    this.countryService
      .loadAsLookups()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          return of([]);
        })
      )
      .subscribe((result) => (this.countries = result));
  }
  private _loadTransferEntityBankAccounts() {
    this.service
      .loadOrganizationBankAccounts(this.employeeService.getProfile()?.id!)
      .subscribe((accounts) => {
        this.transferEntityBankAccounts = [...accounts];
      });
  }
  private _loadExternalProjects() {
    this.service
      .loadEternalProjects(this.employeeService.getProfile()?.id!)
      .subscribe();
  }
  private _listenToTransferTypeChange() {
    this.transferType.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap((_) => {
          this.model!.financialTransfersProjects = [];
          this.tabsData.financialTransfersProjects.validStatus = () => true;
          this.qatariTransactionAmount.reset();
          this.transfereeType.reset();
          if (this.isExternalTransferType()) {
            this.transfereeType.setValue(
              FinancialTransfereeTypes.AUTHORIZED_ENTITY
            );
          }
          if (this.isQatariTransactionAmountAllowed()) {
            this.tabsData.financialTransfersProjects.validStatus = () =>
              this.isFinancialProjectsRequired();
          }
        })
      )
      .subscribe();
  }
  private _listenToTargetCountryChange() {
    this.targetCountry.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap((value) => this.country.setValue(value))
      )
      .subscribe();
  }
  private _listenToCountryChange() {
    this.country.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap((_) =>
          this.isExternalTransferType()
            ? this._resetTransfereeBankAccountGroup(false)
            : this._resetTransfereeBankAccountGroup()
        )
      )
      .subscribe();
  }
  private _listenToTransfereeTypeChange() {
    this.transfereeType.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap((value) => {
          this.receiverType.setValidators([]);
          this._resetTransfereeBankAccountGroup();
          if (value === FinancialTransfereeTypes.NEW_ENTITY) {
            this.model &&
              (this.model.receiverType = ImplementingAgencyTypes.None);
            this.receiverType.reset();
          }
          if (value === FinancialTransfereeTypes.AUTHORIZED_ENTITY) {
            this.receiverType.setValidators([CustomValidators.required]);
            this.receiverType.setValue(ImplementingAgencyTypes.Partner);
          }
          this.receiverType.updateValueAndValidity();
        })
      )
      .subscribe();
  }
  private _getSearchService() {
    return this.receiverType.value === ImplementingAgencyTypes.Partner
      ? this.partnerApprovalService
      : this.finalExternalOfficeApprovalService;
  }
  private _resetTransfereeBankAccountGroup(resetReceiver = true) {
    if (resetReceiver) {
      this.receiverType.reset();
    }
    this.transferringEntityName.reset();
    this.transferAccountNumber.reset();
    this.transfereeIBAN.reset();
    this.transfereeBankName.reset();
  }

  private _listenToBankAccountsChange() {
    this.bankAccountsControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap((bankAccount: BankAccount) => {
          if(bankAccount){
            this.bankName.setValue(
              new Bank().clone(bankAccount.bankInfo).getName()
            );
            this.transferFromIBAN.setValue(bankAccount.iBAN);
            this.accountNumber.setValue(bankAccount.accountNumber);
          }
        })
      )
      .subscribe();
  }
  //#endregion

  //#region UI Functions
  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  handleRequestTypeChange(
    requestTypeValue: number,
    userInteraction: boolean = false
  ): void {
    of(userInteraction)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.confirmChangeRequestType(userInteraction))
      )
      .subscribe((clickOn: UserClickOn) => {
        if (clickOn === UserClickOn.YES) {
          if (userInteraction) {
            this.resetForm$.next();
            this.requestTypeField.setValue(requestTypeValue);
          }
          this.requestType$.next(requestTypeValue);

          this._handleLicenseValidationsByRequestType();
          this._handleAffidavitOfCompletionFieldsValidations();
        } else {
          this.requestTypeField.setValue(this.requestType$.value);
        }
      });
  }

  isAttachmentReadonly(): boolean {
    if (!this.model?.id) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }
    if (isAllowed) {
      let caseStatus = this.model.getCaseStatus();
      isAllowed =
        caseStatus !== CommonCaseStatus.CANCELLED &&
        caseStatus !== CommonCaseStatus.FINAL_APPROVE &&
        caseStatus !== CommonCaseStatus.FINAL_REJECTION;
    }
    return !isAllowed;
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus();
    if (
      caseStatus == CommonCaseStatus.FINAL_APPROVE ||
      caseStatus === CommonCaseStatus.FINAL_REJECTION
    ) {
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
      // if saved as draft, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }
  isFinancialTransfersProjectsRequired(): boolean {
    return (
      this.transferType.value ===
        FinancialTransferTypes.PROJECTS_FOR_EXECUTING_AGENCY ||
      this.transferType.value === FinancialTransferTypes.PROJECTS_TO_OTHERS
    );
  }
  isEditRequestTypeAllowed(): boolean {
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  isEditLicenseAllowed(): boolean {
    let isAllowed =
      !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return (
      isAllowed &&
      CommonUtils.isValidValue(this.requestTypeField.value) &&
      this.requestTypeField.value !== ServiceRequestTypes.NEW
    );
  }

  isQatariTransactionAmountAllowed(): boolean {
    return (
      this.transferType.value ===
        FinancialTransferTypes.PROJECTS_FOR_EXECUTING_AGENCY ||
      this.transferType.value === FinancialTransferTypes.PROJECTS_TO_OTHERS
    );
  }

  isEditReceiverTypeAllowed(): boolean {
    return (
      !this.isExternalTransferType() &&
      this.transfereeType.value === FinancialTransfereeTypes.AUTHORIZED_ENTITY
    );
  }
  isSearchAuthorizedEntityAllowed() {
    return (
      this.transfereeType.value === FinancialTransfereeTypes.AUTHORIZED_ENTITY
    );
  }
  isPreRegisteredEntityAllowed() {
    return (
      this.transfereeType.value ===
      FinancialTransfereeTypes.PRE_REGISTERED_ENTITY
    );
  }
  isEditTransfereeAllowed(): boolean {
    return this.transfereeType.value
      ? this.transfereeType.value === FinancialTransfereeTypes.NEW_ENTITY
      : false;
  }
  isExternalTransferType(): boolean {
    return (
      this.transferType.value ===
        FinancialTransferTypes.PROJECTS_FOR_EXECUTING_AGENCY ||
      this.transferType.value ===
        FinancialTransferTypes.OVERSEAS_OFFICE_OPERATING_EXPENSES
    );
  }
  isFinancialProjectsRequired(): boolean {
    return (
      !!this.financialTransfersProjectsComponentRef &&
      this.financialTransfersProjectsTabStatus === 'READY' &&
      this.financialTransfersProjectsComponentRef.list.length > 0
    );
  }
  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    const value =
      this.oldLicenseFullSerialField.value &&
      this.oldLicenseFullSerialField.value.trim();
    this.licenseSearch$.next(value);
  }

  transfereeEntitySearch($event?: Event): void {
    $event?.preventDefault();
    if (this.isExternalTransferType()) {
      if (!this.receiverType.value) {
        this.dialogService.info(this.lang.map.entity_type_required);
        return;
      }
      if (!this.targetCountry.value) {
        this.dialogService.info(this.lang.map.transfer_to_country_required);
        return;
      }
      this.authorizedEntitySearch$.next({
        type: this.receiverType.value,
        country: this.targetCountry.value,
      });
      return;
    }
    const transfereeType = this.transfereeType.value;
    if (transfereeType === FinancialTransfereeTypes.AUTHORIZED_ENTITY) {
      if (!this.receiverType.value) {
        this.dialogService.info(this.lang.map.entity_type_required);
        return;
      }
      if (!this.country.value) {
        this.dialogService.info(this.lang.map.execution_country_required);
        return;
      }

      this.authorizedEntitySearch$.next({
        type: this.receiverType.value,
        country: this.country.value,
      });
      return;
    }
    if (transfereeType === FinancialTransfereeTypes.PRE_REGISTERED_ENTITY) {
      if (this.transferType.value) {
      }

      this.preRegisteredSearch$.next();
      return;
    }
  }
  loadLicensesByCriteria(
    criteria: Partial<FinancialTransferLicensingSearchCriteria>
  ): Observable<FinancialTransferLicensing[]> {
    return this.service.licenseSearch(criteria);
  }

  setSelectedLicense(
    licenseDetails: FinancialTransferLicensing | undefined,
    ignoreUpdateForm: boolean
  ) {
    this.selectedLicense = licenseDetails;
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = new FinancialTransferLicensing().clone({
        ...licenseDetails,
      });
      value.requestType = this.requestTypeField.value;
      value.oldLicenseFullSerial = licenseDetails.fullSerial;
      value.oldLicenseId = licenseDetails.id;
      value.oldLicenseSerial = licenseDetails.serial;
      value.documentTitle = '';
      value.fullSerial = null;
      value.description = '';
      value.createdOn = '';
      value.classDescription = '';

      // delete id because license details contains old license id, and we are adding new, so no id is needed
      delete value.id;
      delete value.vsId;

      this._updateForm(value);
    }
  }

  setSelectedTransferBankAccount(bankAccount: BankAccount) {
    this.bankName.setValue(bankAccount.bankName ?? 'Bank Name');
    this.transferFromIBAN.setValue(bankAccount.iBan);
    this.accountNumber.setValue(bankAccount.accountNumber);
  }
  updateTransactionAmount(totalTransactionsAmount: number) {
    this.qatariTransactionAmount.setValue(totalTransactionsAmount);
  }
  //#endregion

  //#region Inputs
  get basicInfoTab(): UntypedFormGroup {
    return this.form.get('basicInfo') as UntypedFormGroup;
  }

  get requestTypeField(): UntypedFormControl {
    return this.basicInfoTab.get('requestType') as UntypedFormControl;
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return this.basicInfoTab.get('oldLicenseFullSerial') as UntypedFormControl;
  }

  get transferOperationGroup(): UntypedFormGroup {
    return this.form.get('transferOperation') as UntypedFormGroup;
  }

  get targetCountry(): UntypedFormControl {
    return this.transferOperationGroup.get(
      'transferCountry'
    ) as UntypedFormControl;
  }
  get country(): UntypedFormControl {
    return this.transferOperationGroup.get('country') as UntypedFormControl;
  }
  get transferType(): UntypedFormControl {
    return this.transferOperationGroup.get(
      'transferType'
    ) as UntypedFormControl;
  }
  get qatariTransactionAmount(): UntypedFormControl {
    return this.transferOperationGroup.get(
      'qatariTransactionAmount'
    ) as UntypedFormControl;
  }

  get transfereeBankAccountGroup(): UntypedFormGroup {
    return this.form.get('transfereeBankAccount') as UntypedFormGroup;
  }

  get transfereeType(): UntypedFormControl {
    return this.transfereeBankAccountGroup.get(
      'transfereeType'
    ) as UntypedFormControl;
  }
  get transferringEntityName(): UntypedFormControl {
    return this.transfereeBankAccountGroup.get(
      'transferringEntityName'
    ) as UntypedFormControl;
  }
  get transferAccountNumber(): UntypedFormControl {
    return this.transfereeBankAccountGroup.get(
      'transferAccountNumber'
    ) as UntypedFormControl;
  }
  get transfereeIBAN(): UntypedFormControl {
    return this.transfereeBankAccountGroup.get(
      'transfereeIBAN'
    ) as UntypedFormControl;
  }
  get transfereeBankName(): UntypedFormControl {
    return this.transfereeBankAccountGroup.get(
      'transfereeBankName'
    ) as UntypedFormControl;
  }
  get receiverType(): UntypedFormControl {
    return this.transfereeBankAccountGroup.get(
      'receiverType'
    ) as UntypedFormControl;
  }
  get transferBankAccountGroup(): UntypedFormGroup {
    return this.form.get('transferBankAccount') as UntypedFormGroup;
  }
  get bankName(): UntypedFormControl {
    return this.transferBankAccountGroup.get('bankName') as UntypedFormControl;
  }
  get transferFromIBAN(): UntypedFormControl {
    return this.transferBankAccountGroup.get(
      'transferFromIBAN'
    ) as UntypedFormControl;
  }
  get accountNumber(): UntypedFormControl {
    return this.transferBankAccountGroup.get(
      'accountNumber'
    ) as UntypedFormControl;
  }
  get financialTransfersProjects(): UntypedFormArray {
    return this.form.get('financialTransfersProjects') as UntypedFormArray;
  }
  get affidavitOfCompletionGroup(): UntypedFormGroup {
    return this.form.get('affidavitOfCompletion') as UntypedFormGroup;
  }
  get currency(): UntypedFormControl {
    return this.affidavitOfCompletionGroup.get(
      'currency'
    ) as UntypedFormControl;
  }
  get currencyTransferTransactionAmount(): UntypedFormControl {
    return this.affidavitOfCompletionGroup.get(
      'currencyTransferTransactionAmount'
    ) as UntypedFormControl;
  }
  get actualTransferDate(): UntypedFormControl {
    return this.affidavitOfCompletionGroup.get(
      'actualTransferDate'
    ) as UntypedFormControl;
  }
  get transferNumber(): UntypedFormControl {
    return this.affidavitOfCompletionGroup.get(
      'transferNumber'
    ) as UntypedFormControl;
  }
  get specialExplanationsField(): UntypedFormControl {
    return this.form.get('description') as UntypedFormControl;
  }
  //#endregion
}
