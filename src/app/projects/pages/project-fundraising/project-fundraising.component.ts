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
import {delay, exhaustMap, filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
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
import {ProjectTypes} from "@app/enums/project-types";
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
  displayDomainSection: boolean = false;
  displayAidSection: boolean = false;
  displayDacSection: boolean = false;
  displayOuchSection: boolean = false;
  displayLicenseAndTargetCostFields = false;
  displayWorkAreaAndCountry: boolean = true;
  displaySanady: boolean = false;
  displayIPC: boolean = false;
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
    this.listenToPermitTypeWorkAreaChanges()
    this.listenToDomainChanges()
    this.listenToSanadiDomainChanges()
    this.listenToMainDacOchaChanges();
    this.listenToAddTemplate();
    this.listenToProjectTotalCoastChanges();
    this.listenToProjectTypeChanges();
    this.listenToPermitTypeChange()
    this.setDefaultValues();
    this.overrideValuesInCreate();
    this.listenToLicenseSearch()
    this.checkTemplateTabValidity()
    // only it work on edit mode
    this.prepareNecessaryData()
    // this._test()

    // this.debugPurpose(this.basicInfo as UntypedFormGroup);
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
          this.resetForm$.next();
          this.requestType.setValue(requestTypeValue);
        }
        this.requestType$.next(requestTypeValue);

      } else {
        this.requestType.setValue(this.requestType$.value);
      }
    });
  }

  _updateForm(model: ProjectFundraising | undefined): void {
    if (!model) {
      return;
    }
    this.model = model;
    this.form.patchValue({
      basicInfo: this.model.buildBasicInfo(),
      explanation: this.model.buildExplanation()
    });
    this.handleRequestTypeChange(model.requestType, false);
    this.validateHiddenDisplayFields()
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.selectedLicense = undefined;
    this.setDefaultValues()
    this.overrideValuesInCreate()
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

  private getQatarCountry(): Country {
    return this.countries.find(item => item.enName.toLowerCase() === 'qatar')!
  }

  private setDefaultValues(): void {
    if (this.operation === OperationTypes.CREATE) {
      this.requestType.setValue(ServiceRequestTypes.NEW)
      this.projectWorkArea.setValue(ProjectWorkArea.INSIDE_QATAR)
      this.permitType.setValue(ProjectPermitTypes.SINGLE_TYPE_PROJECT)
    }
  }

  private listenToPermitTypeWorkAreaChanges(): void {
    combineLatest([this.permitType.valueChanges, this.projectWorkArea.valueChanges])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([type, area]: [ProjectPermitTypes, ProjectWorkArea]) => {
        this.handlePermitTypeChanges(type, area)
      })
  }

  private handlePermitTypeChanges(type: ProjectPermitTypes, area: ProjectWorkArea) {
    const workAreaAndCountriesFields = [this.projectWorkArea, this.countriesField];
    const domainFields = [
      this.domain,
      this.mainDACCategory,
      this.subDACCategory,
      this.mainUNOCHACategory,
      this.subUNOCHACategory
    ]
    const aidFields = [
      this.projectType,
      this.internalProjectClassification,
      this.sanadiDomain,
      this.sanadiMainClassification,
    ]
    const allFields = aidFields.concat(domainFields);

    if ([ProjectPermitTypes.UNCONDITIONAL_RECEIVE, ProjectPermitTypes.CHARITY].includes(type)) {
      this.templateRequired = false;
      this.displayWorkAreaAndCountry = false;
      this.displayDomainSection = false;
      this.displayAidSection = false;
      this.displayLicenseAndTargetCostFields = true;
      // mark the workArea and countries not required and empty the values this hide theme
      this.markUnRequiredFields(workAreaAndCountriesFields)
      this.countriesField.setValue([])
      this.projectWorkArea.setValue(null, {emitEvent: false})
      this.projectWorkArea.updateValueAndValidity({emitEvent: false})
      this.markUnRequiredFields(allFields)
      this.setFieldsToNull(allFields)
      this.projectTotalCost.enable()
    } else {
      this.displayLicenseAndTargetCostFields = false;
      this.displayWorkAreaAndCountry = true;
      !this.projectWorkArea.value ? this.projectWorkArea.setValue(area, {emitEvent: false}) : null;
      area === ProjectWorkArea.INSIDE_QATAR ? this.handleInsideQatar(domainFields, aidFields) : this.handleOutsideQatar(domainFields, aidFields)
      if (type === ProjectPermitTypes.SINGLE_TYPE_PROJECT) {
        this.templateRequired = true;
        this.projectTotalCost.disable()
      } else {
        this.templateRequired = false;
        this.projectTotalCost.enable()
      }
    }

  }

  private listenToDomainChanges(): void {
    combineLatest([this.domain.valueChanges, this.permitType.valueChanges, this.projectWorkArea.valueChanges.pipe(delay(200))])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([domain, permitType, _workArea]: [DomainTypes, ProjectPermitTypes, ProjectWorkArea]) => {
        this.handleDomainChanges(domain, permitType)
      })
  }

  private markRequiredFields(fields: AbstractControl[], emitEvent: boolean = false): void {
    fields.forEach(field => {
      field.setValidators(CustomValidators.required)
      field.updateValueAndValidity({emitEvent})
    })
  }

  private markUnRequiredFields(fields: AbstractControl[], emitEvent: boolean = false): void {
    fields.forEach(field => {
      field.removeValidators(CustomValidators.required)
      field.updateValueAndValidity({emitEvent})
    })
  }

  private handleDomainChanges(domain: DomainTypes, permitType: ProjectPermitTypes): void {
    const dacFields = [this.mainDACCategory, this.subDACCategory]
    const ochaFields = [this.mainUNOCHACategory, this.subUNOCHACategory]
    const allFields = dacFields.concat(ochaFields);
    const inputValue = this.domain.value;
    if (!inputValue) {
      this.setFieldsToNull(allFields)
      this.markUnRequiredFields(allFields)
      return
    }
    this.displayDacSection = domain === DomainTypes.DEVELOPMENT;
    this.displayOuchSection = domain === DomainTypes.HUMANITARIAN && permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT

    this.setFieldsToNull(allFields)
    this.markUnRequiredFields(allFields)
    this.markAsFieldsUnTouchedAndPristine(allFields)
    if (this.displayOuchSection) {
      this.displayLicenseAndTargetCostFields = true;
      this.markRequiredFields(ochaFields)
    } else if (this.displayDacSection) {
      this.displayLicenseAndTargetCostFields = true;
      this.markRequiredFields(dacFields)
    } else {
      this.displayLicenseAndTargetCostFields = !this.domain.value;
      this.markUnRequiredFields(allFields)
    }
    this.loadDacOuchMain(domain)
  }

  private markAsFieldsUnTouchedAndPristine(fields: AbstractControl[]): void {
    fields.forEach(field => {
      field.markAsPristine()
      field.markAsUntouched()
    })
  }

  private setFieldsToNull(fields: AbstractControl[], emitEvent: boolean = false): void {
    fields.forEach(field => field.setValue(null, {emitEvent}))
  }

  private handleInsideQatar(domainFields: AbstractControl[], aidFields: AbstractControl[]): void {
    this.displayDomainSection = false;
    this.displayAidSection = true;
    !this.projectType.value ? this.projectType.setValue(ProjectTypes.SOFTWARE) : null
    this.markUnRequiredFields(domainFields);
    this.setFieldsToNull(domainFields);
    this.countriesField.addValidators(CustomValidators.requiredArray)
    this.markRequiredFields(aidFields);
    this.countriesField.setValue([this.qatarCountry.id]);
    this.countriesField.disable();
    this.displayLicenseAndTargetCostFields = false;
  }

  private handleOutsideQatar(domainFields: AbstractControl[], aidFields: AbstractControl[]): void {
    !this.domain.value ? this.domain.setValue(DomainTypes.HUMANITARIAN) : null;
    this.displayAidSection = false;
    this.displayDomainSection = true;
    this.markUnRequiredFields(aidFields);
    this.setFieldsToNull(aidFields);
    this.countriesField.addValidators(CustomValidators.requiredArray)
    this.markRequiredFields(domainFields);
    this.countriesField.setValue(this.countriesField.value.filter((id: number) => id !== this.qatarCountry.id));
    this.countriesField.enable();
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

  private loadSanadyMainClassification(parentId: number | null): void {
    if (!parentId) {
      this.sanadyMainClassifications = []
      return
    }
    this.aidLookupService.loadByCriteria({parent: parentId}).subscribe((list) => {
      this.sanadyMainClassifications = list
    })
  }

  checkCountryDisabled(option: Country): boolean {
    return this.excludeQatar(option) || this.singleCountrySelect(option)
  }

  private listenToSanadiDomainChanges(): void {
    this.sanadiDomain.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.sanadiMainClassification.setValue(null)
        this.loadSanadyMainClassification(value)
      })
  }

  private loadDacOuchMain(domain: DomainTypes | null): void {
    if (!domain || this.loadedDacOchaBefore) {
      return
    }

    this.dacOchaService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.loadedDacOchaBefore = true;
        this.separateDacFromOcha(list);
      })
  }

  private separateDacFromOcha(list: AdminLookup[]) {
    this.mainDacCategories = list.filter(item => item.type === DomainTypes.DEVELOPMENT)
    this.mainUNOCHACategories = list.filter(item => item.type === DomainTypes.HUMANITARIAN)
  }

  private loadSubDacOchaByParentId(parentId: number | null): void {
    if (!parentId)
      return;
    this.dacOchaService.loadByParentId(parentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.domain.value === DomainTypes.DEVELOPMENT ? this.subDacCategories = list : this.subUNOCHACategories = list
      })
  }

  private listenToMainDacOchaChanges() {
    merge(this.mainDACCategory.valueChanges, this.mainUNOCHACategory.valueChanges)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.subDACCategory.setValue(null)
        this.subUNOCHACategory.setValue(null)
        this.loadSubDacOchaByParentId(value)
      })
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

  // noinspection JSUnusedLocalSymbols
  private _test(): void {
    this.permitType.setValue(ProjectPermitTypes.SECTIONAL_BASKET)
    this.projectWorkArea.setValue(ProjectWorkArea.OUTSIDE_QATAR)
    this.domain.setValue(DomainTypes.HUMANITARIAN)
    this.countriesField.setValue([231])
    this.mainUNOCHACategory.setValue(1)
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
    this.deductionRatioChanged = false
    setTimeout(() => this.deductionRatioChanged = true)
  }

  validateHiddenDisplayFields(): void {
    const model = this.model!
    if ([ProjectPermitTypes.UNCONDITIONAL_RECEIVE, ProjectPermitTypes.CHARITY].includes(model.permitType)) {
      this.displayAidSection = false;
      this.displayDomainSection = false;
      this.displayLicenseAndTargetCostFields = true;
      this.displayWorkAreaAndCountry = false;
      this.markUnRequiredFields([this.countriesField, this.projectWorkArea])
      this.countriesField.setValue([])
    } else {
      this.displayDomainSection = model.projectWorkArea === ProjectWorkArea.OUTSIDE_QATAR;
      this.displayAidSection = model.projectWorkArea === ProjectWorkArea.INSIDE_QATAR;

      this.displayDacSection = this.displayDomainSection && model.domain === DomainTypes.DEVELOPMENT;
      this.displayOuchSection = model.permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT && model.domain === DomainTypes.HUMANITARIAN

      this.displayLicenseAndTargetCostFields = this.displayDacSection || this.displayOuchSection

      this.handleProjectTypeChanges(model.projectType, true)

      this.templateRequired = model.permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT;

      this.templateRequired ? this.projectTotalCost.disable() : this.projectTotalCost.enable()
    }

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

  private listenToProjectTypeChanges() {
    combineLatest([this.projectType.valueChanges, this.permitType.valueChanges, this.projectWorkArea.valueChanges.pipe(delay(200))])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([value, ,]: [FundraisingProjectTypes, ProjectPermitTypes, ProjectWorkArea]) => {
        this.handleProjectTypeChanges(value);
      })
  }

  private handleProjectTypeChanges(projectType: FundraisingProjectTypes, ignoreSetValues = false) {
    const sanadyFields = [this.sanadiDomain, this.sanadiMainClassification];
    const aidFields = [this.internalProjectClassification]
    const allFields = sanadyFields.concat(aidFields)
    const inputValue = this.projectType.value;

    if (!inputValue) {
      this.markUnRequiredFields(allFields)
      return;
    }

    this.displayIPC = projectType === FundraisingProjectTypes.SOFTWARE;
    this.displaySanady = projectType === FundraisingProjectTypes.AIDS;

    this.displayIPC ? ((() => {
      this.markUnRequiredFields(sanadyFields)
      !ignoreSetValues && this.setFieldsToNull(sanadyFields)
      this.markRequiredFields(aidFields)
    })()) : (this.displaySanady ? ((() => {
      this.markUnRequiredFields(aidFields)
      !ignoreSetValues && this.setFieldsToNull(aidFields)
      this.markRequiredFields(sanadyFields)
    })()) : null)

    !this.displaySanady && !this.displayIPC ? (() => {
      this.markUnRequiredFields(allFields)
      !ignoreSetValues && this.setFieldsToNull(allFields)
    })() : null
  }

  isAllHasSameTargetAmount(): Observable<boolean> {
    const countriesMessage = this.lang.map.make_sure_that_x_sum_equal_to_target_amount.change({x: this.lang.map.country_countries})
    const yearsMessage = this.lang.map.make_sure_that_x_sum_equal_to_target_amount.change({x: this.lang.map.year_s})
    const model = this.model!
    return of(model)
      .pipe(map(_ => this.displayWorkAreaAndCountry ? model.targetAmount === model.calculateAllCountriesAmount() : true))
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

    this.templateTabHasError = model.hasInvalidTargetAmount(!this.displayWorkAreaAndCountry)
  }

  private listenToPermitTypeChange() {
    this.permitType
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: ProjectPermitTypes) => {
        value === ProjectPermitTypes.SINGLE_TYPE_PROJECT ? this.countriesField.setValue([]) : null
      })
  }

  get oldLicenseFullSerial(): AbstractControl {
    return this.basicInfo.get('oldLicenseFullSerial')!
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
      .pipe(exhaustMap(licenses => licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses)))
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

      this._updateForm(model);
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
    this.selectedLicense = undefined
  }

  private prepareNecessaryData() {
    if (this.operation !== OperationTypes.UPDATE)
      return;
    const model = this.model!
    const permitType = model.permitType;
    const workArea = model.projectWorkArea;
    const domain = model.domain;
    const dacOchaMainId = domain === DomainTypes.HUMANITARIAN ? model.mainUNOCHACategory : model.mainDACCategory;
    const projectType = model.projectType;
    const sanadyDomain = model.sanadiDomain
    if ([ProjectPermitTypes.UNCONDITIONAL_RECEIVE, ProjectPermitTypes.CHARITY].includes(permitType)) {
      return;
    }

    if (workArea === ProjectWorkArea.OUTSIDE_QATAR) {
      this.loadDacOuchMain(domain)
      this.loadSubDacOchaByParentId(dacOchaMainId)
    } else {
      projectType === FundraisingProjectTypes.AIDS ? (() => {
        this.loadSanadyMainClassification(sanadyDomain)
      })() : null;
    }
  }

  debugPurpose(formGroup: UntypedFormGroup) {
    console.log(Object.keys(formGroup.controls).reduce((acc, key) => {
      return {...acc, [key]: formGroup.controls[key].errors}
    }, {}));
  }
}
