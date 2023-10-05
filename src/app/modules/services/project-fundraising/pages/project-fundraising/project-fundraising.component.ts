import { Component } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { EServicesGenericComponent } from "@app/generics/e-services-generic-component";
import { ProjectFundraising } from "@app/models/project-fundraising";
import { ProjectFundraisingService } from "@services/project-fundraising.service";
import { combineLatest, iif, merge, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { Lookup } from "@app/models/lookup";
import { LookupService } from "@services/lookup.service";
import { LangService } from "@services/lang.service";
import { Country } from "@app/models/country";
import {
  catchError,
  delay,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  pairwise,
  startWith,
  switchMap,
  takeUntil,
  tap
} from "rxjs/operators";
import { ProjectWorkArea } from "@app/enums/project-work-area";
import { ProjectPermitTypes } from "@app/enums/project-permit-types";
import { ServiceRequestTypes } from "@app/enums/service-request-types";
import { DialogService } from "@services/dialog.service";
import { ToastService } from "@services/toast.service";
import { DomainTypes } from "@app/enums/domain-types";
import { EmployeeService } from "@services/employee.service";
import { ProfileTypes } from "@app/enums/profile-types.enum";
import { Profile } from "@app/models/profile";
import { ActivatedRoute } from "@angular/router";
import { AidLookupService } from "@services/aid-lookup.service";
import { AidLookup } from "@app/models/aid-lookup";
import { CustomValidators } from "@app/validators/custom-validators";
import { DacOchaService } from "@services/dac-ocha.service";
import { AdminLookup } from "@app/models/admin-lookup";
import { ProjectTemplate } from "@app/models/projectTemplate";
import { UserClickOn } from "@app/enums/user-click-on.enum";
import { CommonCaseStatus } from "@app/enums/common-case-status.enum";
import { OpenFrom } from "@app/enums/open-from.enum";
import { CommonUtils } from "@helpers/common-utils";
import { FundraisingProjectTypes } from "@app/enums/fundraising-project-types";
import { LicenseService } from "@services/license.service";
import { TemplateStatus } from "@app/enums/template-status";
import { ServiceDataService } from "@services/service-data.service";
import { ServiceData } from "@app/models/service-data";
import { ExecutionFields } from '@app/enums/execution-fields';
import { ProjectTypes } from '@app/enums/project-types';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'project-fundraising',
  templateUrl: './project-fundraising.component.html',
  styleUrls: ['./project-fundraising.component.scss']
})
export class ProjectFundraisingComponent extends EServicesGenericComponent<ProjectFundraising, ProjectFundraisingService> {
  form!: UntypedFormGroup;
  requestTypes: Lookup[] = this.lookupService.listByCategory.ServiceRequestTypeNoRenew.slice().sort((a, b) => a.lookupKey - b.lookupKey)
  permitTypes: Lookup[] = this.lookupService.listByCategory.ProjectPermitType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  projectWorkAreas: Lookup[] = this.lookupService.listByCategory.ProjectWorkArea.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  domains: Lookup[] = this.lookupService.listByCategory.Domain;
  countries: Country[] = this.activatedRoute.snapshot.data['countries'] as Country[];
  mainDacCategories: AdminLookup[] = [];
  subDacCategories: AdminLookup[] = [];
  mainUNOCHACategories: AdminLookup[] = [];
  subUNOCHACategories: AdminLookup[] = [];
  projectTypes: Lookup[] = this.lookupService.listByCategory.ProjectType;
  internalProjectsClassifications: Lookup[] = this.lookupService.listByCategory.InternalProjectClassification;
  sanadyDomains: AidLookup[] = [];
  sanadyMainClassifications: AidLookup[] = [];
  displayedColumns = ['name', 'serial', 'public_status', 'review_status', 'totalCost', 'actions']
  templateRequired: boolean = false;
  addTemplate$: Subject<any> = new Subject<any>();
  private profile?: Profile = this.employeeService.getProfile()
  private qatarCountry: Country = this.getQatarCountry()
  private loadedDacOchaBefore: boolean = false;
  clearDeductionItems: boolean = false;
  selectedLicense?: ProjectFundraising;
  deductionRatioChanged: boolean = false
  templateTabHasError = true;
  licenseSearch$: Subject<string> = new Subject()

  displayAllFields: boolean = false;
  displayInsideQatar: boolean = true;
  displayOutsideQatar: boolean = true;
  displaySanadySection: boolean = true;
  displayInternalSection: boolean = true;
  displayDacSection: boolean = true;
  displaySubDacSection: boolean = true;
  displayOchaSection: boolean = true;
  // will create it later
  userAnswer: ReplaySubject<UserClickOn> = new ReplaySubject<UserClickOn>(1)

  storedOldValues: Record<string, number> = {}

  maxDuration: number = 0;
  minDuration: number = 0;

  formProperties = {
    requestType: () => {
      return this.getObservableField('requestType', 'requestType');
    }
  }

  configs!: ServiceData;

  private controlsToWatchOldValues = [
    'permitType',
    'projectWorkArea',
    'domain',
    'mainDACCategory',
    'mainUNOCHACategory',
    'countriesField',
    'projectType',
    'internalProjectClassification',
    'sanadiDomain',
    'sanadiMainClassification'
  ]

  constructor(
    private activatedRoute: ActivatedRoute,
    public fb: UntypedFormBuilder,
    public service: ProjectFundraisingService,
    private lookupService: LookupService,
    private toast: ToastService,
    private dialog: DialogService,
    private aidLookupService: AidLookupService,
    public employeeService: EmployeeService,
    private dacOchaService: DacOchaService,
    private licenseService: LicenseService,
    private serviceDataService: ServiceDataService,
    public lang: LangService) {
    super()
  }

  _getNewInstance(): ProjectFundraising {
    return new ProjectFundraising()
  }

  _initComponent(): void {
    this.loadSanadyDomains()
    const profile = this.employeeService.getProfile()
    if (profile && (this.operation === OperationTypes.CREATE || this.operation === OperationTypes.UPDATE && this.employeeService.isExternalUser())) {
      const allowed = profile.getParsedPermitTypes()
      this.permitTypes = this.permitTypes.filter(item => allowed.includes(item.lookupKey))
    }
  }

  _buildForm(): void {
    const model = new ProjectFundraising()
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    })
  }

  _afterBuildForm(): void {
    this.loadLicenseConfigurations()
    this.loadLicenseById()
    this.handleReadonly()
    this.listenToAddTemplate();
    this.listenToDataWillEffectSelectedTemplate();
    this.listenToProjectTotalCoastChanges();
    this.listenToLicenseSearch()
    this.listenToMainFieldsChanges()
    this.listenToPermitTypeChanges()
    this.listenToWorkAreaChanges()
    // order here matter
    this.setDefaultValues();
    this.listenToSanadyDomainChanges()
    this.listenToProjectTypeChanges()
    this.listenToMainDacOchaChanges()
    this.listenToDomainChanges()
    this.overrideValuesInCreate();
    this.checkTemplateTabValidity();
    // this._test()
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (saveType === SaveTypes.DRAFT)
      return true

    return of(this.form.valid)
      .pipe(tap(valid => !valid && this.invalidFormMessage()))
      .pipe(filter(valid => valid))
      .pipe(switchMap(() => this.isAllHasSameTargetAmount()))
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    if (this.model && !this.model.deductedPercentagesItemList.length) {
      this.invalidItemMessage();
      return false
    }
    return true;
  }

  private invalidItemMessage() {
    this.dialog.error(this.lang.map.please_add_deduction_items_to_proceed);
  }

  _afterLaunch(): void {
    this._resetForm()
    this.checkTemplateTabValidity()
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): ProjectFundraising | Observable<ProjectFundraising> {
    return new ProjectFundraising().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue()
    })
  }

  _afterSave(model: ProjectFundraising, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model.clone<ProjectFundraising>({ taskDetails: this.model?.taskDetails });

    if (
      [OperationTypes.CREATE, OperationTypes.UPDATE].includes(operation) && [SaveTypes.FINAL, SaveTypes.COMMIT].includes(saveType)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {
  }

  _launchFail(error: any): void {
    console.error('Launch failed', error)
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this._resetForm()
          this.requestType.setValue(requestTypeValue);
        }
        this.requestType$.next(requestTypeValue);
      } else {
        this.requestType.setValue(this.requestType$.value);
      }
    });
  }

  _updateForm(model: ProjectFundraising | undefined, fromSelectedLicense: boolean = false): void {
    if (!model) {
      return;
    }
    this.model = model;
    this.form.patchValue({
      basicInfo: this.model.buildBasicInfo(),
      explanation: this.model.buildExplanation()
    }, {
      emitEvent: !fromSelectedLicense
    });
    this.handleRequestTypeChange(model.requestType, false);
    this.handleFieldsDisplay(model)
    this.handleMandatoryFields()

    if (fromSelectedLicense) {
      this.afterSelectLicense(model)
    }
  }

  _resetForm(): void {
    this.model = this._getNewInstance();
    this.form.reset();
    this.operation = this.operationTypes.CREATE;
    this.selectedLicense = undefined;
    this.minDuration = this.configs.licenseMinTime
    this.maxDuration = this.configs.licenseMaxTime
    this.setDefaultValues()
    this.overrideValuesInCreate()
  }

  private markRequired(fields: AbstractControl[], emitEvent: boolean = false): boolean {
    fields.forEach(field => {
      field.setValidators(CustomValidators.required)
      field.updateValueAndValidity({ emitEvent })
    })
    return true
  }

  private markNotRequired(fields: AbstractControl[], emitEvent: boolean = false): boolean {
    fields.forEach(field => {
      field.removeValidators(CustomValidators.required)
      field.updateValueAndValidity({ emitEvent })
    })
    return true
  }

  // noinspection JSUnusedLocalSymbols
  private emptyFields(fields: AbstractControl[], emitEvent: boolean = false): boolean {
    fields.forEach(field => field.setValue(null, { emitEvent }))
    return true
  }

  get basicInfo(): AbstractControl {
    return this.form.get('basicInfo')!
  }

  get specialExplanation(): AbstractControl {
    return this.form.get('explanation')!
  }

  get permitType(): AbstractControl {
    return this.basicInfo.get('permitType')!
  }

  get projectWorkArea(): AbstractControl {
    return this.basicInfo.get('projectWorkArea')!
  }

  get requestType(): AbstractControl {
    return this.basicInfo.get('requestType')!
  }

  get domain(): AbstractControl {
    return this.basicInfo.get('domain')!
  }

  get mainDACCategory(): AbstractControl {
    return this.basicInfo.get('mainDACCategory')!
  }

  get subDACCategory(): AbstractControl {
    return this.basicInfo.get('subDACCategory')!
  }

  get mainUNOCHACategory(): AbstractControl {
    return this.basicInfo.get('mainUNOCHACategory')!
  }

  get subUNOCHACategory(): AbstractControl {
    return this.basicInfo.get('subUNOCHACategory')!
  }

  get countriesField(): AbstractControl {
    return this.basicInfo.get('countries')!
  }

  get sanadiDomain(): AbstractControl {
    return this.basicInfo.get('sanadiDomain')!
  }

  get projectType(): AbstractControl {
    return this.basicInfo.get('projectType')!
  }

  get internalProjectClassification(): AbstractControl {
    return this.basicInfo.get('internalProjectClassification')!
  }

  get sanadiMainClassification(): AbstractControl {
    return this.basicInfo.get('sanadiMainClassification')!
  }

  get licenseDuration(): AbstractControl {
    return this.basicInfo.get('licenseDuration')!
  }

  get projectTotalCost(): AbstractControl {
    return this.basicInfo.get('projectTotalCost')!
  }

  get oldLicenseFullSerial(): AbstractControl {
    return this.basicInfo.get('oldLicenseFullSerial')!
  }

  private getQatarCountry(): Country {
    return this.countries.find(item => item.enName.toLowerCase() === 'qatar')!
  }

  private setDefaultValues(): void {
    if (this.operation === OperationTypes.CREATE) {
      this.requestType.setValue(ServiceRequestTypes.NEW)
      this.projectWorkArea.setValue(ProjectWorkArea.INSIDE_QATAR)
      this.permitType.setValue((this.permitTypes[0] && this.permitTypes[0].lookupKey) || null)
      this.domain.setValue(DomainTypes.HUMANITARIAN)
      this.projectType.setValue(FundraisingProjectTypes.SOFTWARE)
      this.countriesField.setValue([this.qatarCountry.id])
    }
  }

  private overrideValuesInCreate() {
    if (this.operation === OperationTypes.CREATE && this.profile && this.profile.profileType === ProfileTypes.ORGANIZATIONS_FOR_PURPOSE_OF_DONATIONS) {
      this.projectWorkArea.setValue(ProjectWorkArea.INSIDE_QATAR)
      this.projectWorkArea.disable()
    } else {
      this.projectWorkArea.enable()
    }
  }

  private excludeQatar(country: Country): boolean {
    return country.id === this.qatarCountry.id && this.projectWorkArea.value === ProjectWorkArea.OUTSIDE_QATAR
  }

  private singleCountrySelect(country: Country): boolean {
    return this.permitType.value === ProjectPermitTypes.SINGLE_TYPE_PROJECT &&
      (this.countriesField.value as number[] ?? []).length == 1 &&
      country.id !== this.countriesField.value[0];
  }

  private loadSanadyDomains(): void {
    this.aidLookupService.loadByCriteria({ parent: null })
      .subscribe((list) => {
        this.sanadyDomains = list
      })
  }

  checkCountryDisabled(option: Country): boolean {
    return this.excludeQatar(option) || this.singleCountrySelect(option)
  }


  private openAddTemplatePopup(): void {
    if (!(this.countriesField.value as []).length) {
      this.dialog.error(this.lang.map.msg_please_select_x_to_continue.change({ x: this.lang.map.country_countries }))
      return;
    }
    if (!(this.countriesField.value as []).length) {
      this.dialog.error(this.lang.map.msg_please_select_x_to_continue.change({ x: this.lang.map.country_countries }))
      return;
    }
    this.service
      .openDialogSearchTemplate(this.getSearchTemplateCriteria(), this.projectWorkArea.value, this.model?.getTemplate())
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .pipe(filter(temp => !!temp))
      .pipe(switchMap((template: ProjectTemplate) => {
        return this.service.validateTemplate({ templateId: template.templateId, caseId: this.model?.getCaseId() }).pipe(
          filter((valid) => {
            return !!valid
          }))
          .pipe(map((_) => template))
      }))
      .subscribe((template: ProjectTemplate) => {
        this.model && template && this.model.setTemplate(template as ProjectTemplate) && this.model.setProjectTotalCost(template.templateCost) && this.projectTotalCost.setValue(template.templateCost, { emitEvent: false })
      })
  }

  private getSearchTemplateCriteria(): Record<any, any> {
    const workArea = this.projectWorkArea.value
    const domain = this.domain.value;
    const projectType = this.projectType.value;
    const external: Record<string, string> = {
      domain: 'domain',
      countries: 'countriesField'
    };
    const internal: Record<string, string> = {
      countries: 'countriesField'
    };

    if (workArea === ProjectWorkArea.OUTSIDE_QATAR) {
      domain === DomainTypes.DEVELOPMENT ?
        external['mainDAC'] = 'mainDACCategory' :
        external['mainUNOCHA'] = 'mainUNOCHACategory';
    }

    if (workArea === ProjectWorkArea.INSIDE_QATAR) {
      projectType === FundraisingProjectTypes.SOFTWARE ? (() => {
        internal['projectType'] = 'projectType';
        internal['internalProjectClassification'] = 'internalProjectClassification';
      })() : (() => {
        internal['sanadiDomain'] = 'sanadiDomain';
        internal['sanadiMainClassification'] = 'sanadiMainClassification';
      })()
    }

    return Object.entries(this.projectWorkArea.value === ProjectWorkArea.INSIDE_QATAR ? internal : external)
      .reduce((acc, [key, controlName]: [string, string]) => {
        const control = this[(controlName as keyof this)] as AbstractControl
        if (control.getRawValue()) {
          return { ...acc, [key]: control.getRawValue() };
        } else {
          return acc;
        }
      }, {})
  }

  deleteTemplate(silent: boolean = false): void {
    if (this.readonly)
      return;

    of(silent)
      .pipe(switchMap(val => !val ?
        this.dialog.confirm(this.lang.map.remove_template_will_empty_deduction_ration_list)
          .onAfterClose$
          .pipe(filter((val: UserClickOn) => val === UserClickOn.YES)) : of(val))
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.model && this.model.clearTemplate() && this.model.setProjectTotalCost(0) && this.projectTotalCost.setValue(0, { emitEvent: false })
        // this.clearDeductionItems = true;
      })
  }

  private listenToAddTemplate(): void {
    this.addTemplate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.openAddTemplatePopup()
      })
  }

  onClearDeductionItems(): void {
    Promise.resolve(() => this.clearDeductionItems = false).then()
  }

  private listenToProjectTotalCoastChanges(): void {
    this.projectTotalCost
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.model && this.model.setProjectTotalCost(value)
      })
  }

  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }


  isExtendOrCancelRequestType(): boolean {
    return this.requestType.value && (this.requestType.value === ServiceRequestTypes.EXTEND || this.requestType.value === ServiceRequestTypes.CANCEL);
  }


  isExtendOrCancelOrUpdateRequestType(): boolean {
    const type = this.requestType.value
    return type && (type === ServiceRequestTypes.EXTEND || type === ServiceRequestTypes.CANCEL || type === ServiceRequestTypes.UPDATE);

  }

  isLicenseDurationDisabled(): boolean {
    return this.requestType.value && (this.requestType.value !== ServiceRequestTypes.EXTEND && this.requestType.value !== ServiceRequestTypes.NEW)
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return isAllowed && CommonUtils.isValidValue(this.requestType.value) && this.requestType.value !== ServiceRequestTypes.NEW;
  }

  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  onDeductionRatioChanges() {
    of(this.deductionRatioChanged)
      .pipe(delay(0))
      .pipe(tap(() => this.deductionRatioChanged = false))
      .pipe(delay(0))
      .pipe(tap(() => this.deductionRatioChanged = true))
      .pipe(takeUntil(this.destroy$))
      .subscribe()
  }

  handleReadonly() {
    // if record is new, no readonly (don't change as default is readonly = false)
    const model = this.model!
    if (!model.id) {
      return;
    }

    let caseStatus = model.getCaseStatus();
    if (caseStatus == CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION) {
      this.readonly = true;
      return;
    }

    if (this.openFrom === OpenFrom.USER_INBOX) {
      if (this.employeeService.isCharityManager()) {
        this.readonly = false;
      } else if (this.employeeService.isCharityUser()) {
        this.readonly = !model.isReturned();
      }
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (model.taskDetails.isClaimed()) {
        if (this.employeeService.isCharityManager()) {
          this.readonly = false;
        } else if (this.employeeService.isCharityUser()) {
          this.readonly = !model.isReturned();
        }
      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft, then no readonly
      if (model?.canCommit()) {
        this.readonly = false;
      }
    }

  }

  isAllHasSameTargetAmount(): Observable<boolean> {
    const countriesMessage = this.lang.map.make_sure_that_x_sum_equal_to_target_amount.change({ x: this.lang.map.country_countries })
    const yearsMessage = this.lang.map.make_sure_that_x_sum_equal_to_target_amount.change({ x: this.lang.map.year_s })
    const model = this.model!
    return of(model)
      .pipe(map(_ => this.displayAllFields ? model.targetAmount === model.calculateAllCountriesAmount() : true))
      .pipe(tap(value => !value && this.dialog.error(countriesMessage)))
      .pipe(filter(val => val))
      .pipe(map(_ => model.targetAmount === model.calculateAllYearsAmount()))
      .pipe(tap(value => !value && this.dialog.error(yearsMessage)))
  }

  checkTemplateTabValidity(): void {
    const model = this.model!
    if (this.templateRequired && !model.templateList.length) {
      this.templateTabHasError = true;
      return
    }
    Promise.resolve().then(() => this.templateTabHasError = model.hasInvalidTargetAmount(!this.displayAllFields))
  }

  viewTemplate(template: ProjectTemplate) {
    template
      .viewTemplate()
      .pipe(takeUntil(this.destroy$))
      .subscribe()
  }

  licenseSearch($event?: Event) {
    $event?.preventDefault();
    this.licenseSearch$.next((this.oldLicenseFullSerial.value as string || '').trim())
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((serialNumber) => this.service.licenseSearch({
        fullSerial: serialNumber
      })))
      .pipe(
        // display message in case there is no returned license
        tap((list) => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter((result) => !!result.length)
      )
      .pipe(exhaustMap(licenses => licenses.length === 1 ? this.validateSingleLicense(licenses[0]).pipe(catchError(_ => of(false))) : this.openSelectLicense(licenses)))
      .pipe(filter((info): info is ProjectFundraising => !!info))
      .subscribe((license) => {
        this.setSelectedLicense(license, false);
      });
  }

  private validateSingleLicense(license: ProjectFundraising): Observable<undefined | ProjectFundraising> {
    return this.licenseService.validateLicenseByRequestType<ProjectFundraising>(this.model!.caseType, this.requestType.value, license.id) as Observable<undefined | ProjectFundraising>;
  }

  private openSelectLicense(licenses: ProjectFundraising[]): Observable<undefined | ProjectFundraising> {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({ requestType: this.requestType.value || null }), true, this.service.selectLicenseDisplayColumns)
      .onAfterClose$
      .pipe(map((result: ({ selected: ProjectFundraising, details: ProjectFundraising } | undefined)) => result ? result.details : result));
  }

  setSelectedLicense(licenseDetails: ProjectFundraising | undefined, ignoreUpdateForm: boolean) {
    this.selectedLicense = licenseDetails;

    if (this.requestType.value === ServiceRequestTypes.EXTEND && this.selectedLicense) {
      this.maxDuration = this.configs.licenseMaxTime - (this.selectedLicense.totalLicenseDuration || this.selectedLicense.licenseDuration)
    } else {
      this.maxDuration = this.configs.licenseMaxTime
    }

    this.updateDurationValidator()
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let model: any = new ProjectFundraising().clone(licenseDetails);
      model.requestType = this.requestType.value;
      model.oldLicenseFullSerial = licenseDetails.fullSerial;
      model.oldLicenseId = licenseDetails.id;
      model.oldLicenseSerial = licenseDetails.serial;
      model.documentTitle = '';
      model.fullSerial = null;
      model.description = '';
      model.licenseStartDate = licenseDetails.licenseStartDate || licenseDetails.licenseApprovedDate;
      // delete id because license details contains old license id, and we are adding new, so no id is needed
      delete model.id;
      delete model.vsId;
      delete model.serial;


      this._updateForm(model, true);
    }
  }

  loadLicenseById(): void {
    if (!this.model || !this.model.oldLicenseId)
      return;

    this.licenseService
      .loadProjectFundraisingLicenseById(this.model.oldLicenseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((license) => {
        this.setSelectedLicense(license, true)
      })
  }

  clearLicense() {
    this._resetForm()
  }

  private loadSanadyMainClassification(parentId: number | null): void {
    if (!parentId) {
      this.sanadyMainClassifications = []
      return
    }
    this.aidLookupService.loadByCriteria({ parent: parentId }).subscribe((list) => {
      this.sanadyMainClassifications = list
    })
  }

  private loadDacOuchMain(callback?: () => void): void {
    if (this.loadedDacOchaBefore) {
      callback && callback()
      return
    }

    this.dacOchaService.loadMainDacOcha()
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.loadedDacOchaBefore = true;
        this.separateDacFromOcha(list);
        callback && callback()
      })
  }

  private loadSubDacOchaByParentId(parentId: number | null, callback?: () => void): void {
    if (!parentId) {
      callback && callback()
      return;
    }

    of(this.domain.value as number)
      .pipe(filter((value) => value === DomainTypes.DEVELOPMENT || (value === DomainTypes.HUMANITARIAN && this.permitType.value === ProjectPermitTypes.SINGLE_TYPE_PROJECT)))
      .pipe(switchMap(() => this.dacOchaService.loadByParentId(parentId)))
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.domain.value === DomainTypes.DEVELOPMENT ? this.subDacCategories = list : this.subUNOCHACategories = list
        callback && callback()
      })
  }

  private separateDacFromOcha(list: AdminLookup[]) {
    this.mainDacCategories = list.filter(item => item.type === DomainTypes.DEVELOPMENT)
    this.mainUNOCHACategories = list.filter(item => item.type === DomainTypes.HUMANITARIAN)
  }

  private listenToMainFieldsChanges() {
    combineLatest([
      this.permitType.valueChanges.pipe(this.holdTillGetUserResponse()).pipe(startWith<number, number>(this.permitType.value)),
      this.projectWorkArea.valueChanges.pipe(this.holdTillGetUserResponse()).pipe(startWith<number, number>(this.projectWorkArea.value)),
      this.projectType.valueChanges.pipe(this.holdTillGetUserResponse()).pipe(startWith<number, number>(this.projectType.value)),
      this.domain.valueChanges.pipe(this.holdTillGetUserResponse()).pipe(startWith<number, number>(this.domain.value))
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([permitType, projectWorkArea, projectType, domain]: [ProjectPermitTypes, ProjectWorkArea, FundraisingProjectTypes, DomainTypes]) => {
        this.handleFieldsDisplay({
          permitType,
          projectWorkArea,
          domain,
          projectType
        })
        this.handleMandatoryFields();
      })
  }

  private handleFieldsDisplay(model: Partial<ProjectFundraising>) {
    this.displayAllFields = !!(model.permitType && ![ProjectPermitTypes.CHARITY, ProjectPermitTypes.UNCONDITIONAL_RECEIVE].includes(model.permitType))
    this.displayInsideQatar = !!(model.projectWorkArea && model.projectWorkArea === ProjectWorkArea.INSIDE_QATAR)
    this.displayOutsideQatar = !!(model.projectWorkArea && model.projectWorkArea === ProjectWorkArea.OUTSIDE_QATAR)
    this.templateRequired = this.displayAllFields && model.permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT
    this.displaySanadySection = !!(this.displayInsideQatar && model.projectType && model.projectType === FundraisingProjectTypes.AIDS && this.permitType.value !== ProjectPermitTypes.SECTIONAL_BASKET)
    this.displayInternalSection = !!(this.displayInsideQatar && model.projectType && model.projectType === FundraisingProjectTypes.SOFTWARE && this.permitType.value !== ProjectPermitTypes.SECTIONAL_BASKET)
    this.displayDacSection = this.displayOutsideQatar && model.domain === DomainTypes.DEVELOPMENT
    this.displaySubDacSection = this.displayDacSection && this.permitType.value !== ProjectPermitTypes.SECTIONAL_BASKET;
    this.displayOchaSection = this.displayOutsideQatar && model.domain === DomainTypes.HUMANITARIAN && model.permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT
  }

  private handleMandatoryFields(emitEvent: boolean = false) {
    const dacFields = [this.mainDACCategory, this.subDACCategory]
    const ochaFields = [this.mainUNOCHACategory, this.subUNOCHACategory]
    const outsideFields = [this.domain].concat(dacFields).concat(ochaFields)

    const sanadyFields = [this.sanadiDomain, this.sanadiMainClassification]
    const insideFields = sanadyFields.concat([this.projectType, this.internalProjectClassification])

    const allFields = outsideFields.concat(insideFields).concat(this.projectWorkArea)

    if (!this.displayAllFields) {
      this.markNotRequired(allFields, emitEvent)
      this.countriesField.removeValidators(CustomValidators.requiredArray)
      return;
    }

    this.countriesField.addValidators(CustomValidators.requiredArray)
    this.projectWorkArea.addValidators(CustomValidators.required)


    this.displayInsideQatar && this.markNotRequired(outsideFields) && (() => {
      this.markRequired([this.projectType])
      this.displaySanadySection ? this.markRequired(sanadyFields) : this.markNotRequired(sanadyFields)
      this.displayInternalSection ? this.markRequired([this.internalProjectClassification]) : this.markNotRequired([this.internalProjectClassification])
      this.countriesField.disable({ emitEvent: false })
    })()

    this.displayOutsideQatar && this.markNotRequired(insideFields) && (() => {
      this.markRequired([this.domain])
      this.displayDacSection ? this.markRequired(dacFields) : this.markNotRequired(dacFields)
      this.displaySubDacSection ? this.markRequired([this.subDACCategory]) : this.markNotRequired([this.subDACCategory])
      this.displayOchaSection ? this.markRequired(ochaFields) : this.markNotRequired(ochaFields)
      this.countriesField.enable({ emitEvent: false })
    })()

  }

  private listenToSanadyDomainChanges() {
    this.sanadiDomain.valueChanges
      .pipe(this.holdTillGetUserResponse())
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.sanadiMainClassification.setValue(null)
        this.loadSanadyMainClassification(value)
      })
  }

  private listenToProjectTypeChanges() {
    this.projectType.valueChanges
      .pipe(this.holdTillGetUserResponse())
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(val => !!val))
      .subscribe((value: FundraisingProjectTypes) => {
        value === FundraisingProjectTypes.AIDS ? this.emptyFields([this.internalProjectClassification]) : this.emptyFields([this.sanadiDomain, this.sanadiMainClassification])
      })
  }

  private holdTillGetUserResponse() {
    return switchMap((value: number) => {
      return iif(() => !!(this.model && (this.model.hasTemplate() || this.model.hasCountries() || this.model.hasYears())),
        this.userAnswer.pipe(filter(v => v === UserClickOn.YES), map(_ => value)), of(value))
    })
  }

  private listenToWorkAreaChanges() {
    const aidFields = [this.projectType, this.sanadiDomain, this.sanadiMainClassification, this.internalProjectClassification]
    const domainFields = [this.domain, this.mainDACCategory, this.mainUNOCHACategory, this.subUNOCHACategory, this.subDACCategory]
    this.projectWorkArea
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(distinctUntilChanged())
      .pipe(this.holdTillGetUserResponse())
      .subscribe((value: ProjectWorkArea) => {
        value === ProjectWorkArea.OUTSIDE_QATAR && (() => {
          !this.domain.value && this.domain.setValue(DomainTypes.HUMANITARIAN, { emitEvent: false })
          this.domain.updateValueAndValidity({ emitEvent: false })
          this.loadDacOuchMain()
          this.emptyFields(aidFields)
          this.countriesField.setValue(((this.countriesField.value ?? []) as number[]).filter(id => id !== this.qatarCountry.id), { emitEvent: false })
          this.countriesField.enable({ emitEvent: false })
        })()

        value === ProjectWorkArea.INSIDE_QATAR && (() => {
          !this.projectType.value && this.projectType.setValue(FundraisingProjectTypes.SOFTWARE, { emitEvent: false })
          this.projectType.updateValueAndValidity({ emitEvent: false })
          this.emptyFields(domainFields)
          this.countriesField.setValue([this.qatarCountry.id], { emitEvent: false })
          this.countriesField.disable({ emitEvent: false })
        })()

        !value && this.emptyFields(aidFields.concat(domainFields))
      })
  }

  private listenToMainDacOchaChanges() {
    merge(this.mainDACCategory.valueChanges, this.mainUNOCHACategory.valueChanges)
      .pipe(this.holdTillGetUserResponse())
      .pipe(filter(_ => this.permitType.value !== ProjectPermitTypes.SECTIONAL_BASKET))
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.subDACCategory.setValue(null, { emitEvent: false })
        this.subUNOCHACategory.setValue(null, { emitEvent: false })
        this.loadSubDacOchaByParentId(value)
      })
  }

  showMainDacOnly(): boolean {
    return this.permitType.value === ProjectPermitTypes.SECTIONAL_BASKET &&
      this.projectWorkArea.value === ProjectWorkArea.OUTSIDE_QATAR &&
      this.domain.value === DomainTypes.DEVELOPMENT
  }
  hideSanadyDomain(): boolean {
    return this.permitType.value === ProjectPermitTypes.SECTIONAL_BASKET &&
      this.projectWorkArea.value === ProjectWorkArea.INSIDE_QATAR &&
      this.projectType.value === ProjectTypes.STRUCTURAL
  }
  private listenToDomainChanges() {
    const dacFields = [this.mainDACCategory, this.subDACCategory]
    const ochaFields = [this.mainUNOCHACategory, this.subUNOCHACategory]
    this.domain
      .valueChanges
      .pipe(this.holdTillGetUserResponse())
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: DomainTypes) => {
        value === DomainTypes.HUMANITARIAN && (() => {
          this.emptyFields(dacFields)
          this.permitType.value === ProjectPermitTypes.SECTIONAL_BASKET && this.emptyFields(ochaFields)
        })()

        value === DomainTypes.DEVELOPMENT && (() => {
          this.emptyFields(ochaFields)
        })()

        !value && this.emptyFields(ochaFields.concat(ochaFields))
      })
  }

  _afterOpenCase(model: ProjectFundraising) {
    model.projectWorkArea === ProjectWorkArea.OUTSIDE_QATAR && (() => {
      this.loadDacOuchMain()
      this.loadSubDacOchaByParentId(model.getDacOchaId())
    })()
    model.projectWorkArea === ProjectWorkArea.INSIDE_QATAR && model.projectType === FundraisingProjectTypes.AIDS && this.loadSanadyMainClassification(model.sanadiDomain)
    this.getOldValues()
  }

  rejectTemplate(index: number) {
    this.dialog.confirm(this.lang.map.template_action_x_confirmation_msg.change({ x: this.lang.map.lbl_reject }))
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(value => value === UserClickOn.YES))
      .subscribe(() => {
        this.model && this.model.changeTemplateStatus(index, TemplateStatus.REJECTED) && this.save.next(SaveTypes.FINAL)
      })
  }

  acceptTemplate(index: number) {
    this.dialog.confirm(this.lang.map.template_action_x_confirmation_msg.change({ x: this.lang.map.lbl_accept }))
      .onAfterClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(value => value === UserClickOn.YES))
      .subscribe(() => {
        this.model && this.model.changeTemplateStatus(index, TemplateStatus.APPROVED) && this.save.next(SaveTypes.FINAL)
      })
  }

  needTemplateApproval(index: number): boolean {
    return !!(this.model && this.employeeService.isInternalUser() && this.model.canApproveTemplate(index)) && !this.isRejectedOrApproved()
  }

  isRejectedOrApproved() {
    return this.model?.caseStatus == CommonCaseStatus.FINAL_APPROVE || this.model?.caseStatus == CommonCaseStatus.FINAL_REJECTION
  }

  private afterSelectLicense(model: ProjectFundraising) {
    if (!this.displayAllFields)
      return;

    this.displayOutsideQatar ?
      // outside and domain development
      model.domain === DomainTypes.DEVELOPMENT ?
        (() => {
          this.loadDacOuchMain()
          this.loadSubDacOchaByParentId(model.mainDACCategory)
        })() :
        // outside and domain humanitarian
        (() => {
          model.permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT ? (() => {
            this.loadDacOuchMain()
            this.loadSubDacOchaByParentId(model.mainUNOCHACategory)
          })() : null
        })()
      :
      // inside and project type aids
      model.projectType === FundraisingProjectTypes.AIDS ? this.loadSanadyMainClassification(model.sanadiDomain) : null
    this.getOldValues()
  }

  private createFieldObservable({ ctrl, key }: { ctrl: AbstractControl, key: string }): Observable<{
    oldValue: number,
    newValue: number,
    field: AbstractControl,
    key: string
  }> {
    // dirty way to handle first emit from workArea
    let count = 0;
    return ctrl.valueChanges.pipe(
      startWith<number, number>(ctrl.value),
      pairwise(),
      map(([oldValue, newValue]: [number, number]) => {
        return {
          oldValue,
          newValue,
          field: ctrl,
          key
        }
      }),
      filter(_ => {
        count += 1
        return key !== 'projectWorkArea' || (key === 'projectWorkArea' && count > 1)
      })
    )
  }

  private listenToDataWillEffectSelectedTemplate(): void {
    const fields = [
      { ctrl: this.permitType, key: 'permitType' },
      { ctrl: this.projectWorkArea, key: 'projectWorkArea' },
      { ctrl: this.domain, key: 'domain' },
      // { ctrl: this.mainDACCategory, key: 'mainDACCategory' },
      // { ctrl: this.mainUNOCHACategory, key: 'mainUNOCHACategory' },
      { ctrl: this.countriesField, key: 'countriesField' },
      { ctrl: this.projectType, key: 'projectType' },
      // { ctrl: this.internalProjectClassification, key: 'internalProjectClassification' },
      // { ctrl: this.sanadiDomain, key: 'sanadiDomain' },
      // { ctrl: this.sanadiMainClassification, key: 'sanadiMainClassification' },
    ]
    const fieldsObservables = fields.map((item) => this.createFieldObservable(item))
    merge(...fieldsObservables)
      .pipe(tap(() => {
        (this.model!.hasTemplate() || this.model!.hasYears() || this.model!.hasCountries()) ? this.userAnswer.next(UserClickOn.NO) : this.userAnswer.next(UserClickOn.YES)
      }))
      .pipe(filter(_ => this.model!.hasTemplate() || this.model!.hasYears() || this.model!.hasCountries()))
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap((value) => {
        return this.dialog.confirm(this.lang.map.this_change_will_effect_the_selected_template)
          .onAfterClose$
          .pipe(map((answer: UserClickOn) => ({
            ...value, answer
          })))
      })
      )
      .subscribe(({ answer, oldValue, field, key }) => {
        answer === UserClickOn.YES ? (() => {
          if (this.model && this.model.hasTemplate()) {
            this.deleteTemplate(true)
          }
        })() : (() => {
          let value = this.storedOldValues[key] || oldValue;
          field.setValue(value, { emitEvent: false })
          field.updateValueAndValidity({ emitEvent: false })
          this.storedOldValues[key] = value;
        })()
        this.userAnswer.next(answer === UserClickOn.YES ? UserClickOn.YES : UserClickOn.NO)
      })
  }

  private loadLicenseConfigurations() {
    this.serviceDataService
      .loadByCaseType(this.model!.caseType)
      .pipe(tap(configs => {
        this.configs = configs;
        this.maxDuration = configs.licenseMaxTime;
        this.minDuration = configs.licenseMinTime;
      }))
      .subscribe(() => {
        this.updateDurationValidator()
      })
  }

  private updateDurationValidator() {
    const defaultMin = Validators.min(this.minDuration);
    const defaultMax = Validators.max(this.maxDuration);
    this.licenseDuration.clearValidators()
    this.licenseDuration.addValidators([CustomValidators.required, defaultMin, defaultMax])
    this.licenseDuration.updateValueAndValidity({ emitEvent: false })
  }

  private getOldValues() {
    this.controlsToWatchOldValues.forEach((key) => {
      const ctrl = (this[key as keyof this] as unknown as AbstractControl)
      this.storedOldValues[key] = ctrl.getRawValue()
    })
  }

  isTargetedYearsDisabled(): boolean {
    return this.readonly || this.employeeService.isInternalUser() || (this.requestType.value === ServiceRequestTypes.CANCEL)
  }

  private listenToPermitTypeChanges() {
    this.permitType.valueChanges
      // .pipe(this.holdTillGetUserResponse())
      .pipe(takeUntil(this.destroy$))
      .subscribe((type: ProjectPermitTypes) => {
        [ProjectPermitTypes.CHARITY, ProjectPermitTypes.UNCONDITIONAL_RECEIVE].includes(type) ? (() => {
          this.projectWorkArea.setValue(null, { emitEvent: false })
        })() :
         (()=>{
          if(this.projectWorkArea.value === ExecutionFields.OutsideQatar )
              this.countriesField.setValue(null,{ emitEvent: false })
         })()
            // this.projectWorkArea.setValue(this.projectWorkArea.value || ProjectWorkArea.INSIDE_QATAR,{ emitEvent: false });

      })
  }
}
