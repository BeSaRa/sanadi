import { DialogService } from '@app/services/dialog.service';
import { ProjectImplementation } from '@models/project-implementation';
import { Validators } from '@angular/forms';
import { EmployeeService } from '@app/services/employee.service';
import { DacOchaService } from '@app/services/dac-ocha.service';
import { AbstractControl, UntypedFormControl } from '@angular/forms';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { Country } from '@app/models/country';
import { ProjectCompletion } from '@app/models/project-completion';
import { CountryService } from '@app/services/country.service';
import { LangService } from '@app/services/lang.service';
import { ProjectCompletionService } from '@app/services/project-completion.service';
import { ProjectImplementationService } from '@app/services/project-implementation.service';
import { merge, Observable, of } from 'rxjs';
import { Lookup } from '@app/models/lookup';
import { LookupService } from '@app/services/lookup.service';
import { AdminLookup } from '@app/models/admin-lookup';
import { ProjectWorkArea } from "@app/enums/project-work-area";
import { DomainTypes } from '@app/enums/domain-types';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { OpenFrom } from '@app/enums/open-from.enum';
import { BestPracticesListComponent } from '@app/modules/services/shared-services/components/best-practices-list/best-practices-list.component';
import { LessonsLearntListComponent } from '@app/modules/services/shared-services/components/lessons-learnt-list/lessons-learnt-list.component';
import { FieldControlAndLabelKey } from '@app/types/types';
import { ToastService } from '@app/services/toast.service';
import { ServiceRequestTypes } from '@app/enums/service-request-types';
import { CustomValidators } from '@app/validators/custom-validators';
import { DateUtils } from '@app/helpers/date-utils';
import { IKeyValue } from '@app/interfaces/i-key-value';

@Component({
  selector: 'app-project-completion',
  templateUrl: './project-completion.component.html',
  styleUrls: ['./project-completion.component.scss']
})
export class ProjectCompletionComponent extends EServicesGenericComponent<ProjectCompletion, ProjectCompletionService> {
  form!: UntypedFormGroup;
  countries: Country[] = [];
  workAreas: Lookup[] = this.lookupService.listByCategory.ProjectWorkArea.slice().sort((a, b) => a.lookupKey - b.lookupKey)
  domains: Lookup[] = this.lookupService.listByCategory.Domain;
  requestTypesList: Lookup[] = this.lookupService.listByCategory.RequestTypeNewOnly;
  mainDacCategories: AdminLookup[] = [];
  subDacCategories: AdminLookup[] = [];
  mainUNOCHACategories: AdminLookup[] = [];
  subUNOCHACategories: AdminLookup[] = [];
  internalProjectClassificationList: Lookup[] = this.lookupService.listByCategory.InternalProjectClassification;
  displayedColumns: string[] = [];
  private loadedDacOchaBefore: boolean = false;
  projectImplementationLicenses: ProjectImplementation[] = [];
  selectedLicense?: ProjectImplementation;
  @ViewChild('bestPracticesListComponent') bestPracticesListComponentRef!: BestPracticesListComponent;
  @ViewChild('lessonsLearntListComponent') lessonsLearntListComponentRef!: LessonsLearntListComponent;
  datepickerOptionsMap: IKeyValue = {
    projectEvaluationSLADate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
    actualEndDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
  };
  formProperties = {
    requestType: () => {
      return this.getObservableField('requestType', 'requestType');
    }
  }
  constructor(
    public service: ProjectCompletionService,
    public lang: LangService,
    public fb: UntypedFormBuilder,
    private countryService: CountryService,
    private lookupService: LookupService,
    private dacOchaService: DacOchaService,
    private employeeService: EmployeeService,
    private cd: ChangeDetectorRef,
    private dialog: DialogService,
    private toastService: ToastService,
    private projectImplementationService: ProjectImplementationService,
  ) {
    super();
  }
  private _loadCountries(): void {
    this.countryService.loadAsLookups().subscribe(e => {
      this.countries = [...e];
    });
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
      .pipe(filter((value) => value === DomainTypes.DEVELOPMENT || (value === DomainTypes.HUMANITARIAN)))
      .pipe(switchMap(() => this.dacOchaService.loadByParentId(parentId)))
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.domain.value === DomainTypes.DEVELOPMENT ? this.subDacCategories = list : this.subUNOCHACategories = list
        callback && callback()
      })
  }

  private _lestenToExternalProjectImplementation() {
    if (this.isDisplayOutsideQatar)
      this.projectImplementationService.getExternalProjectImplementation({
        domain: this.domain.value ? this.domain.value : '',
        mainDAC: this.mainDACCategory.value ? this.mainDACCategory.value : '',
        mainUNOCHA: this.mainUNOCHACategory.value ? this.mainUNOCHACategory.value : '',
        country: this.countryField.value
      }).subscribe((data) => {
        this.projectImplementationLicenses = data;
        this.selectProject(this.projectImplementationLicenses.find(lic => lic.fullSerial == this.model?.projectLicenseFullSerial))
      })
  }
  private _lestenToInternalProjectImplementation() {
    if (this.isDisplayInsideQatar)
      this.projectImplementationService.getInternalProjectImplementation({
        country: this.countryField.value,
        internalProjectClassification: this.internalProjectClassification.value ? this.internalProjectClassification.value : ''
      }).subscribe((data) => {
        this.projectImplementationLicenses = data;
        this.selectProject(this.projectImplementationLicenses.find(lic => lic.fullSerial == this.model?.projectLicenseFullSerial))
      })
  }
  listenToChangeExternalFields() {
    merge(this.mainDACCategory.valueChanges, this.mainUNOCHACategory.valueChanges, this.countryField.valueChanges)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this._lestenToExternalProjectImplementation();
      })
  }
  listenToChangeInternalFields() {
    merge(this.countryField.valueChanges, this.internalProjectClassification.valueChanges)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this._lestenToInternalProjectImplementation();
      })
  }
  _getNewInstance(): ProjectCompletion {
    return new ProjectCompletion();
  }
  _initComponent(): void {
    this._loadCountries();
  }
  _afterOpenCase(model: ProjectCompletion) {
    model.projectWorkArea === ProjectWorkArea.OUTSIDE_QATAR && (() => {
      this.loadDacOuchMain(model.domain)
      this.loadSubDacOchaByParentId(model.getDacOchaId())
    })()
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (saveType === SaveTypes.DRAFT)
      return this._isValidDraftData();

    return of(this.form.valid)
      .pipe(tap(valid => !valid && this.invalidFormMessage()))
      .pipe(filter(valid => valid))
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }
  _afterLaunch(): void {
    this.resetForm$.next();
    this.toastService.success(this.lang.map.request_has_been_sent_successfully);
  }
  _prepareModel(): ProjectCompletion | Observable<ProjectCompletion> {
    return new ProjectCompletion().clone({
      ...this.model,
      ...this.projectLicenseInfo.getRawValue(),
      ...this.projectBasicInfo.getRawValue(),
      ...this.beneficiaryAnalyticsByLicense.getRawValue(),
      ...this.evaluation.getRawValue(),
      ...this.specialExplanation.getRawValue(),
      bestPracticesList: this.bestPracticesListComponentRef.list,
      lessonsLearnedList: this.lessonsLearntListComponentRef.list,
    })
  }
  private _updateModelAfterSave(model: ProjectCompletion): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }
  _afterSave(model: ProjectCompletion, saveType: SaveTypes, operation: OperationTypes): void {
    this._updateModelAfterSave(model);

    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
    } else {
      this.toastService.success(this.lang.map.request_has_been_saved_successfully);
    }
  }
  _saveFail(error: any): void {
    console.log('problem in save');
  }
  _launchFail(error: any): void {
    console.log('problem in launch');
  }
  _destroyComponent(): void {
  }
  _buildForm(): void {
    const model = new ProjectCompletion()
    this.form = this.fb.group({
      projectLicenseInfo: this.fb.group(model.formBuilder(true).projectLicenseInfo),
      projectBasicInfo: this.fb.group(model.formBuilder(true).projectBasicInfo),
      beneficiaryAnalyticsByLicense: this.fb.group(model.formBuilder(true).beneficiaryAnalyticsByLicense, {
        validators: CustomValidators.validateSum(100, 2,
          [
            'beneficiaries0to5',
            'beneficiaries5to18',
            'beneficiaries19to60',
            'beneficiariesOver60'
          ],
          [
            this.lang.getLocalByKey('number_of_0_to_5'),
            this.lang.getLocalByKey('number_of_5_to_18'),
            this.lang.getLocalByKey('number_of_19_to_60'),
            this.lang.getLocalByKey('number_of_above_60')
          ]
        )
      }),
      evaluation: this.fb.group(model.formBuilder(true).evaluation),
      explanation: this.fb.group(model.formBuilder(true).explanation)
    })
  }
  _updateForm(model: ProjectCompletion | undefined): void {
    if (!model) {
      return;
    }
    this.model = model;
    this.form.patchValue({
      projectLicenseInfo: model.formBuilder(false).projectLicenseInfo,
      projectBasicInfo: model.formBuilder(false).projectBasicInfo,
      beneficiaryAnalyticsByLicense: model.formBuilder(false).beneficiaryAnalyticsByLicense,
      evaluation: model.formBuilder(false).evaluation,
      explanation: model.formBuilder(false).explanation
    });
    this.handleRequestTypeChange(model.requestType, false);
    if(!this.model.projectLicenseFullSerial){
      this._lestenToExternalProjectImplementation();
      this._lestenToInternalProjectImplementation();
    }
    
    this.cd.detectChanges();
  }
  _afterBuildForm(): void {
    this.handleReadonly();
    this.listenToMainDacOchaChanges();
    this.listenToChangeExternalFields();
    this.listenToChangeInternalFields();
    this._setDefaultValues();
  }
  _resetForm(): void {
    this.model = this._getNewInstance();
    this.form.reset();
    this.operation = this.operationTypes.CREATE;
    this.selectProject(undefined);
    this._setDefaultValues();
    this.bestPracticesListComponentRef.forceClearComponent();
    this.lessonsLearntListComponentRef.forceClearComponent();
  }
  _setDefaultValues(): void {
    this.requestType.setValue(ServiceRequestTypes.NEW);
    this.handleRequestTypeChange(ServiceRequestTypes.NEW, false);
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
      if (this.employeeService.isExternalUser() && this.model.isReturned()) {
        this.readonly = false;
      }

    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isExternalUser() && this.model.isReturned()) {
          this.readonly = false;
        }

      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
   
    }
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
  handleWorkAreaChanges(value: number) {
    this.selectProject(undefined);
    const insideFields = [this.internalProjectClassification];
    const outsideFields = [this.domain, this.mainDACCategory, this.subDACCategory, this.mainUNOCHACategory, this.subUNOCHACategory]
    this.resetFieldsValidation(insideFields.concat(outsideFields))
    this.isDisplayOutsideQatar && (() => {
      // handle Domain
      this.domain.setValidators([Validators.required])
      this.domain.updateValueAndValidity({ emitEvent: false })

      // handle country
      this.getQatarCountry().id === this.countryField.value && this.emptyFields([this.countryField], false)
      this.countryField.enable({ emitEvent: false })
    })()

    this.isDisplayInsideQatar && (() => {
      // handle internal project classification
      this.internalProjectClassification.setValidators([Validators.required]);
      this.internalProjectClassification.updateValueAndValidity({ emitEvent: false })

      // handle country
      this.countryField.setValue(this.getQatarCountry().id, { emitEvent: false })
      this.countryField.disable({ emitEvent: false })
    })()
    this.emptyFields(insideFields.concat(outsideFields), false)
    !value && this.emptyFields([this.countryField], true)
    if(this.isDisplayInsideQatar) {
      this._lestenToInternalProjectImplementation();
    } else if (this.isDisplayOutsideQatar) {
      this._lestenToExternalProjectImplementation();
    }
  }
  handleDomainChange(value: number) {
    const dacFields = [this.mainDACCategory, this.subDACCategory];
    const ochaFields = [this.mainUNOCHACategory, this.subUNOCHACategory];
    this.resetFieldsValidation(dacFields.concat([this.mainUNOCHACategory]))
    value === DomainTypes.DEVELOPMENT && (() => {
      this.mainDACCategory.setValidators([Validators.required]);
      this.mainDACCategory.updateValueAndValidity({ emitEvent: false })
      this.subDACCategory.setValidators([Validators.required]);
      this.subDACCategory.updateValueAndValidity({ emitEvent: false });
      this.emptyFields(ochaFields, false);
    })()
    value === DomainTypes.HUMANITARIAN && (() => {
      this.mainUNOCHACategory.setValidators([Validators.required]);
      this.mainUNOCHACategory.updateValueAndValidity({ emitEvent: false });
      this.emptyFields(dacFields, false);
    })()
    this.loadDacOuchMain(value);

    !value && this.emptyFields(ochaFields.concat(dacFields), false);
    this._lestenToExternalProjectImplementation();
  }
  private listenToMainDacOchaChanges() {
    merge(this.mainDACCategory.valueChanges, this.mainUNOCHACategory.valueChanges)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: number) => {
        this.subDACCategory.setValue(null, { emitEvent: false })
        this.subUNOCHACategory.setValue(null, { emitEvent: false })
        this.loadSubDacOchaByParentId(value)
      })
  }
  setImpactEffort(effortVsImpact: { x: number, y: number }) {
    this.model!.impact = effortVsImpact.x;
    this.model!.effort = effortVsImpact.y;
    this.evaluation.patchValue({
      impact: effortVsImpact.x,
      effort: effortVsImpact.y
    })
  }
  selectProject(licenseDetails: ProjectImplementation | undefined): void {
    this.selectedLicense = licenseDetails;
    const isReset = !licenseDetails;
    const value = new ProjectCompletion().clone({ ...this.model })
    value.licenseEndDate = isReset ? '' : DateUtils.changeDateToDatepicker(licenseDetails.licenseEndDate);
    value.projectTotalCost = isReset ? 0 : licenseDetails.projectTotalCost;
    value.projectName = isReset ? '' : licenseDetails.implementationTemplate[0] && licenseDetails.implementationTemplate[0].templateName;
    value.templateCost = isReset ? 0 : licenseDetails.implementationTemplate[0] && licenseDetails.implementationTemplate[0].templateCost;
    value.projectDescription = isReset ? '' : licenseDetails.implementationTemplate[0] && licenseDetails.implementationTemplate[0].arabicName;

    value.projectLicenseId = isReset ? '' : licenseDetails.id;
    value.projectLicenseFullSerial = isReset ? '' : licenseDetails.fullSerial;
    value.projectLicenseSerial = isReset ? 0 : licenseDetails.serial;
    this.model = value;
  }
  private getQatarCountry(): Country {
    return this.countries.find(item => item.enName.toLowerCase() === 'qatar')!
  }
  private separateDacFromOcha(list: AdminLookup[]) {
    this.mainDacCategories = list.filter(item => item.type === DomainTypes.DEVELOPMENT)
    this.mainUNOCHACategories = list.filter(item => item.type === DomainTypes.HUMANITARIAN)
  }
  private resetFieldsValidation(fields: AbstractControl[]): void {
    fields.forEach(field => field.setValidators([]))
  }
  private emptyFields(fields: AbstractControl[], emitEvent: boolean = false): boolean {
    fields.forEach(field => field.setValue(null, { emitEvent }))
    return true
  }
  private excludeQatar(country: Country): boolean {
    return country.id === this.getQatarCountry().id && this.isDisplayOutsideQatar
  }
  checkCountryDisabled(option: Country): boolean {
    return this.excludeQatar(option)
  }
  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }

  private _isValidDraftData(): boolean {
    const draftFields: FieldControlAndLabelKey[] = [
      { control: this.requestType, labelKey: 'request_type' },
    ];
    const invalidDraftField = this.getInvalidDraftField(draftFields);
    if (invalidDraftField) {
      this.dialog.error(this.lang.map.msg_please_validate_x_to_continue.change({ x: this.lang.map[invalidDraftField.labelKey] }));
      invalidDraftField.control.markAsTouched();
      return false;
    }
    return true;
  }


  get isHasErrorLessonsLearnt_BestPracticesTab() {
    return (!this.bestPracticesListComponentRef || this.bestPracticesListComponentRef.list.length > 0) && (!this.lessonsLearntListComponentRef || this.lessonsLearntListComponentRef.list.length > 0);
  }
  get isHumanitarianDomain(): boolean {
    return !!(this.domain.value === DomainTypes.HUMANITARIAN)
  }
  get isDevelopmentDomain(): boolean {
    return !!(this.domain.value === DomainTypes.DEVELOPMENT)
  }
  get isDisplayInsideQatar(): boolean {
    return !!(this.projectWorkArea.value === ProjectWorkArea.INSIDE_QATAR)
  }
  get isDisplayOutsideQatar(): boolean {
    return !!(this.projectWorkArea.value === ProjectWorkArea.OUTSIDE_QATAR)
  }

  get projectLicenseInfo(): UntypedFormGroup {
    return this.form.get('projectLicenseInfo') as UntypedFormGroup;
  }
  get projectBasicInfo(): UntypedFormGroup {
    return this.form.get('projectBasicInfo') as UntypedFormGroup;
  }
  get beneficiaryAnalyticsByLicense(): UntypedFormGroup {
    return this.form.get('beneficiaryAnalyticsByLicense') as UntypedFormGroup;
  }
  get evaluation(): UntypedFormGroup {
    return this.form.get('evaluation') as UntypedFormGroup;
  }
  get specialExplanation(): UntypedFormGroup {
    return this.form.get('explanation') as UntypedFormGroup;
  }

  get requestType(): UntypedFormControl {
    return this.projectLicenseInfo.get('requestType') as UntypedFormControl;
  }
  get domain(): UntypedFormControl {
    return this.projectLicenseInfo.get('domain') as UntypedFormControl;
  }
  get internalProjectClassification(): UntypedFormControl {
    return this.projectLicenseInfo.get('internalProjectClassification') as UntypedFormControl;
  }
  get projectWorkArea(): UntypedFormControl {
    return this.projectLicenseInfo.get('projectWorkArea') as UntypedFormControl;
  }
  get countryField(): UntypedFormControl {
    return this.projectLicenseInfo.get('beneficiaryCountry') as UntypedFormControl;
  }
  get mainDACCategory(): UntypedFormControl {
    return this.projectLicenseInfo.get('mainDACCategory') as UntypedFormControl
  }
  get subDACCategory(): UntypedFormControl {
    return this.projectLicenseInfo.get('subDACCategory') as UntypedFormControl
  }
  get mainUNOCHACategory(): UntypedFormControl {
    return this.projectLicenseInfo.get('mainUNOCHACategory') as UntypedFormControl
  }
  get subUNOCHACategory(): UntypedFormControl {
    return this.projectLicenseInfo.get('subUNOCHACategory') as UntypedFormControl
  }
}
