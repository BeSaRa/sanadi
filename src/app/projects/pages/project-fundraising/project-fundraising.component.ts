import {Component} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {ProjectFundraising} from "@app/models/project-fundraising";
import {ProjectFundraisingService} from "@services/project-fundraising.service";
import {combineLatest, merge, Observable, of, Subject} from 'rxjs';
import {Lookup} from "@app/models/lookup";
import {LookupService} from "@services/lookup.service";
import {LangService} from "@services/lang.service";
import {Country} from "@app/models/country";
import {catchError, delay, exhaustMap, filter, map, startWith, switchMap, takeUntil, tap} from "rxjs/operators";
import {ProjectWorkArea} from "@app/enums/project-work-area";
import {ProjectPermitTypes} from "@app/enums/project-permit-types";
import {ServiceRequestTypes} from "@app/enums/service-request-types";
import {DialogService} from "@services/dialog.service";
import {ToastService} from "@services/toast.service";
import {DomainTypes} from "@app/enums/domain-types";
import {EmployeeService} from "@services/employee.service";
import {ProfileTypes} from "@app/enums/profile-types.enum";
import {Profile} from "@app/models/profile";
import {ActivatedRoute} from "@angular/router";
import {AidLookupService} from "@services/aid-lookup.service";
import {AidLookup} from "@app/models/aid-lookup";
import {CustomValidators} from "@app/validators/custom-validators";
import {DacOchaService} from "@services/dac-ocha.service";
import {AdminLookup} from "@app/models/admin-lookup";
import {ProjectTemplate} from "@app/models/projectTemplate";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {CommonCaseStatus} from "@app/enums/common-case-status.enum";
import {OpenFrom} from "@app/enums/open-from.enum";
import {CommonUtils} from "@helpers/common-utils";
import {FundraisingProjectTypes} from "@app/enums/fundraising-project-types";
import {LicenseService} from "@services/license.service";

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
  displayedColumns = ['name', 'serial', 'status', 'totalCost', 'actions']
  templateRequired: boolean = false;
  addTemplate$: Subject<any> = new Subject<any>();
  private profile?: Profile = this.employeeService.getProfile()
  private qatarCountry: Country = this.getQatarCountry()
  private loadedDacOchaBefore: Boolean = false;
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
  displayOchaSection: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    public fb: UntypedFormBuilder,
    public service: ProjectFundraisingService,
    private lookupService: LookupService,
    private toast: ToastService,
    private dialog: DialogService,
    private aidLookupService: AidLookupService,
    private employeeService: EmployeeService,
    private dacOchaService: DacOchaService,
    private licenseService: LicenseService,
    public lang: LangService) {
    super()
  }

  _getNewInstance(): ProjectFundraising {
    return new ProjectFundraising()
  }

  _initComponent(): void {
    this.loadSanadyDomains()
  }

  _buildForm(): void {
    const model = new ProjectFundraising()
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    })
  }

  _afterBuildForm(): void {
    this.loadLicenseById()
    this.handleReadonly()
    this.listenToAddTemplate();
    this.listenToProjectTotalCoastChanges();
    this.listenToLicenseSearch()
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
    this.model = model.clone<ProjectFundraising>({taskDetails: this.model?.taskDetails});

    if (
      [OperationTypes.CREATE, OperationTypes.UPDATE].includes(operation) && [SaveTypes.FINAL, SaveTypes.COMMIT].includes(saveType)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
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
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.selectedLicense = undefined;
    this.setDefaultValues()
    this.overrideValuesInCreate()
  }

  // noinspection JSUnusedLocalSymbols
  private markUnTouched(fields: AbstractControl[]): void {
    fields.forEach(field => {
      field.markAsPristine()
      field.markAsUntouched()
    })
  }

  private markRequired(fields: AbstractControl[], emitEvent: boolean = false): boolean {
    fields.forEach(field => {
      field.setValidators(CustomValidators.required)
      field.updateValueAndValidity({emitEvent})
    })
    return true
  }

  private markNotRequired(fields: AbstractControl[], emitEvent: boolean = false): boolean {
    fields.forEach(field => {
      field.removeValidators(CustomValidators.required)
      field.updateValueAndValidity({emitEvent})
    })
    return true
  }

  // noinspection JSUnusedLocalSymbols
  private emptyFields(fields: AbstractControl[], emitEvent: boolean = false): boolean {
    fields.forEach(field => field.setValue(null, {emitEvent}))
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
      this.permitType.setValue(ProjectPermitTypes.SINGLE_TYPE_PROJECT)
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
    this.aidLookupService.loadByCriteria({parent: null})
      .subscribe((list) => {
        this.sanadyDomains = list
      })
  }

  checkCountryDisabled(option: Country): boolean {
    return this.excludeQatar(option) || this.singleCountrySelect(option)
  }


  private openAddTemplatePopup(): void {
    if (!(this.countriesField.value as []).length) {
      this.dialog.error(this.lang.map.msg_please_select_x_to_continue.change({x: this.lang.map.country_countries}))
      return;
    }

    this.service
      .openDialogSearchTemplate(this.getSearchTemplateCriteria(), this.projectWorkArea.value, this.model?.getTemplateId())
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe((template: ProjectTemplate | undefined) => {
        this.model && template && this.model.setTemplate(template) && this.model.setProjectTotalCost(template.templateCost) && this.projectTotalCost.setValue(template.templateCost, {emitEvent: false})
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
      domain === DomainTypes.DEVELOPMENT ? external['mainDAC'] = 'mainDACCategory' : external['mainUNOCHA'] = 'mainUNOCHACategory';
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
        return {...acc, [key]: control.getRawValue()}
      }, {})
  }

  deleteTemplate(): void {
    if (this.readonly)
      return;

    this.dialog.confirm(this.lang.map.remove_template_will_empty_deduction_ration_list)
      .onAfterClose$
      .pipe(filter((val: UserClickOn) => val === UserClickOn.YES))
      .subscribe(() => {
        this.model && this.model.clearTemplate() && this.model.setProjectTotalCost(0) && this.projectTotalCost.setValue(0, {emitEvent: false})
        this.clearDeductionItems = true;
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
    const countriesMessage = this.lang.map.make_sure_that_x_sum_equal_to_target_amount.change({x: this.lang.map.country_countries})
    const yearsMessage = this.lang.map.make_sure_that_x_sum_equal_to_target_amount.change({x: this.lang.map.year_s})
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
    return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({requestType: this.requestType.value || null}), true, this.service.selectLicenseDisplayColumns)
      .onAfterClose$
      .pipe(map((result: ({ selected: ProjectFundraising, details: ProjectFundraising } | undefined)) => result ? result.details : result));
  }

  setSelectedLicense(licenseDetails: ProjectFundraising | undefined, ignoreUpdateForm: boolean) {
    this.selectedLicense = licenseDetails;
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
    this.aidLookupService.loadByCriteria({parent: parentId}).subscribe((list) => {
      this.sanadyMainClassifications = list
    })
  }

  private loadDacOuchMain(domain: DomainTypes | null, callback?: () => void): void {
    if (!domain || this.loadedDacOchaBefore) {
      callback && callback()
      return
    }

    this.dacOchaService.loadAsLookups()
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

  // noinspection JSUnusedLocalSymbols
  private _test(): void {
    this.permitType.setValue(ProjectPermitTypes.SECTIONAL_BASKET)
    this.projectWorkArea.setValue(ProjectWorkArea.OUTSIDE_QATAR)
    this.domain.setValue(DomainTypes.HUMANITARIAN)
    this.countriesField.setValue([231])
    this.mainUNOCHACategory.setValue(1)
  }

  private listenToPermitTypeChanges() {
    combineLatest([
      this.permitType.valueChanges.pipe(startWith<number, number>(this.permitType.value)),
      this.projectWorkArea.valueChanges.pipe(startWith<number, number>(this.projectWorkArea.value)),
      this.projectType.valueChanges.pipe(startWith<number, number>(this.projectType.value)),
      this.domain.valueChanges.pipe(startWith<number, number>(this.domain.value))
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([permitType, projectWorkArea, projectType, domain]: [ProjectPermitTypes, ProjectWorkArea, FundraisingProjectTypes, DomainTypes]) => {
        console.log(
          ProjectPermitTypes[permitType],
          ProjectWorkArea[projectWorkArea],
          DomainTypes[domain],
          FundraisingProjectTypes[projectType]
        );
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
    this.displaySanadySection = !!(this.displayInsideQatar && model.projectType && model.projectType === FundraisingProjectTypes.AIDS)
    this.displayInternalSection = !!(this.displayInsideQatar && model.projectType && model.projectType === FundraisingProjectTypes.SOFTWARE)
    this.displayDacSection = this.displayOutsideQatar && model.domain === DomainTypes.DEVELOPMENT
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

    this.displayInsideQatar && this.markNotRequired(outsideFields) && (() => {
      this.markRequired([this.projectType])
      this.displaySanadySection ? this.markRequired(sanadyFields) : this.markNotRequired(sanadyFields)
      this.displayInternalSection ? this.markRequired([this.internalProjectClassification]) : this.markNotRequired([this.internalProjectClassification])
    })()

    this.displayOutsideQatar && this.markNotRequired(insideFields) && (() => {
      this.markRequired([this.domain])
      this.displayDacSection ? this.markRequired(dacFields) : this.markNotRequired(dacFields)
      this.displayOchaSection ? this.markRequired(ochaFields) : this.markNotRequired(ochaFields)
    })()

  }

  private listenToSanadyDomainChanges() {
    this.sanadiDomain.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.sanadiMainClassification.setValue(null)
        this.loadSanadyMainClassification(value)
      })
  }

  private listenToProjectTypeChanges() {
    this.projectType.valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(val => !!val))
      .subscribe((value: FundraisingProjectTypes) => {
        value === FundraisingProjectTypes.AIDS ? this.emptyFields([this.internalProjectClassification]) : this.emptyFields([this.sanadiDomain, this.sanadiMainClassification])
      })
  }

  private listenToWorkAreaChanges() {
    const aidFields = [this.projectType, this.sanadiDomain, this.sanadiMainClassification, this.internalProjectClassification]
    const domainFields = [this.domain, this.mainDACCategory, this.mainUNOCHACategory, this.subUNOCHACategory, this.subDACCategory]
    this.projectWorkArea
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: ProjectWorkArea) => {
        value === ProjectWorkArea.OUTSIDE_QATAR && (() => {
          !this.domain.value && this.domain.setValue(DomainTypes.HUMANITARIAN)
          this.domain.updateValueAndValidity()
          this.loadDacOuchMain(this.domain.value)
          this.emptyFields(aidFields)
          this.countriesField.setValue(((this.countriesField.value ?? []) as number[]).filter(id => id !== this.qatarCountry.id))
          this.countriesField.enable()
        })()

        value === ProjectWorkArea.INSIDE_QATAR && (() => {
          !this.projectType.value && this.projectType.setValue(FundraisingProjectTypes.SOFTWARE)
          this.projectType.updateValueAndValidity()
          this.emptyFields(domainFields)
          this.countriesField.setValue([this.qatarCountry.id])
          this.countriesField.disable()
        })()

        !value && this.emptyFields(aidFields.concat(domainFields))
      })
  }

  private listenToMainDacOchaChanges() {
    merge(this.mainDACCategory.valueChanges, this.mainUNOCHACategory.valueChanges)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.loadSubDacOchaByParentId(value)
      })
  }

  private listenToDomainChanges() {
    const dacFields = [this.mainDACCategory, this.subDACCategory]
    const ochaFields = [this.mainUNOCHACategory, this.subUNOCHACategory]
    this.domain
      .valueChanges
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
    model.projectWorkArea === ProjectWorkArea.OUTSIDE_QATAR && this.loadSubDacOchaByParentId(model.getDacOchaId())
    model.projectWorkArea === ProjectWorkArea.INSIDE_QATAR && model.projectType === FundraisingProjectTypes.AIDS && this.loadSanadyMainClassification(model.sanadiDomain)
  }
}
