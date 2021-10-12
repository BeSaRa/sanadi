import {AfterViewInit, ChangeDetectorRef, Component, Input, ViewChild} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {Observable, of, Subject} from "rxjs";
import {AbstractControl, FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {PartnerApproval} from "@app/models/partner-approval";
import {PartnerApprovalService} from "@app/services/partner-approval.service";
import {IKeyValue} from "@app/interfaces/i-key-value";
import {Lookup} from "@app/models/lookup";
import {LookupService} from "@app/services/lookup.service";
import {catchError, delay, exhaustMap, filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {CountryService} from "@app/services/country.service";
import {Country} from "@app/models/country";
import {DateUtils} from "@app/helpers/date-utils";
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {ToastService} from "@app/services/toast.service";
import {DialogService} from "@app/services/dialog.service";
import {ReadinessStatus} from "@app/types/types";
import {SaveTypes} from "@app/enums/save-types";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {BankAccountComponent} from "@app/e-services/shared/bank-account/bank-account.component";
import {ExecutiveManagementComponent} from "@app/e-services/shared/executive-management/executive-management.component";
import {GoalComponent} from "@app/e-services/pages/partner-approval/goal/goal.component";
import {ManagementCouncilComponent} from "@app/e-services/pages/partner-approval/management-council/management-council.component";
import {TargetGroupComponent} from "@app/e-services/pages/partner-approval/target-group/target-group.component";
import {ContactOfficerComponent} from "@app/e-services/pages/partner-approval/contact-officer/contact-officer.component";
import {ApprovalReasonComponent} from "@app/e-services/pages/partner-approval/approval-reason/approval-reason.component";
import {ServiceRequestTypes} from "@app/enums/service-request-types";
import {CustomValidators} from "@app/validators/custom-validators";
import {LicenseService} from "@app/services/license.service";
import {EmployeeService} from "@app/services/employee.service";
import {OrganizationUnitService} from "@app/services/organization-unit.service";
import {OrgUnit} from "@app/models/org-unit";
import {CommonUtils} from "@app/helpers/common-utils";
import {JobTitleService} from "@app/services/job-title.service";
import {JobTitle} from "@app/models/job-title";
import {OpenFrom} from "@app/enums/open-from.enum";

@Component({
  selector: 'partner-approval',
  templateUrl: './partner-approval.component.html',
  styleUrls: ['./partner-approval.component.scss']
})
export class PartnerApprovalComponent extends EServicesGenericComponent<PartnerApproval, PartnerApprovalService> implements AfterViewInit {
  form!: FormGroup;
  serviceRequestTypes = ServiceRequestTypes;
  countries: Country[] = [];
  jobTitles: JobTitle[] = [];
  regions: Country[] = [];
  requestTypes: Lookup[] = this.lookupService.listByCategory.ServiceRequestType.sort((a, b) => a.lookupKey - b.lookupKey);
  headQuarterTypes: Lookup[] = this.lookupService.listByCategory.HeadQuarterType;
  requestClassifications: Lookup[] = this.lookupService.listByCategory.RequestClassification;
  organizations: OrgUnit[] = [];
  readonly: boolean = false;
  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: PartnerApproval;
  bankDetailsTabStatus: ReadinessStatus = 'READY';
  goalsTabStatus: ReadinessStatus = 'READY';
  managementCouncilsTabStatus: ReadinessStatus = 'READY';
  executiveManagementsTabStatus: ReadinessStatus = 'READY';
  targetGroupsTabStatus: ReadinessStatus = 'READY';
  contactOfficersTabStatus: ReadinessStatus = 'READY';
  approvalReasonsTabStatus: ReadinessStatus = 'READY';

  @ViewChild('bankAccountsTab') bankAccountComponentRef!: BankAccountComponent;
  @ViewChild('goalsTab') goalComponentRef!: GoalComponent;
  @ViewChild('executiveManagementsTab') executiveManagementComponentRef!: ExecutiveManagementComponent;
  @ViewChild('managementCouncilsTab') managementCouncilComponentRef!: ManagementCouncilComponent;
  @ViewChild('targetGroupsTab') targetGroupComponentRef!: TargetGroupComponent;
  @ViewChild('contactOfficersTab') contactOfficerComponentRef!: ContactOfficerComponent;
  @ViewChild('approvalReasonsTab') approvalReasonComponentRef!: ApprovalReasonComponent;

  tabsData: IKeyValue = {
    basic: {
      name: 'basic',
      langKey: 'lbl_basic_info',
      validStatus: () => this.form && this.form.valid
    },
    bankAccounts: {
      name: 'bankAccounts',
      langKey: 'bank_details',
      validStatus: () => {
        return !this.bankAccountComponentRef || (this.bankDetailsTabStatus === 'READY' && this.bankAccountComponentRef.list.length > 0);
      }
    },
    goals: {
      name: 'goals',
      langKey: 'goals',
      validStatus: () => {
        return !this.goalComponentRef || (this.goalsTabStatus === 'READY' && this.goalComponentRef.list.length > 0);
      }
    },
    managementCouncils: {
      name: 'managementCouncils',
      langKey: 'management_council',
      validStatus: () => {
        return !this.managementCouncilComponentRef || (this.managementCouncilsTabStatus === 'READY' && this.managementCouncilComponentRef.list.length > 0);
      }
    },
    executiveManagements: {
      name: 'executiveManagements',
      langKey: 'executive_management',
      validStatus: () => {
        return !this.executiveManagementComponentRef || (this.executiveManagementsTabStatus === 'READY' && this.executiveManagementComponentRef.list.length > 0);
      }
    },
    targetGroups: {
      name: 'targetGroups',
      langKey: 'target_groups',
      validStatus: () => {
        return !this.targetGroupComponentRef || (this.targetGroupsTabStatus === 'READY' && this.targetGroupComponentRef.list.length > 0);
      }
    },
    contactOfficers: {
      name: 'contactOfficers',
      langKey: 'contact_officers',
      validStatus: () => {
        return !this.contactOfficerComponentRef || (this.contactOfficersTabStatus === 'READY' && this.contactOfficerComponentRef.list.length > 0);
      }
    },
    approvalReasons: {
      name: 'approvalReasons',
      langKey: 'approval_reasons',
      validStatus: () => {
        return !this.approvalReasonComponentRef || (this.bankDetailsTabStatus === 'READY' && this.approvalReasonComponentRef.list.length > 0);
      }
    },
    comments: {
      name: 'comments',
      langKey: 'comments',
      validStatus: () => true
    },
    attachments: {
      name: 'attachments',
      langKey: 'attachments',
      validStatus: () => true
    },
    recommendations: {
      name: 'recommendations',
      langKey: 'recommendations',
      validStatus: () => true
    }
  }

  datepickerOptionsMap: IKeyValue = {
    establishmentDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'})
  };

  constructor(public lang: LangService, public service: PartnerApprovalService,
              public fb: FormBuilder, public lookupService: LookupService,
              private countryService: CountryService, private dialog: DialogService,
              private toast: ToastService, private toastService: ToastService,
              private licenseService: LicenseService, private cd: ChangeDetectorRef,
              private jobTitleService: JobTitleService,
              public employeeService: EmployeeService, private orgService: OrganizationUnitService) {
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
    this.loadJobTitles();
    this.loadOrganizations();
    this.listenToLicenseSearch();
  }

  _buildForm(): void {
    const partnerApproval = new PartnerApproval();
    this.form = this.fb.group({
      basic: this.fb.group(partnerApproval.getBasicFields(true))
    });
  }

  _afterBuildForm(): void {
    this.setDefaultOrganization();
    this.listenToCountryChange();

    setTimeout(() => {
      this.handleReadonly();
      if (this.fromDialog) {
        // if license number exists, load it and regions will be loaded inside
        // otherwise load regions separately
        if (this.model?.licenseNumber) {
          this.loadSelectedLicense(this.model?.licenseNumber!);
        }
      }
      this.listenToRequestTypeChange();
    });
  }

  _afterSave(model: PartnerApproval, saveType: SaveTypes, operation: OperationTypes): void {
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

  _prepareModel(): Observable<PartnerApproval> | PartnerApproval {
    let value = (new PartnerApproval()).clone({...this.model, ...this.form.value.basic});

    value.bankAccountList = this.bankAccountComponentRef.list;
    value.goalsList = this.goalComponentRef.list;
    value.managementCouncilList = this.managementCouncilComponentRef.list;
    value.executiveManagementList = this.executiveManagementComponentRef.list;
    value.targetGroupList = this.targetGroupComponentRef.list;
    value.contactOfficerList = this.contactOfficerComponentRef.list;
    value.approvalReasonList = this.approvalReasonComponentRef.list;
    return value;
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (this.requestType.value !== ServiceRequestTypes.NEW && !this.selectedLicense) {
      this.dialog.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
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
  }

  _saveFail(error: any): void {
    console.log('problem on save');
  }

  _destroyComponent(): void {
  }

  _updateForm(model: PartnerApproval): void {
    this.model = model;
    this.basicTab.patchValue(model.getBasicFields());
    this.cd.detectChanges();
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.bankAccountComponentRef.forceClearComponent();
    this.goalComponentRef.forceClearComponent();
    this.managementCouncilComponentRef.forceClearComponent();
    this.executiveManagementComponentRef.forceClearComponent();
    this.targetGroupComponentRef.forceClearComponent();
    this.contactOfficerComponentRef.forceClearComponent();
    this.approvalReasonComponentRef.forceClearComponent();
    this.setDefaultOrganization();
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }


  _launchFail(error: any): void {
    console.log(error);
  }

  loadRegions(id: number): void {
    this.regions = [];
    if (!id) {
      return;
    }
    this.countryService.loadCountriesByParentId(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: Country[]) => {
        this.regions = result;
      });
  }

  private loadCountries() {
    this.countryService
      .loadCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countries = countries);
  }

  private loadJobTitles() {
    this.jobTitleService.loadComposite()
      .subscribe((jobTitles) => this.jobTitles = jobTitles);
  }

  listenToCountryChange(): void {
    this.country?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.region?.reset();
      this.loadRegions(this.country?.value);
    });
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

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  private loadOrganizations() {
    this.orgService.load()
      .pipe(takeUntil(this.destroy$))
      .subscribe((organizations) => {
        this.organizations = organizations;
        this.setDefaultOrganization();
      })
  }

  private setDefaultOrganization(): void {
    if (this.operation === this.operationTypes.CREATE && this.employeeService.isExternalUser()) {
      const orgId = this.employeeService.getOrgUnit()?.id;
      this.organizationId.patchValue(orgId);
      this.organizationId.disable();
    }
  }

  listenToRequestTypeChange(): void {
    this.requestType?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(requestTypeValue => {
      // if no requestType or (requestType = new)
      // if new record or draft, reset license and its validations
      // also reset the values in model
      if (!requestTypeValue || (requestTypeValue === ServiceRequestTypes.NEW)) {
        if (!this.model?.id || this.model.canCommit()) {
          this.licenseNumber.reset();
          this.licenseNumber.setValidators([]);
          this.setSelectedLicense(undefined, undefined);

          if (this.model) {
            this.model.licenseNumber = '';
            this.model.licenseDuration = 0;
            this.model.licenseStartDate = '';
          }
        }
      } else {
        this.licenseNumber.setValidators([CustomValidators.required, (control) => {
          return this.selectedLicense && this.selectedLicense?.licenseNumber === control.value ? null : {select_license: true}
        }]);
      }
      this.licenseNumber.updateValueAndValidity();
    });
  }

  private loadSelectedLicense(licenseNumber: string): void {
    if (!this.model || !licenseNumber) {
      return;
    }

    this.service
      .licenseSearch({licenseNumber})
      .pipe(
        filter(list => {
          // if license number exists, set it and regions will be loaded inside
          // otherwise load regions separately
          if (list.length === 0) {
            this.loadRegions(this.country?.value);
          }
          return list.length > 0;
        }),
        map(list => list[0]),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license, undefined)
      })
  }

  private setSelectedLicense(license?: PartnerApproval | any, licenseDetails?: PartnerApproval) {
    this.selectedLicense = license;

    // update form fields if i have license
    if (license && licenseDetails) {
      const partnerApproval = licenseDetails.clone({
        id: undefined,
        requestType: this.requestType.value
      });
      this._updateForm(partnerApproval)
    }
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(exhaustMap(value => {
        return this.service
          .licenseSearch({licenseNumber: value})
          .pipe(catchError(() => of([])))
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter(result => !!result.length),
        // switch to the dialog ref to use it later and catch the user response
        switchMap(license => this.licenseService.openSelectLicenseDialog(license, this.model).onAfterClose$),
        // allow only if the user select license
        filter<{ selected: PartnerApproval, details: PartnerApproval }, any>
        ((selection): selection is { selected: PartnerApproval, details: PartnerApproval } => {
          return !!(selection);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection.selected, selection.details);
      })
  }

  licenseSearch(): void {
    const value = this.licenseNumber.value && this.licenseNumber.value.trim();
    if (!value) {
      this.dialog.info(this.lang.map.need_license_number_to_search)
      return;
    }
    this.licenseSearch$.next(value);
  }

  viewLicense(): void {
    if (!this.selectedLicense)
      return;

    this.licenseService.openSelectLicenseDialog([this.selectedLicense], this.model, false)
  }

  get basicTab(): FormGroup {
    return (this.form.get('basic')) as FormGroup;
  }

  get requestType(): AbstractControl {
    return (this.form.get('basic')?.get('requestType')) as FormControl;
  }

  get licenseNumber(): AbstractControl {
    return (this.form.get('basic')?.get('licenseNumber')) as FormControl;
  }

  get organizationId(): AbstractControl {
    return (this.form.get('basic')?.get('organizationId')) as FormControl;
  }

  get country(): FormControl {
    return (this.form.get('basic')?.get('country')) as FormControl;
  }

  get region(): FormControl {
    return (this.form.get('basic')?.get('region')) as FormControl;
  }

  isAddAttachmentAllowed(): boolean {
    if (!this.model?.id) {
      return false;
    }

    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }

    return isAllowed;
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
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return isAllowed && CommonUtils.isValidValue(this.requestType.value) && this.requestType.value !== ServiceRequestTypes.NEW;
  }

  isEditCountryAllowed(): boolean {
    let requestType = this.requestType.value,
      isAllowed = !(requestType === ServiceRequestTypes.EXTEND || requestType === ServiceRequestTypes.CANCEL);

    if (!this.model?.id || (!!this.model?.id && this.model.canCommit())) {
      return isAllowed;
    } else {
      return isAllowed && !this.readonly;
    }
  }
}
