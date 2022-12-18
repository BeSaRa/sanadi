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
import {filter, switchMap, takeUntil, tap} from "rxjs/operators";
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

@Component({
  selector: 'project-fundraising',
  templateUrl: './project-fundraising.component.html',
  styleUrls: ['./project-fundraising.component.scss']
})
export class ProjectFundraisingComponent extends EServicesGenericComponent<ProjectFundraising, ProjectFundraisingService> {
  form!: UntypedFormGroup;
  requestTypes: Lookup[] = this.lookupService.listByCategory.ServiceRequestType.slice().sort((a, b) => a.lookupKey - b.lookupKey)
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
  displayedColumns = ['name', 'serial', 'status', 'totalCost', 'actions']
  templateRequired: boolean = false;
  addTemplate$: Subject<any> = new Subject<any>();
  private profile?: Profile = this.employeeService.getProfile()
  private qatarCountry: Country = this.getQatarCountry()
  private loadedDacOchaBefore: Boolean = false;
  clearDeductionItems: boolean = false;
  selectedLicense?: ProjectFundraising;

  deductionRatioChanged: boolean = false

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
    this.handleReadonly()
    this.listenToPermitTypeWorkAreaChanges()
    this.listenToDomainChanges()
    this.listenToSanadiDomainChanges()
    this.listenToMainDacOchaChanges();
    this.overrideValuesInCreate()
    this.listenToAddTemplate()
    this.listenToProjectTotalCoastChanges()
    this.setDefaultValues()
    // this._test()
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (saveType === SaveTypes.DRAFT)
      return true

    return of(this.form.valid)
      .pipe(tap(valid => !valid && this.invalidFormMessage()))
      .pipe(filter(valid => valid));
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    if (this.model && !this.model.deductedPercentagesItemList.length) {
      this.invalidItemMessage();
    }
    return true;
  }

  private invalidItemMessage() {
    this.dialog.error(this.lang.map.please_add_deduction_items_to_proceed);
  }

  _afterLaunch(): void {
    this.resetForm$.next();
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
    this.model = model;
    if (
      [OperationTypes.CREATE, OperationTypes.UPDATE].includes(operation) && [SaveTypes.FINAL, SaveTypes.COMMIT].includes(saveType)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {
    console.log(error);
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
        console.log('listenToPermitTypeWorkAreaChanges');
        this.handlePermitTypeChanges(type, area)
      })
  }

  private handlePermitTypeChanges(type: ProjectPermitTypes, area: ProjectWorkArea) {
    console.log('PERMIT CHANGE');
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
      console.log('NO AREA');
    } else {
      console.log('IN AREA');
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
    combineLatest([this.domain.valueChanges, this.permitType.valueChanges])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([domain, permitType]: [DomainTypes, ProjectPermitTypes]) => {
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
    console.log('DOMAIN CHANGE');
    this.displayDacSection = domain === DomainTypes.DEVELOPMENT;
    this.displayOuchSection = domain === DomainTypes.HUMANITARIAN && permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT
    const dacFields = [this.mainDACCategory, this.subDACCategory]
    const ochaFields = [this.mainUNOCHACategory, this.subUNOCHACategory]
    const allFields = dacFields.concat(ochaFields);
    this.setFieldsToNull(allFields)
    this.markAsFieldsUnTouchedAndPristine(allFields)
    if (this.displayOuchSection) {
      this.displayLicenseAndTargetCostFields = true;
      this.markRequiredFields(ochaFields)
      this.markUnRequiredFields(dacFields)
    } else if (this.displayDacSection) {
      this.displayLicenseAndTargetCostFields = true;
      this.markRequiredFields(dacFields)
      this.markUnRequiredFields(ochaFields)
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
    console.log('INSIDE');
    this.displayDomainSection = false;
    this.displayAidSection = true;
    !this.projectType.value ? this.projectType.setValue(ProjectTypes.SOFTWARE) : null
    this.markUnRequiredFields(domainFields);
    this.setFieldsToNull(domainFields);
    this.markRequiredFields(aidFields);
    this.countriesField.setValue([this.qatarCountry.id]);
    this.countriesField.disable();
    this.displayLicenseAndTargetCostFields = false;
  }

  private handleOutsideQatar(domainFields: AbstractControl[], aidFields: AbstractControl[]): void {
    console.log('OUTSIDE');
    !this.domain.value ? this.domain.setValue(DomainTypes.HUMANITARIAN) : null;
    this.displayAidSection = false;
    this.displayDomainSection = true;
    this.markUnRequiredFields(aidFields);
    this.setFieldsToNull(aidFields);
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

  private loadSubDacOchaByParentId(parentId: number): void {
    this.dacOchaService.loadByParentId(parentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.domain.value === DomainTypes.DEVELOPMENT ? this.subDacCategories = list : this.subUNOCHACategories = list
      })
  }

  private listenToMainDacOchaChanges() {
    merge(this.mainDACCategory.valueChanges, this.mainUNOCHACategory.valueChanges)
      .pipe(takeUntil(this.destroy$))
      .pipe(filter(value => !!value))
      .subscribe((value: number) => {
        this.loadSubDacOchaByParentId(value)
      })
  }

  private openAddTemplatePopup(): void {
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

    const external: Record<string, string> = {
      domain: 'domain',
      countries: 'countriesField'
    };

    if (workArea === ProjectWorkArea.OUTSIDE_QATAR) {
      domain === DomainTypes.DEVELOPMENT ? external['mainDAC'] = 'mainDACCategory' : external['mainUNOCHA'] = 'mainUNOCHACategory';
    }
    const internal: Record<string, string> = {
      projectType: 'projectType',
      internalProjectClassification: 'internalProjectClassification',
      countries: 'countriesField'
    };

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
    this.clearDeductionItems = false;
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
    } else {
      this.displayDomainSection = model.projectWorkArea === ProjectWorkArea.OUTSIDE_QATAR;
      this.displayAidSection = model.projectWorkArea === ProjectWorkArea.INSIDE_QATAR;

      this.displayDacSection = this.displayDomainSection && model.domain === DomainTypes.DEVELOPMENT;
      this.displayOuchSection = model.permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT && model.domain === DomainTypes.HUMANITARIAN

      this.displayLicenseAndTargetCostFields = this.displayDacSection || this.displayOuchSection

      this.templateRequired = model.permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT;

      this.templateRequired ? this.projectTotalCost.disable() : this.projectTotalCost.enable()
    }

  }

  handleReadonly(): void {
    console.log('CHECK READ ONLY');
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
        console.log('INSIDE IF');
        this.readonly = false;
      }
    }

  }
}
