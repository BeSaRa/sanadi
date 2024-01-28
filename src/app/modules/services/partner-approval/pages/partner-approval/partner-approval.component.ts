import { ProfileService } from './../../../../../services/profile.service';
import { RequestTypeFollowupService } from '@services/request-type-followup.service';
import { WorkAreasComponent } from '../../../shared-services/components/work-areas/work-areas.component';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CommercialActivityComponent } from '../../shared/commercial-activity/commercial-activity.component';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { LangService } from '@services/lang.service';
import { Observable, of, Subject } from 'rxjs';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { PartnerApproval } from '@models/partner-approval';
import { PartnerApprovalService } from '@services/partner-approval.service';
import { IKeyValue } from '@contracts/i-key-value';
import { Lookup } from '@models/lookup';
import { LookupService } from '@services/lookup.service';
import { catchError, exhaustMap, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CountryService } from '@services/country.service';
import { Country } from '@models/country';
import { DateUtils } from '@helpers/date-utils';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { ToastService } from '@services/toast.service';
import { DialogService } from '@services/dialog.service';
import { DatepickerOptionsMap } from '@app/types/types';
import { SaveTypes } from '@enums/save-types';
import { OperationTypes } from '@enums/operation-types.enum';
import { GoalComponent } from '@modules/services/partner-approval/shared/goal/goal.component';
import { ManagementCouncilComponent } from '@modules/services/partner-approval/shared/management-council/management-council.component';
import { TargetGroupComponent } from '@modules/services/partner-approval/shared/target-group/target-group.component';
import { ContactOfficerComponent } from '@modules/services/partner-approval/shared/contact-officer/contact-officer.component';
import { ApprovalReasonComponent } from '@modules/services/partner-approval/shared/approval-reason/approval-reason.component';
import { ServiceRequestTypes } from '@enums/service-request-types';
import { CustomValidators } from '@app/validators/custom-validators';
import { LicenseService } from '@services/license.service';
import { EmployeeService } from '@services/employee.service';
import { CommonUtils } from '@helpers/common-utils';
import { OpenFrom } from '@enums/open-from.enum';
import { PartnerApprovalSearchCriteria } from '@models/PartnerApprovalSearchCriteria';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { ExecutiveManagementComponent } from '@app/shared/components/executive-management/executive-management.component';
import { BankAccountComponent } from '@modules/services/shared-services/components/bank-account/bank-account.component';
import { UserClickOn } from '@enums/user-click-on.enum';
import { ICoordinates } from '@contracts/ICoordinates';
import { GoalsListComponent } from '../../shared/goals-list/goals-list.component';
import { Profile } from '@models/profile';
import { CaseTypes } from '@app/enums/case-types.enum';
import { ProfileTypes } from '@app/enums/profile-types.enum';

@Component({
  selector: 'partner-approval',
  templateUrl: './partner-approval.component.html',
  styleUrls: ['./partner-approval.component.scss'],
})
export class PartnerApprovalComponent
  extends EServicesGenericComponent<PartnerApproval, PartnerApprovalService>
  implements AfterViewInit {
  form!: UntypedFormGroup;
  serviceRequestTypes = ServiceRequestTypes;
  countries: Country[] = [];
  requestTypes: Lookup[] =
    this.requestTypeFollowupService.serviceRequestTypes[CaseTypes.PARTNER_APPROVAL].slice().sort(
      (a, b) => a.lookupKey - b.lookupKey
    );
  headQuarterTypes: Lookup[] =
    this.lookupService.listByCategory.HeadQuarterType;
  requestClassifications: Lookup[] =
    this.lookupService.listByCategory.RequestClassification;
  organizations: Profile[] = [];
  readonly: boolean = false;
  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: PartnerApproval;

  loadAttachments: boolean = false;
  formProperties = {
    requestType: () => {
      return this.getObservableField('requestType', 'requestType');
    },
    requestClassification: () => {
      return this.getObservableField('requestClassification', 'requestClassification');
    }
  }

  @ViewChild('bankAccountsTab') bankAccountComponentRef!: BankAccountComponent;
  @ViewChild('goalsListTab') goalsListComponentRef!: GoalsListComponent;
  @ViewChild('goalsTab') goalsComponentRef!: GoalComponent;
  @ViewChild('executiveManagementsTab')
  executiveManagementComponentRef!: ExecutiveManagementComponent;
  @ViewChild('managementCouncilsTab')
  managementCouncilComponentRef!: ManagementCouncilComponent;
  @ViewChild('targetGroupsTab') targetGroupComponentRef!: TargetGroupComponent;
  @ViewChild('contactOfficersTab')
  contactOfficerComponentRef!: ContactOfficerComponent;
  @ViewChild('approvalReasonsTab')
  approvalReasonComponentRef!: ApprovalReasonComponent;
  @ViewChild('commercialActivityTab')
  commercialActivityTabComponentRef!: CommercialActivityComponent;
  @ViewChild('workAreasTab')
  workAreasTabComponentRef!: WorkAreasComponent;

  @ViewChild('requestClassfication')
  requestClassificationRef!: NgSelectComponent;

  get longitude(): AbstractControl {
    return this.form.get('basic.longitude')!;
  }

  get latitude(): AbstractControl {
    return this.form.get('basic.latitude')!;
  }

  tabsData: IKeyValue = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form && this.form.controls.basic.valid,
    },
    bankAccounts: {
      name: 'bankAccounts',
      langKey: 'bank_details',
      validStatus: () => {
        return (
          !this.bankAccountComponentRef ||
          this.bankAccountComponentRef.list.length > 0
        );
      },
    },
    tradeLicenseData: {
      name: 'tradeLicenseData',
      langKey: 'trade_license',

      validStatus: () => {
        return (
          !this.commercialActivityTabComponentRef ||
            this.commercialActivityTabComponentRef.list.length > 0 &&
            this.form.controls.trade.valid
        );
      },
    },
    goals: {
      name: 'goals',
      langKey: 'goals',
      validStatus: () => {
        return (
          (!this.goalsComponentRef ||
              this.goalsComponentRef.list.length > 0) &&
          (!this.goalsListComponentRef ||
              this.goalsListComponentRef.list.length > 0) &&
          (!this.targetGroupComponentRef ||
              this.targetGroupComponentRef.list.length > 0) &&
          (!this.workAreasTabComponentRef ||
            this.workAreasTabComponentRef.list.length > 0)
        );
      },
    },
    managementCouncils: {
      name: 'managementCouncils',
      langKey: 'management_council',
      validStatus: () => {
        return (
          !this.managementCouncilComponentRef ||
            this.managementCouncilComponentRef.list.length > 0
        );
      },
    },
    executiveManagements: {
      name: 'executiveManagements',
      langKey: 'executive_management',
      validStatus: () => {
        return (
          !this.executiveManagementComponentRef ||
            this.executiveManagementComponentRef.list.length > 0
        );
      },
    },
    contactOfficers: {
      name: 'contactOfficers',
      langKey: 'contact_officers',
      validStatus: () => {
        return (
          !this.contactOfficerComponentRef || this.contactOfficerComponentRef.list.length > 0
        );
      },
    },
    approvalReasons: {
      name: 'approvalReasons',
      langKey: 'approval_reasons',
      validStatus: () => {
        return (
          !this.approvalReasonComponentRef ||
          this.approvalReasonComponentRef.list.length > 0
        );
      },
    },
    comments: {
      name: 'comments',
      langKey: 'comments',
      validStatus: () => true,
    },
    attachments: {
      name: 'attachments',
      langKey: 'attachments',
      validStatus: () => true,
    }
  };

  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'future',
    }),
    commercialLicenseEndDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
  };

  constructor(public lang: LangService,
    public service: PartnerApprovalService,
    public fb: UntypedFormBuilder,
    public lookupService: LookupService,
    private countryService: CountryService,
    private dialog: DialogService,
    private toast: ToastService,
    private licenseService: LicenseService,
    private cd: ChangeDetectorRef,
    public employeeService: EmployeeService,
    private profileService: ProfileService,
    private requestTypeFollowupService: RequestTypeFollowupService) {
    super();
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  _getNewInstance(): PartnerApproval {
    return new PartnerApproval();
  }

  _initComponent(): void {
    this.loadCountries();
    this.listenToLicenseSearch();
    this.loadOrgs();
  }

  loadOrgs() {
    // TODO: need to add filter deactive Curriculum
    this.profileService.getProfilesByProfileType([ProfileTypes.CHARITY, ProfileTypes.INSTITUTION])
      .subscribe((data) => {
        this.organizations = data;
      })
  }
  _buildForm(): void {
    const partnerApproval = new PartnerApproval();
    this.form = this.fb.group({
      basic: this.fb.group(partnerApproval.getBasicFields(true)),
      trade: this.fb.group(partnerApproval.buildCommercialLicenseData()),
    });
    if (this.employeeService.isInternalUser()) {
      this.orgField.setValidators([CustomValidators.required]);
    }
  }

  _afterBuildForm(): void {
    this.handleReadonly();
    if (this.fromDialog) {
      this.loadSelectedLicenseById(this.model!.oldLicenseId, () => {
        this.oldLicenseFullSerialField.updateValueAndValidity();
      });
    }
  }

  private _updateModelAfterSave(model: PartnerApproval): void {
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

  _afterSave(
    model: PartnerApproval,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    this._updateModelAfterSave(model);

    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(
        this.lang.map.msg_request_has_been_added_successfully.change({
          serial: model.fullSerial,
        })
      );
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _prepareModel(): Observable<PartnerApproval> | PartnerApproval {
    let value = new PartnerApproval().clone({
      ...this.model,
      ...this.form.value.basic,
      ...this.form.value.trade
    });

    value.bankAccountList = this.bankAccountComponentRef.list;
    value.goalsList = this.goalsListComponentRef?.list ?? [];
    value.managementCouncilList = this.managementCouncilComponentRef.list;
    value.executiveManagementList = this.executiveManagementComponentRef.list;
    value.targetGroupList = this.targetGroupComponentRef?.list ?? [];
    value.contactOfficerList = this.contactOfficerComponentRef.list;
    value.approvalReasonList = this.approvalReasonComponentRef.list;
    value.workAreaObjectList = this.workAreasTabComponentRef?.list ?? [];
    value.commercialActivitiesList = this.commercialActivityTabComponentRef?.list ?? [];
    value.displayGoals = this.goalsComponentRef?.list ?? [];

    return value;
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (
      this.requestType.value !== ServiceRequestTypes.NEW &&
      !this.selectedLicense
    ) {
      this.dialog.error(this.lang.map.please_select_license_to_complete_save);
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
        this.dialog.error(listHtml.outerHTML);
        return false;
      } else {
        return true;
      }
    }
  }

  _saveFail(error: any): void {
    console.log('problem on save');
  }

  _destroyComponent(): void {
  }

  _updateForm(model: PartnerApproval): void {
    this.model = model;
    this.basicTab.patchValue(model.getBasicFields());
    this.handleRequestTypeChange(model.requestType, false);
    this.handleRequestClassificationChange(this.model!.requestClassification);
    if (this.trade) {

      this.trade.patchValue(model.buildCommercialLicenseData());
    }
    this.cd.detectChanges();
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.setSelectedLicense(undefined, true);
    this.bankAccountComponentRef.forceClearComponent();
    this.goalsComponentRef?.forceClearComponent();
    this.goalsListComponentRef?.forceClearComponent();
    this.commercialActivityTabComponentRef?.forceClearComponent();
    this.managementCouncilComponentRef.forceClearComponent();
    this.executiveManagementComponentRef.forceClearComponent();
    this.targetGroupComponentRef?.forceClearComponent();
    this.contactOfficerComponentRef.forceClearComponent();
    this.approvalReasonComponentRef.forceClearComponent();
    this.workAreasTabComponentRef?.forceClearComponent();
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {
    console.log(error);
  }

  private loadCountries() {
    this.countryService
      .loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => (this.countries = countries));
  }

  handleCountryChange(_$event?: MouseEvent): void {
    this.region.reset();
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      // if (!(this.tabsData[key].formStatus() && this.tabsData[key].listStatus())) {
      if (!this.tabsData[key].validStatus()) {
        // @ts-ignore
        failedList.push(this.lang.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }

  openMapMarker() {
    this.model!.openMap(this.isExtendOrCancelRequestType() || this.readonly).onAfterClose$.subscribe(
      ({ click, value }: { click: UserClickOn; value: ICoordinates }) => {
        if (click === UserClickOn.YES) {
          this.model!.latitude = value.latitude;
          this.model!.longitude = value.longitude;
          this.latitude.patchValue(value.latitude);
          this.longitude.patchValue(value.longitude);
        }
      }
    );
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  showLicenseTrade?: boolean = undefined;

  handleRequestClassificationChange(requestClassification: number) {
    this.trade.reset();
    this.commercialLicenseNo.clearValidators();
    this.commercialLicenseNo.updateValueAndValidity();
    this.commercialLicenseEndDate.clearValidators();
    this.commercialLicenseEndDate.updateValueAndValidity();

    if (this.model!.isWithCommercialTrade(requestClassification)) {
      this.commercialLicenseNo.setValidators([CustomValidators.required, CustomValidators.number,
      CustomValidators.maxLength(20)]);
      this.commercialLicenseEndDate.setValidators([CustomValidators.required]);
      this.showLicenseTrade = true;
      return;

    }
    this.showLicenseTrade = false;
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
            this.requestType.setValue(requestTypeValue);
          }
          this.requestType$.next(requestTypeValue);

          // if no requestType or (requestType = new)
          // if new record or draft, reset license and its validations
          // also reset the values in model
          if (
            !requestTypeValue ||
            requestTypeValue === ServiceRequestTypes.NEW
          ) {
            if (!this.model?.id || this.model.canCommit()) {
              this.oldLicenseFullSerialField.reset();
              this.oldLicenseFullSerialField.setValidators([]);
              this.setSelectedLicense(undefined, true);

              if (this.model) {
                this.model.licenseNumber = '';
                this.model.licenseDuration = 0;
                this.model.licenseStartDate = '';
              }
            }
          } else {
            this.oldLicenseFullSerialField.setValidators([
              CustomValidators.required,
              (control) => {
                return this.selectedLicense &&
                  this.selectedLicense?.fullSerial === control.value
                  ? null
                  : { select_license: true };
              },
            ]);
          }
          this.oldLicenseFullSerialField.updateValueAndValidity();
        } else {
          this.requestType.setValue(this.requestType$.value);
        }
      });
  }
  private setSelectedLicense(
    licenseDetails: PartnerApproval | undefined,
    ignoreUpdateForm: boolean
  ) {
    this.selectedLicense = licenseDetails;

    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = new PartnerApproval().clone(licenseDetails);
      value.requestType = this.requestType.value;
      value.oldLicenseFullSerial = licenseDetails.fullSerial;
      value.oldLicenseId = licenseDetails.id;
      value.oldLicenseSerial = licenseDetails.serial;
      value.documentTitle = '';
      value.fullSerial = null;

      // delete id because license details contains old license id, and we are adding new, so no id is needed
      delete value.id;
      delete value.vsId;
      delete value.serial;
      this._updateForm(value);
    }
  }

  loadLicencesByCriteria(
    criteria: Partial<PartnerApprovalSearchCriteria>
  ): Observable<PartnerApproval[]> {
    const hasOrgId = this.requestType.value !== ServiceRequestTypes.UPDATE
    return this.service.licenseSearch(criteria, hasOrgId);
  }

  openDateMenu(ref: any) {
    if (!this.readonly) {
      ref.toggleCalendar();
    }
  }

  private validateSingleLicense(license: PartnerApproval): Observable<undefined | PartnerApproval> {
    return this.licenseService.validateLicenseByRequestType<PartnerApproval>(this.model!.caseType, this.requestType.value, license.id) as Observable<undefined | PartnerApproval>;
  }

  private openSelectLicense(licenses: PartnerApproval[]): Observable<undefined | PartnerApproval> {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({ requestType: this.requestType.value || null }), true,
      this.service.selectLicenseDisplayColumns)
      .onAfterClose$
      .pipe(map((result: ({ selected: PartnerApproval, details: PartnerApproval } | undefined)) => result ? result.details : result));
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(
        takeUntil(this.destroy$),

        exhaustMap((oldLicenseFullSerial) => {
          return this.loadLicencesByCriteria({
            fullSerial: oldLicenseFullSerial,
          }).pipe(catchError(() => of([])));
        })
      )
      .pipe(
        // display message in case there is no returned license
        tap(list => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the result if it has value
        filter(result => !!result.length)
      ).pipe(
        exhaustMap((licenses) => {
          return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
        })
      ).pipe(filter((info): info is PartnerApproval => !!info))
      .subscribe((selection) => {
        this.setSelectedLicense(selection, false);
      });
  }

  private loadSelectedLicenseById(id: string, callback?: any): void {
    if (!id) {
      return;
    }
    this.licenseService
      .loadPartnerLicenseByLicenseId(id)
      .pipe(
        filter((license) => !!license),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license, true);

        callback && callback();
      });
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    const value =
      this.oldLicenseFullSerialField.value &&
      this.oldLicenseFullSerialField.value.trim();
    /*if (!value) {
      this.dialog.info(this.lang.map.need_license_number_to_search)
      return;
    }*/
    this.licenseSearch$.next(value);
  }

  get basicTab(): UntypedFormGroup {
    return this.form.get('basic') as UntypedFormGroup;
  }

  get requestType(): AbstractControl {
    return this.form.get('basic')?.get('requestType') as UntypedFormControl;
  }
  
  get requestClassification(): AbstractControl {
    return this.form.get('basic')?.get('requestClassification') as UntypedFormControl;
  }

  get licenseNumber(): AbstractControl {
    return this.form.get('basic')?.get('licenseNumber') as UntypedFormControl;
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return this.form
      .get('basic')
      ?.get('oldLicenseFullSerial') as UntypedFormControl;
  }

  get organizationId(): AbstractControl {
    return this.form.get('basic')?.get('organizationId') as UntypedFormControl;
  }

  get country(): UntypedFormControl {
    return this.form.get('basic')?.get('country') as UntypedFormControl;
  }

  get region(): UntypedFormControl {
    return this.form.get('basic')?.get('region') as UntypedFormControl;
  }

  get orgField(): UntypedFormControl {
    return this.form.get('basic')?.get('organizationId') as UntypedFormControl;
  }

  get trade(): UntypedFormGroup {
    return this.form.get('trade') as UntypedFormGroup;
  }

  get commercialLicenseNo(): UntypedFormControl {
    return this.form.get('trade')?.get('commercialLicenseNo') as UntypedFormControl;
  }

  get commercialLicenseEndDate(): UntypedFormControl {
    return this.form.get('trade')?.get('commercialLicenseEndDate') as UntypedFormControl;
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

  isAddCommentAllowed(): boolean {
    if (!this.model?.id || this.employeeService.isExternalUser()) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }
    return isAllowed;
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
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }

  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed =
      !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return (
      isAllowed &&
      CommonUtils.isValidValue(this.requestType.value) &&
      this.requestType.value !== ServiceRequestTypes.NEW
    );
  }

  isEditCountryAllowed(): boolean {
    if (!this.isNewRequestType()) {
      return false;
    }
    let isAllowed = !this.isExtendOrCancelRequestType();

    if (!this.model?.id || (!!this.model?.id && this.model.canCommit())) {
      return isAllowed;
    } else {
      return isAllowed && !this.readonly;
    }
  }

  isNewRequestType(): boolean {
    return (
      this.requestType.value &&
      this.requestType.value === ServiceRequestTypes.NEW
    );
  }

  isRenewOrUpdateRequestType(): boolean {
    return (
      this.requestType.value &&
      (this.requestType.value === ServiceRequestTypes.RENEW ||
        this.requestType.value === ServiceRequestTypes.UPDATE)
    );
  }

  isExtendOrCancelRequestType(): boolean {
    return (
      this.requestType.value &&
      (this.requestType.value === ServiceRequestTypes.EXTEND ||
        this.requestType.value === ServiceRequestTypes.CANCEL)
    );
  }

  addCountry($event?: MouseEvent): void {
    $event?.preventDefault();
    this.countryService
      .openCreateDialog()
      .pipe(takeUntil(this.destroy$))
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe(() => {
          this.loadCountries();
        });
      });
  }
}
