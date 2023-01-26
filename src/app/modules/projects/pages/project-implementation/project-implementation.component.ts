import {Component} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {ProjectImplementation} from "@app/models/project-implementation";
import {LangService} from '@app/services/lang.service';
import {ProjectImplementationService} from "@services/project-implementation.service";
import {merge, Observable, of, Subject} from 'rxjs';
import {DialogService} from "@services/dialog.service";
import {ToastService} from "@services/toast.service";
import {Lookup} from "@models/lookup";
import {LookupService} from "@services/lookup.service";
import {ServiceRequestTypes} from "@app/enums/service-request-types";
import {CommonUtils} from "@helpers/common-utils";
import {filter, map, switchMap, takeUntil, tap} from "rxjs/operators";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {Country} from "@models/country";
import {ActivatedRoute} from "@angular/router";
import {DomainTypes} from "@app/enums/domain-types";
import {AdminLookup} from "@models/admin-lookup";
import {DacOchaService} from "@services/dac-ocha.service";
import {ProjectWorkArea} from "@app/enums/project-work-area";
import {EmployeeService} from '@app/services/employee.service';
import {ImplementationCriteriaContract} from "@contracts/implementation-criteria-contract";
import {DateUtils} from "@helpers/date-utils";
import {ImplementingAgency} from "@models/implementing-agency";
import {ImplementationTemplate} from "@models/implementation-template";
import {ImplementationFundraising} from "@models/implementation-fundraising";
import {FundSourceType} from "@app/enums/fund-source-type";
import {FundingResourceContract} from "@contracts/funding-resource-contract";
import currency from "currency.js";

@Component({
  selector: 'project-implementation',
  templateUrl: './project-implementation.component.html',
  styleUrls: ['./project-implementation.component.scss']
})
export class ProjectImplementationComponent extends EServicesGenericComponent<ProjectImplementation, ProjectImplementationService> {
  form!: UntypedFormGroup;
  licenseSearch$: Subject<string> = new Subject()
  requestTypes: Lookup[] = this.lookupService.listByCategory.ServiceRequestType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  workAreas: Lookup[] = this.lookupService.listByCategory.ProjectWorkArea.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  internalProjectClassifications: Lookup[] = this.lookupService.listByCategory.InternalProjectClassification.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  countries: Country[] = this.activatedRoute.snapshot.data['countries'] as Country[];
  private qatarCountry: Country = this.getQatarCountry();
  domains: Lookup[] = this.lookupService.listByCategory.Domain;
  agencyTypes: Lookup[] = this.lookupService.listByCategory.ImplementingAgencyType;
  mainDacCategories: AdminLookup[] = [];
  subDacCategories: AdminLookup[] = [];
  mainUNOCHACategories: AdminLookup[] = [];
  subUNOCHACategories: AdminLookup[] = [];
  private loadedDacOchaBefore: boolean = false;
  displayDac: boolean = false;
  displayOcha: boolean = false;
  displayDomain: boolean = false;
  displayInternal: boolean = true;

  FundSourceType: typeof FundSourceType = FundSourceType

  datepickerOptionsMap = {
    licenseStartDate: DateUtils.getDatepickerOptions({disablePeriod: 'none', openSelectorTopOfInput: true})
  }
  remainingAmount: number = 0;

  constructor(public lang: LangService,
              public fb: UntypedFormBuilder,
              private lookupService: LookupService,
              public service: ProjectImplementationService,
              public toast: ToastService,
              private activatedRoute: ActivatedRoute,
              private dacOchaService: DacOchaService,
              public employeeService: EmployeeService,
              public dialog: DialogService) {
    super();
  }

  get basicInfo(): AbstractControl {
    return this.form.get('basicInfo')!
  }

  get projectInfo(): AbstractControl {
    return this.form.get('projectInfo')!
  }

  get fundingResources(): AbstractControl {
    return this.form.get('fundingResources')!
  }

  get specialExplanations(): AbstractControl {
    return this.form.get('specialExplanations')!
  }


  get requestType(): AbstractControl {
    return this.basicInfo.get('requestType')!
  }

  get oldLicenseFullSerial(): AbstractControl {
    return this.basicInfo.get('oldLicenseFullSerial')!
  }

  get domain(): AbstractControl {
    return this.basicInfo.get('domain')!
  }

  get mainDACCategory(): AbstractControl {
    return this.basicInfo.get('mainDACCategory')!
  }

  get mainUNOCHACategory(): AbstractControl {
    return this.basicInfo.get('mainUNOCHACategory')!
  }

  get subDACCategory(): AbstractControl {
    return this.basicInfo.get('subDACCategory')!
  }

  get subUNOCHACategory(): AbstractControl {
    return this.basicInfo.get('subUNOCHACategory')!
  }

  get projectWorkArea(): AbstractControl {
    return this.basicInfo.get('projectWorkArea')!
  }

  get beneficiaryCountry(): AbstractControl {
    return this.basicInfo.get('beneficiaryCountry')!
  }

  get internalProjectClassification(): AbstractControl {
    return this.basicInfo.get('internalProjectClassification')!
  }

  get licenseStartDate(): AbstractControl {
    return this.projectInfo.get('licenseStartDate')!
  }

  get implementationTemplate(): AbstractControl {
    return this.projectInfo.get('implementationTemplate')!
  }

  get implementationFundraising(): AbstractControl {
    return this.fundingResources.get('implementationFundraising')!
  }

  get implementingAgencyType(): AbstractControl {
    return this.projectInfo.get('implementingAgencyType')!
  }


  get implementingAgencyList(): AbstractControl {
    return this.projectInfo.get('implementingAgencyList')!
  }

  get financialGrant(): AbstractControl {
    return this.fundingResources.get('financialGrant')!
  }

  get selfFinancing(): AbstractControl {
    return this.fundingResources.get('selfFinancing')!
  }

  get projectTotalCost(): AbstractControl {
    return this.basicInfo.get('projectTotalCost')!
  }

  // it should be
  getCriteria = (): ImplementationCriteriaContract => {
    return {
      workArea: this.projectWorkArea.value,
      countries: [this.beneficiaryCountry.value],
      domain: this.domain.value,
      internalProjectClassification: this.internalProjectClassification.value,
      mainDAC: this.mainDACCategory.value,
      mainUNOCHA: this.mainUNOCHACategory.value
    }
  }


  _getNewInstance(): ProjectImplementation {
    return new ProjectImplementation()
  }

  _initComponent(): void {
    // load anything you need it here while initialize the component

  }

  _buildForm(): void {
    const model = new ProjectImplementation()
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      projectInfo: this.fb.group(model.buildProjectInfo(true)),
      fundingResources: this.fb.group(model.buildFundingResources(true)),
      specialExplanations: this.fb.group(model.buildSpecialInfo(true))
    })
  }

  _afterBuildForm(): void {
    this.listenToMainDacOchaChanges()
    this.listenToWorkAreaChanges()
    this.listenToDomainChange()
    this.listenToImplementingAgencyListChanges()
    this.listenToImplementationTemplateChanges()
    this.listenToFundingResources()

    this.setDefaultValues()
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    // make sure her that all required field filled with proper values and your form has valid state
    // also for anything ypu need to validate before save happens
    return saveType === SaveTypes.DRAFT ? true : this.form.valid
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    // validate for anything before launch the case
    return this.form.valid
  }

  _afterLaunch(): void {
    this._resetForm()
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): ProjectImplementation | Observable<ProjectImplementation> {
    return new ProjectImplementation().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.projectInfo.getRawValue(),
      ...this.fundingResources.getRawValue()
    })
  }

  _afterSave(model: ProjectImplementation, saveType: SaveTypes, operation: OperationTypes): void {
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
    console.log('Save Fail', error);
  }

  _launchFail(error: any): void {
    console.log('Launch Fail', error);
  }

  _destroyComponent(): void {
  }

  _updateForm(model: ProjectImplementation | undefined): void {
    if (!model) {
      return;
    }
    this.model = model;
    this.form.patchValue({
      basicInfo: model.buildBasicInfo(),
      projectInfo: model.buildProjectInfo(),
      fundingResources: model.buildFundingResources(),
      specialExplanations: model.buildSpecialInfo()
    })
    this.handleDisplayFields(model)
    this.handleMandatoryFields()
    this.calculateRemaining()
  }

  _resetForm(): void {
    this.form.reset()
  }

  private setDefaultValues(): void {
    // set default will work only in create a new case
    if (this.operation !== OperationTypes.CREATE) {
      return
    }

    this.requestType.setValue(ServiceRequestTypes.NEW)
    this.projectWorkArea.setValue(ProjectWorkArea.INSIDE_QATAR)
    this.internalProjectClassification.setValue(this.internalProjectClassifications[0].lookupKey)
  }

  _afterOpenCase(model: ProjectImplementation) {
    // this method will work only if you opened the case for the first time
    // Usually used to load the lookups related to select controllers
    this.displayDomain ? (() => {
      this.loadDacOuchMain(model.domain)
      this.loadSubDacOchaByParentId(this.displayDac ? model.mainDACCategory : model.mainUNOCHACategory)
    })() : null
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

  licenseSearch($event?: Event) {
    $event?.preventDefault();
    this.licenseSearch$.next((this.oldLicenseFullSerial.value as string || '').trim())
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

  private getQatarCountry(): Country {
    return this.countries.find(item => item.enName.toLowerCase() === 'qatar')!
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

  private listenToMainDacOchaChanges() {
    merge(this.mainDACCategory.valueChanges, this.mainUNOCHACategory.valueChanges)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.subUNOCHACategory.setValue(null)
        this.subDACCategory.setValue(null)
        this.loadSubDacOchaByParentId(value)
        this.model && (this.domain.value === DomainTypes.HUMANITARIAN ? this.model.mainUNOCHACategory = value : this.model.mainDACCategory = value)
      })
  }

  private listenToWorkAreaChanges() {
    this.projectWorkArea.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: ProjectWorkArea) => {
        const dacFields = [
          this.mainDACCategory,
          this.subDACCategory
        ];
        const ochaFields = [
          this.mainUNOCHACategory,
          this.subUNOCHACategory
        ]

        const outsideFields = dacFields.concat(ochaFields).concat(this.domain)
        const insideFields = [this.internalProjectClassification]

        if (value === ProjectWorkArea.INSIDE_QATAR) {
          this.displayDomain = this.displayOcha = this.displayDac = false;
          this.displayInternal = true;
          this.beneficiaryCountry.setValue(this.qatarCountry.id)
          this.internalProjectClassification.setValue(this.internalProjectClassifications[0].lookupKey)
          this.setFieldsToNull(outsideFields)
          this.beneficiaryCountry.disable()
        } else {
          this.displayDomain = true;
          this.displayInternal = false
          this.domain.setValue(DomainTypes.HUMANITARIAN)
          this.beneficiaryCountry.enable()
          this.setFieldsToNull(insideFields.concat(this.beneficiaryCountry))
        }

        this.model && (this.model.projectWorkArea = value)

        this.handleDisplayFields({
          projectWorkArea: value,
          domain: this.domain.value
        })
        this.handleMandatoryFields()
      })
  }

  private listenToDomainChange(): void {
    this.domain.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: DomainTypes) => {
        this.mainUNOCHACategory.setValue(null, {emitEvent: false})
        this.mainDACCategory.setValue(null, {emitEvent: false})
        this.displayDac = value === DomainTypes.DEVELOPMENT;
        this.displayOcha = value === DomainTypes.HUMANITARIAN;
        this.loadDacOuchMain(value)
        this.model && (this.model.domain = value)
      })
  }

  isDisabledCountry(country: Country): boolean {
    return this.projectWorkArea.value === ProjectWorkArea.OUTSIDE_QATAR && country.id === this.qatarCountry.id
  }

  handleDisplayFields(model: Partial<ProjectImplementation>): void {
    this.displayDomain = model.projectWorkArea === ProjectWorkArea.OUTSIDE_QATAR;
    this.displayInternal = model.projectWorkArea === ProjectWorkArea.INSIDE_QATAR;
    this.displayDac = this.displayDomain && model.domain === DomainTypes.DEVELOPMENT
    this.displayOcha = this.displayDomain && model.domain === DomainTypes.HUMANITARIAN
  }

  handleMandatoryFields(): void {
    const dacFields = [
      this.mainDACCategory,
      this.subDACCategory
    ];
    const ochaFields = [
      this.mainUNOCHACategory,
      this.subUNOCHACategory
    ]
    const outsideFields = dacFields.concat(ochaFields).concat(this.domain)
    const insideFields = [this.internalProjectClassification]

    if (this.displayInternal) {
      this.markFieldsOptional(outsideFields)
      this.markFieldsRequired(insideFields)
    } else {
      this.markFieldsOptional(insideFields)
      this.markFieldsRequired([this.domain])
      this.displayDac ? (() => {
        this.markFieldsOptional(ochaFields)
        this.markFieldsRequired(dacFields)
      })() : (() => {
        this.markFieldsOptional(dacFields)
        this.markFieldsRequired(ochaFields)
      })()
    }
  }

  private listenToImplementingAgencyListChanges() {
    this.implementingAgencyList
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: ImplementingAgency[]) => {
        value.length ? this.implementingAgencyType.disable() : this.implementingAgencyType.enable()
      })
  }

  private listenToImplementationTemplateChanges() {
    this.implementationTemplate
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .pipe(tap((value: ImplementationTemplate[]) => {
        value && value.length ? this.projectTotalCost.patchValue(value[0].projectTotalCost) : this.projectTotalCost.patchValue(0)
      }))
      .pipe(filter((value): value is ImplementationTemplate[] => !!value.length))
      .pipe(map(val => val[0] as ImplementationTemplate))
      .pipe(switchMap(template => template.loadImplementationFundraising()))
      .pipe(filter((value): value is ImplementationFundraising => !!value))
      .subscribe((implementationFundraising) => {
        this.implementationFundraising.setValue([implementationFundraising])
      })
  }

  private listenToFundingResources() {
    merge(
      this.implementationTemplate.valueChanges,
      this.implementationFundraising.valueChanges,
      this.financialGrant.valueChanges,
      this.selfFinancing.valueChanges,
    ).pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.calculateRemaining()
      })
  }

  private calculateRemaining(): void {
    const projectTotalCost = this.projectTotalCost.getRawValue() as number
    const grant = this.financialGrant.getRawValue() as FundingResourceContract[];
    const self = this.selfFinancing.getRawValue() as FundingResourceContract[];
    const fundRaising = this.implementationFundraising.getRawValue() as FundingResourceContract[];
    const allFields = [grant, self, fundRaising];
    const totalFundingResource = allFields.reduce((acc, fields) => {
      return acc + this.getTotalCost(fields)
    }, 0)
    this.remainingAmount = currency(projectTotalCost).subtract(totalFundingResource).value
  }

  private getTotalCost(list: (FundingResourceContract)[]): number {
    return list.reduce((acc, item) => {
      return acc + item.totalCost
    }, 0)
  }
}
