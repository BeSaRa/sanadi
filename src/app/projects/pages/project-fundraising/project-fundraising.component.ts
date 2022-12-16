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
  disableQatarFromSelection: boolean = false;
  displayLicenseAndTargetCostFields = false;
  displayedColumns = ['name', 'serial', 'status', 'totalCost', 'actions']
  templateRequired: boolean = false;
  addTemplate$: Subject<any> = new Subject<any>();
  private profile?: Profile = this.employeeService.getProfile()
  private qatarCountry: Country = this.getQatarCountry()
  private loadedDacOchaBefore: Boolean = false;
  clearDeductionItems: boolean = false;
  selectedLicense?: ProjectFundraising;

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
    this.listenToPermitTypeAndWorkAreaChanges()
    this.listenToDomainChanges()
    this.listenToProjectWorkArea()
    this.listenToSanadiDomainChanges()
    this.listenToMainDacOchaChanges();
    this.setDefaultValues()
    this.overrideValuesInCreate()
    this.listenToAddTemplate()
    this.listenToProjectTotalCoastChanges()
    // this._test()
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
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
      basicInfo: model?.buildBasicInfo(),
      explanation: model?.buildExplanation()
    });
    this.handleRequestTypeChange(model.requestType, false);
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
      this.permitType.setValue(ProjectPermitTypes.SINGLE_TYPE_PROJECT)
      this.projectWorkArea.setValue(ProjectWorkArea.INSIDE_QATAR)
    }
  }

  private listenToPermitTypeAndWorkAreaChanges(): void {
    combineLatest([this.projectWorkArea.valueChanges, this.permitType.valueChanges])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([workArea, permitType]: [ProjectWorkArea, ProjectPermitTypes]) => {
        this.handelPermitTypeAndWorkAreaChanges(workArea, permitType);
      })
  }

  private listenToDomainChanges(): void {
    combineLatest([this.domain.valueChanges, this.permitType.valueChanges])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([domain, permitType]: [DomainTypes, ProjectPermitTypes]) => {
        this.handelDomainChanges(domain, permitType)
      })
  }

  private handelPermitTypeAndWorkAreaChanges(workArea: ProjectWorkArea, permitType: ProjectPermitTypes): void {
    this.displayDomainSection = workArea === ProjectWorkArea.OUTSIDE_QATAR && [ProjectPermitTypes.SINGLE_TYPE_PROJECT, ProjectPermitTypes.SECTIONAL_BASKET].includes(permitType);
    this.displayAidSection = workArea === ProjectWorkArea.INSIDE_QATAR && [ProjectPermitTypes.SINGLE_TYPE_PROJECT, ProjectPermitTypes.SECTIONAL_BASKET].includes(permitType);
    this.templateRequired = permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT
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

    const allFields = aidFields.concat(domainFields)

    if (this.displayAidSection) {
      this.displayLicenseAndTargetCostFields = false
      this.markAsFieldsUnTouchedAndPristine(domainFields)
      this.markUnRequiredFields(domainFields)
      this.markRequiredFields(aidFields)
    } else if (this.displayDomainSection) {
      this.displayLicenseAndTargetCostFields = false
      this.markAsFieldsUnTouchedAndPristine(aidFields)
      this.markUnRequiredFields(aidFields)
      this.markRequiredFields([this.domain])
      this.domain.setValue(DomainTypes.HUMANITARIAN)
    } else {
      this.markUnRequiredFields(allFields)
      this.displayLicenseAndTargetCostFields = true
    }
    // we will ge the total coast from the template
    this.templateRequired ? this.projectTotalCost.disable() : this.projectTotalCost.enable()
  }

  private markRequiredFields(fields: AbstractControl[]): void {
    fields.forEach(field => {
      field.setValidators(CustomValidators.required)
      field.updateValueAndValidity()
    })
  }

  private markUnRequiredFields(fields: AbstractControl[]): void {
    fields.forEach(field => {
      field.removeValidators(CustomValidators.required)
      field.updateValueAndValidity()
    })
  }

  private handelDomainChanges(domain: DomainTypes, permitType: ProjectPermitTypes): void {
    this.displayDacSection = domain === DomainTypes.DEVELOPMENT;
    this.displayOuchSection = domain === DomainTypes.HUMANITARIAN && permitType === ProjectPermitTypes.SINGLE_TYPE_PROJECT
    const dacFields = [this.mainDACCategory, this.subDACCategory]
    const ochaFields = [this.mainUNOCHACategory, this.subUNOCHACategory]
    const allFields = dacFields.concat(ochaFields);
    this.setFieldsToNull(allFields)
    this.markAsFieldsUnTouchedAndPristine(allFields)
    if (this.displayOuchSection) {
      this.markRequiredFields(ochaFields)
      this.markUnRequiredFields(dacFields)
    } else if (this.displayDacSection) {
      this.markRequiredFields(dacFields)
      this.markUnRequiredFields(ochaFields)
    } else {
      this.markUnRequiredFields(allFields)
    }
    this.loadDacOuchMain(domain)
  }

  private listenToProjectWorkArea(): void {
    this.projectWorkArea.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: ProjectWorkArea | null) => {
        this.countriesField.setValue([])
        value === ProjectWorkArea.INSIDE_QATAR ? this.handleInsideQatar() : this.handleOutsideQatar();
      })
  }

  private markAsFieldsUnTouchedAndPristine(fields: AbstractControl[]): void {
    fields.forEach(field => {
      field.markAsPristine()
      field.markAsUntouched()
    })
  }

  private setFieldsToNull(fields: AbstractControl[]): void {
    fields.forEach(field => field.setValue(null))
  }

  private handleInsideQatar(): void {
    this.basicInfo.patchValue({
      domain: null,
      mainDACCategory: null,
      subDACCategory: null,
      mainUNOCHACategory: null,
      subUNOCHACategory: null,
    })
    this.markAsFieldsUnTouchedAndPristine([this.domain, this.mainDACCategory, this.subDACCategory, this.mainUNOCHACategory, this.subUNOCHACategory])
    this.countriesField.setValue([this.qatarCountry.id])
    this.countriesField.disable()
    this.disableQatarFromSelection = false;
  }

  private handleOutsideQatar(): void {
    this.countriesField.setValue(this.countriesField.value.filter((id: number) => id !== this.qatarCountry.id))
    this.countriesField.enable()
    this.disableQatarFromSelection = true;
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
      (this.countriesField.value as number[]).length == 1 &&
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
    this.countriesField.setValue([231, 232, 233])
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
}
