import {Component, ViewChild} from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {OperationTypes} from '@enums/operation-types.enum';
import {SaveTypes} from '@enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {ProjectModel} from '@models/project-model';
import {LangService} from '@services/lang.service';
import {ProjectModelService} from '@services/project-model.service';
import {Observable, of, Subject} from 'rxjs';
import {CountryService} from '@services/country.service';
import {Country} from '@models/country';
import {catchError, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {LookupService} from '@services/lookup.service';
import {Lookup} from '@models/lookup';
import {SDGoalService} from '@services/sdgoal.service';
import {SDGoal} from '@models/sdgoal';
import {ProjectComponent} from '@models/project-component';
import {CustomValidators} from '@app/validators/custom-validators';
import {DomainTypes} from '@enums/domain-types';
import {IDacOchaFields} from '@contracts/idac-ocha-fields';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import {EmployeeService} from '@services/employee.service';
import {AttachmentsComponent} from '@app/shared/components/attachments/attachments.component';
import {ProjectModelRequestType} from '@enums/service-request-types';
import {UserClickOn} from '@enums/user-click-on.enum';
import {OpenFrom} from '@enums/open-from.enum';
import {IKeyValue} from '@contracts/i-key-value';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {CommonUtils} from '@helpers/common-utils';
import {FileIconsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {DacOchaService} from '@services/dac-ocha.service';
import {AdminLookup} from '@models/admin-lookup';
import {AidLookupService} from '@services/aid-lookup.service';
import {AidLookup} from '@models/aid-lookup';
import {ExecutionFields} from '@enums/execution-fields';
import {IInternalExternalExecutionFields} from '@contracts/iinternal-external-execution-fields';
import {AdminLookupService} from '@services/admin-lookup.service';
import {AdminLookupTypeEnum} from '@enums/admin-lookup-type-enum';
import {EvaluationIndicator} from '@models/evaluation-indicator';
import {AdminResult} from '@models/admin-result';
import {ProjectModelForeignCountriesProject} from '@models/project-model-foreign-countries-project';
import {ForeignCountriesProjectsNeed} from '@models/foreign-countries-projects-need';
import {ForeignCountriesProjectsService} from '@services/foreign-countries-projects.service';
import {ProjectAddress} from '@models/project-address';
import {ICoordinates} from '@contracts/ICoordinates';
import {CollectionItem} from '@models/collection-item';
import {ServiceDataService} from '@services/service-data.service';
import {CaseTypes} from '@enums/case-types.enum';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'project-model',
  templateUrl: './project-model.component.html',
  styleUrls: ['./project-model.component.scss']
})
export class ProjectModelComponent extends EServicesGenericComponent<ProjectModel, ProjectModelService> {
  form!: UntypedFormGroup;
  evaluationIndicatorForm!: UntypedFormGroup;
  addIndicatorFormActive!: boolean;
  selectedEvaluationIndicator!: EvaluationIndicator | null;
  selectedIndicatorIndex!: number | null;
  evaluationIndicators: EvaluationIndicator[] = [];
  indicators: AdminLookup[] = [];
  indicatorsDisplayedColumns: string[] = ['index', 'indicator', 'percentage', 'notes', 'actions'];

  pMForeignCountriesProjectForm!: UntypedFormGroup;
  addPMForeignCountriesProjectFormActive!: boolean;
  selectedPMForeignCountriesProject!: ProjectModelForeignCountriesProject | null;
  selectedPMForeignCountriesProjectIndex!: number | null;
  pMForeignCountriesProjects: ProjectModelForeignCountriesProject[] = [];
  foreignCountriesProjectsNeeds: ForeignCountriesProjectsNeed[] = [];
  pMForeignCountriesProjectsDisplayedColumns: string[] = ['index', 'projectName', 'notes', 'actions'];

  projectAddressForm!: UntypedFormGroup;
  addProjectAddressFormActive!: boolean;
  selectedProjectAddress!: ProjectAddress | null;
  selectedProjectAddressIndex!: number | null;
  projectAddresses: ProjectAddress[] = [];
  projectAddressesDisplayedColumns: string[] = ['index', 'beneficiaryRegion', 'address', 'location', 'actions'];

  domainTypes: typeof DomainTypes = DomainTypes;
  countries: Country[] = [];
  countriesAvailableForSelection: Country[] = [];
  domains: Lookup[] = this.lookupService.listByCategory.Domain;
  projectTypes: Lookup[] = this.lookupService.listByCategory.ProjectType;
  requestTypes: Lookup[] = this.lookupService.listByCategory.ProjectModelingReqType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  projectWorkAreas: Lookup[] = this.lookupService.listByCategory.ProjectWorkArea;
  internalProjectClassifications: Lookup[] = this.lookupService.listByCategory.InternalProjectClassification;
  sanadiDomains: AidLookup[] = [];
  sanadiMainClassifications: AidLookup[] = [];
  mainOchaCategories: AdminLookup[] = [];
  subOchaCategories: AdminLookup[] = [];
  mainDacCategories: AdminLookup[] = [];
  subDacCategories: AdminLookup[] = [];
  exitMechanisms: AdminLookup[] = [];
  isDacOchaLoaded: boolean = false;
  goals: SDGoal[] = [];
  loadAttachments: boolean = false;
  fileIconsEnum = FileIconsEnum;
  qatarId!: number;

  projectComponentChange$: Subject<{ operation: OperationTypes, model: ProjectComponent }> = new Subject<{ operation: OperationTypes, model: ProjectComponent }>();
  projectListColumns: string[] = ['componentName', 'details', 'totalCost', 'actions'];
  projectListTotalCostFooterColumns: string[] = ['totalComponentCostLabel', 'totalComponentCost'];
  currentEditedProjectComponent?: ProjectComponent;
  tabIndex$: Subject<number> = new Subject<number>();
  formProperties = {
    requestType: () => {
      return this.getObservableField('requestType', 'requestType');
    },
    projectType: () => {
      return this.getObservableField('projectType', 'projectType');
    }
  }

  @ViewChild(AttachmentsComponent)
  attachmentComponent!: AttachmentsComponent;

  selectedModel?: ProjectModel;
  displayedColumns: string[] = ['domainInfo', 'projectTypeInfo', 'templateStatusInfo', 'createdBy', 'createdOn'];
  displayTemplateSerialField: boolean = false;
  displayDevGoals: boolean = false;
  isOutsideQatarWorkArea: boolean = false;
  isCharityProfile: boolean = false;
  isInstitutionProfile: boolean = false;

  templateSerialControl: UntypedFormControl = new UntypedFormControl(null);

  searchTemplate$: Subject<string> = new Subject<string>();

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      index: 0,
      validStatus: () => this.basicInfoTab && this.basicInfoTab.valid
    },
    projectCategory: {
      name: 'projectCategoryTab',
      langKey: 'project_category_info',
      index: 1,
      validStatus: () => {
        if (!(this.categoryInfoTab && this.categoryInfoTab.valid)) {
          return false;
        }
        return this.categoryGoalPercentGroup.valid;
      }
    },
    projectSummary: {
      name: 'projectSummaryTab',
      langKey: 'project_summary_info',
      index: 2,
      validStatus: () => this.summaryInfoTab && this.summaryInfoTab.valid && this.summaryPercentGroup && this.summaryPercentGroup.valid
    },
    projectComponentsAndBudget: {
      name: 'projectComponentsAndBudgetTab',
      langKey: 'project_components_budgets',
      index: 3,
      validStatus: () => (this.model && this.model.componentList && this.model.componentList.length > 0) && this.projectTotalCostField && this.projectTotalCostField.value > 0
    },
    evaluationIndicators: {
      name: 'evaluationIndicatorsTab',
      langKey: 'project_evaluation_indicators',
      index: 4,
      validStatus: () => (this.model && this.evaluationIndicators && this.evaluationIndicators.length > 0)
    },
    projectAddresses: {
      name: 'projectAddressesTab',
      langKey: 'project_addresses',
      index: 5,
      validStatus: () => this.isValidProjectAddresses()
    },
    foreignCountriesProjects: {
      name: 'foreignCountriesProjectsTab',
      langKey: 'project_model_foreign_countries_projects',
      index: 6,
      validStatus: () => true
    },
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      index: 7,
      validStatus: () => this.descriptionTab.valid
    },
    comments: {
      name: 'commentsTab',
      langKey: 'comments',
      index: 8,
      validStatus: () => true
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 9,
      validStatus: () => true
    }
  };

  isValidProjectAddresses() {
    return (this.model && this.projectAddresses && this.projectAddresses.length > 0) || !this.showProjectAddressesTab
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  showProjectAddressesTab: boolean = false;

  constructor(public lang: LangService,
              public fb: UntypedFormBuilder,
              private toast: ToastService,
              private dialog: DialogService,
              public employeeService: EmployeeService,
              private dacOchaService: DacOchaService,
              private lookupService: LookupService,
              private countryService: CountryService,
              private sdgService: SDGoalService,
              public service: ProjectModelService,
              private aidLookupService: AidLookupService,
              private adminLookupService: AdminLookupService,
              private foreignCountriesProjectsService: ForeignCountriesProjectsService,
              private serviceDataService: ServiceDataService) {
    super();
  }

  _getNewInstance(): ProjectModel {
    return new ProjectModel();
  }

  _initComponent(): void {
    this.setUserProfiles();
    this.getQatarId();
    this.loadIndicators();
    this.buildEvaluationIndicatorForm();
    this.buildProjectAddressForm();
    this.buildForeignCountriesProjectForm();
    this.loadExitMechanisms();
    this.loadSanadiDomains();
    this.loadCountries();
    this.loadGoals();
    this.listenToProjectComponentChange();
    this.listenToTemplateSearch();
  }

  setUserProfiles(): void {
    this.isCharityProfile = this.employeeService.isCharityProfile();
    this.isInstitutionProfile = this.employeeService.isInstitutionProfile();
  }

  getQatarId() {
    this.serviceDataService.loadByCaseType(CaseTypes.EXTERNAL_PROJECT_MODELS).subscribe(serviceData => {
      let settings: { QatarId: number } = JSON.parse(serviceData.customSettings);
      this.qatarId = settings.QatarId;
      // console.log('qatarId', this.qatarId);
    });
  }

  private setDefaultValues(): void {
    if (this.operation === OperationTypes.CREATE) {
      this.requestType.patchValue(this.requestTypes[0].lookupKey);
      this.handleRequestTypeChange(this.requestTypes[0].lookupKey, false);
    }
  }

  _buildForm(): void {
    let model = this._getNewInstance();

    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfoTab(true)),
      categoryInfo: this.fb.group(model.buildCategoryTab(true)),
      categoryGoalPercentGroup: this.fb.group(model.buildCategoryGoalPercentGroup(true)),
      summaryInfo: this.fb.group(model.buildSummaryTab(true)),
      summaryPercentGroup: this.fb.group(model.buildSummaryPercentGroup(true), {
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
      componentBudgetInfo: this.fb.group({
        projectTotalCost: [model.projectTotalCost, [CustomValidators.required, CustomValidators.decimal(2)]],
        componentList: this.fb.array([])
      }),
      description: this.fb.control(model.description, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)])
    });

    this.listenToExecutionFieldChange();
    this.listenToIsConstructionalChange();
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    if (this.model?.getCaseStatus() === CommonCaseStatus.CANCELLED || this.model?.getCaseStatus() === CommonCaseStatus.FINAL_APPROVE) {
      this.readonly = true;
    } else {

      if (this.openFrom === OpenFrom.USER_INBOX) {
        this.readonly = false;
      } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
        // after claim, consider it same as user inbox and use same condition
        if (this.model.taskDetails.isClaimed()) {
          this.readonly = false;
        }
      } else if (this.openFrom === OpenFrom.SEARCH) {
        // if saved as draft, then no readonly
        if (this.model?.canCommit()) {
          this.readonly = false;
        }
      }
    }
  }

  _afterBuildForm(): void {
    this.setDefaultValues();
    this.listenToOptionalGoalsChanges();
    // setTimeout(() => {
    this.handleReadonly();
    if (this.fromDialog) {
      this.model && this.model.templateId && this.service.getTemplateById(this.model?.templateId)
        .pipe(takeUntil(this.destroy$)).subscribe((template) => {
          this.selectedModel = template;
          this.displayTemplateSerialField = true;
          this.templateSerialControl.setValue(template.templateFullSerial);
        });

      if (this.model?.domain === DomainTypes.DEVELOPMENT) {
        this.mainDacCategories = [(new AdminLookup()).clone({
          arName: this.model.mainDACCategoryInfo.arName,
          enName: this.model.mainDACCategoryInfo.enName,
          id: this.model.mainDACCategoryInfo.id,
        })];
        this.subDacCategories = [(new AdminLookup()).clone({
          arName: this.model.subDACCategoryInfo.arName,
          enName: this.model.subDACCategoryInfo.enName,
          id: this.model.subDACCategoryInfo.id,
        })];
      } else {
        this.mainOchaCategories = [(new AdminLookup()).clone({
          arName: this.model?.mainUNOCHACategoryInfo.arName,
          enName: this.model?.mainUNOCHACategoryInfo.enName,
          id: this.model?.mainUNOCHACategoryInfo.id,
        })];
        this.subOchaCategories = [(new AdminLookup()).clone({
          arName: this.model?.subUNOCHACategoryInfo.arName,
          enName: this.model?.subUNOCHACategoryInfo.enName,
          id: this.model?.subUNOCHACategoryInfo.id,
        })];
      }
    }
    // })
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (saveType === SaveTypes.DRAFT) {
      return true;
    }

    // if (this.evaluationIndicators && this.evaluationIndicators.length < 1) {
    //   this.dialog.error(this.lang.map.you_should_add_at_least_one_evaluation_indicator);
    //   return false;
    // }
    //
    // if (this.pMForeignCountriesProjects && this.pMForeignCountriesProjects.length < 1) {
    //   this.dialog.error(this.lang.map.you_should_add_at_least_one_foreign_project_need);
    //   return false;
    // }

    const invalidTabs = this._getInvalidTabs();
    if (invalidTabs.length > 0) {
      const listHtml = CommonUtils.generateHtmlList(this.lang.map.msg_following_tabs_valid, invalidTabs);
      this.dialog.error(listHtml.outerHTML);
      return false;
    } else {
      // if project component total cost is 0, mark it invalid
      if (!this.projectTotalCostField || !CommonUtils.isValidValue(this.projectTotalCostField.value) || this.projectTotalCostField.value === 0) {
        this.toast.error(this.lang.map.err_invalid_project_component_total_x.change({value: this.projectTotalCostField.value || 0}));
        return false;
      }
    }

    const validAttachments$ = this.attachmentComponent.attachments.length ? of(true) : this.attachmentComponent.reload();
    return (this.model?.id ? validAttachments$ : of(true));


    /*return of(this.form.valid)
      .pipe(
        switchMap((valid) => iif(() => !!(valid && this.model?.id), validAttachments$, of(valid)))
      )*/
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): ProjectModel | Observable<ProjectModel> {
    return new ProjectModel().clone({
      ...this.model,
      ...this.basicInfoTab.getRawValue(),
      ...this.categoryInfoTab.getRawValue(),
      ...this.categoryGoalPercentGroup.getRawValue(),
      ...this.summaryInfoTab.getRawValue(),
      ...this.summaryPercentGroup.getRawValue(),
      projectTotalCost: this.projectTotalCostField.value,
      evaluationIndicatorList: this.evaluationIndicators,
      foreignCountriesProjectList: this.pMForeignCountriesProjects,
      projectAddressList: this.projectAddresses,
      description: this.descriptionTab.value
    });
  }

  private _updateModelAfterSave(model: ProjectModel): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }

  _afterSave(model: ProjectModel, saveType: SaveTypes, operation: OperationTypes): void {
    this._updateModelAfterSave(model);

    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {
    // throw new Error('Method not implemented.');
  }

  _launchFail(error: any): void {
    // throw new Error('Method not implemented.');
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _updateForm(model: ProjectModel): void {
    this.model = model;
    this.form.patchValue({
      basicInfo: model.buildBasicInfoTab(false),
      categoryInfo: model.buildCategoryTab(false),
      categoryGoalPercentGroup: model.buildCategoryGoalPercentGroup(false),
      summaryInfo: model.buildSummaryTab(false),
      summaryPercentGroup: model.buildSummaryPercentGroup(false),
      componentBudgetInfo: {
        projectTotalCost: model.projectTotalCost,
        componentList: []
      },
      description: model.description
    });

    this.evaluationIndicators = this.model?.evaluationIndicatorList;
    this.pMForeignCountriesProjects = this.model?.foreignCountriesProjectList;
    this.projectAddresses = this.model?.projectAddressList;
    this.handleRequestTypeChange(model.requestType, false);

    if(model.domain === DomainTypes.DEVELOPMENT) {
      this.displayDevGoals = true;
    }
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.templateSerialControl.setValue('');
    this.templateSerialControl.setValidators(null);
    this.templateSerialControl.updateValueAndValidity();
    this.selectedModel = undefined;
    this.displayTemplateSerialField = false;
    this.cancelProjectComponent();
    this.setDefaultValues();
  }

  /**
   *  list of getters for most used FormController/FormGroup
   */

  get requestType(): AbstractControl {
    return this.form.get('basicInfo')?.get('requestType') as AbstractControl;
  }

  get beneficiaryCountry(): AbstractControl {
    return this.form.get('basicInfo')?.get('beneficiaryCountry') as AbstractControl;
  }

  get executionCountry(): AbstractControl {
    return this.form.get('basicInfo')?.get('executionCountry') as AbstractControl;
  }

  get projectWorkArea(): AbstractControl {
    return this.form.get('basicInfo')?.get('projectWorkArea') as AbstractControl;
  }

  get isConstructional(): AbstractControl {
    return this.form.get('basicInfo')?.get('isConstructional') as AbstractControl;
  }

  get projectTotalCostField(): AbstractControl {
    return this.form.get('componentBudgetInfo')?.get('projectTotalCost') as AbstractControl;
  }

  get componentBudgetArray(): UntypedFormArray {
    return this.form.get('componentBudgetInfo')?.get('componentList') as UntypedFormArray;
  }

  get basicInfoTab(): UntypedFormGroup {
    return this.form.get('basicInfo') as UntypedFormGroup;
  }

  get categoryInfoTab(): UntypedFormGroup {
    return this.form.get('categoryInfo') as UntypedFormGroup;
  }

  get internalProjectClassification(): AbstractControl {
    return this.categoryInfoTab.get('internalProjectClassification') as AbstractControl;
  }

  get sanadiDomain(): AbstractControl {
    return this.categoryInfoTab.get('sanadiDomain') as AbstractControl;
  }

  get sanadiMainClassification(): AbstractControl {
    return this.categoryInfoTab.get('sanadiMainClassification') as AbstractControl;
  }

  get categoryGoalPercentGroup(): UntypedFormGroup {
    return this.form.get('categoryGoalPercentGroup') as UntypedFormGroup;
  }

  get summaryInfoTab(): UntypedFormGroup {
    return this.form.get('summaryInfo') as UntypedFormGroup;
  }

  get summaryPercentGroup(): UntypedFormGroup {
    return this.form.get('summaryPercentGroup') as UntypedFormGroup;
  }

  get descriptionTab(): AbstractControl {
    return this.form.get('description') as AbstractControl;
  }

  get projectType(): AbstractControl {
    return this.basicInfoTab.get('projectType') as AbstractControl;
  }

  get firstSDGoal(): AbstractControl {
    return this.categoryInfoTab.get('firstSDGoal') as AbstractControl;
  }

  get secondSDGoal(): AbstractControl {
    return this.categoryInfoTab.get('secondSDGoal') as AbstractControl;
  }

  get thirdSDGoal(): AbstractControl {
    return this.categoryInfoTab.get('thirdSDGoal') as AbstractControl;
  }

  get firstSDGoalPercentage(): AbstractControl {
    return this.categoryGoalPercentGroup?.get('firstSDGoalPercentage') as AbstractControl;
  }

  get secondSDGoalPercentage(): AbstractControl {
    return this.categoryGoalPercentGroup?.get('secondSDGoalPercentage') as AbstractControl;
  }

  get thirdSDGoalPercentage(): AbstractControl {
    return this.categoryGoalPercentGroup?.get('thirdSDGoalPercentage') as AbstractControl;
  }

  get domain(): AbstractControl {
    return this.categoryInfoTab.get('domain') as AbstractControl;
  }

  get mainDACCategory(): AbstractControl {
    return this.categoryInfoTab.get('mainDACCategory') as AbstractControl;
  }

  // noinspection JSUnusedGlobalSymbols
  get subDACCategory(): AbstractControl {
    return this.categoryInfoTab.get('subDACCategory') as AbstractControl;
  }

  get mainUNOCHACategory(): AbstractControl {
    return this.categoryInfoTab.get('mainUNOCHACategory') as AbstractControl;
  }

  // noinspection JSUnusedGlobalSymbols
  get subUNOCHACategory(): AbstractControl {
    return this.categoryInfoTab.get('subUNOCHACategory') as AbstractControl;
  }

  get sustainabilityItems(): AbstractControl {
    return this.summaryInfoTab.get('sustainabilityItems') as AbstractControl;
  }

  get longitude(): AbstractControl {
    return this.projectAddressForm.get('longitude')!;
  }

  get latitude(): AbstractControl {
    return this.projectAddressForm.get('latitude')!;
  }

  getPercentageSumValidation(): ValidatorFn {
    return CustomValidators.validateSum(100, 2,
      ['firstSDGoalPercentage', 'secondSDGoalPercentage', 'thirdSDGoalPercentage'],
      [this.lang.getLocalByKey('first_sd_goal_percentage'), this.lang.getLocalByKey('second_sd_goal_percentage'), this.lang.getLocalByKey('third_sd_goal_percentage')]
    );
  }

  private loadCountries(): void {
    this.countryService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => {
        this.countries = countries;
        this.countriesAvailableForSelection = this.countries;
      });
  }

  private loadGoals(): void {
    this.sdgService.loadAsLookups().subscribe((goals) => this.goals = goals);
  }

  private loadDacMainOcha(forceLoad: boolean = false): Observable<AdminLookup[]> {
    if (this.isDacOchaLoaded && !forceLoad) {
      return of([]);
    }

    return this.dacOchaService
      .loadAsLookups() //TODO: later we can filter the deactivated in case if it is new request
      .pipe(
        takeUntil(this.destroy$),
        map(list => {
          return list.filter(model => !model.parentId);
        }))
      .pipe(tap(_ => this.isDacOchaLoaded = true))
      .pipe(tap(list => this.separateDacFromOcha(list)));
  }

  private loadSubDacOcha(parent: number): void {
    if (!this.domain.value || !parent) {
      return;
    }
    this.dacOchaService
      .loadByParentId(parent)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.domain.value === DomainTypes.HUMANITARIAN ? this.subOchaCategories = list : this.subDacCategories = list;
      });
  }

  private emptyFieldsAndValidation(fields: (keyof IDacOchaFields)[] | (keyof IInternalExternalExecutionFields)[]): void {
    fields.forEach((field) => {
      this[field].setValidators(null);
      this[field].setValue(null);
      this[field].updateValueAndValidity();
    });
  }

  private setRequiredValidator(fields: (keyof IDacOchaFields)[] | (keyof IInternalExternalExecutionFields)[]) {
    fields.forEach((field) => {
      this[field].setValidators(CustomValidators.required);
      this[field].updateValueAndValidity();
    });
  }

  private setZeroValue(fields: (keyof IDacOchaFields)[]): void {
    fields.forEach((field) => {
      this[field].patchValue(this.model ? (this.model[field] ?? 0) : 0);
      this[field].updateValueAndValidity();
    });
  }

  private separateDacFromOcha(list: AdminLookup[]) {
    this.mainOchaCategories = list.filter(item => item.type === DomainTypes.HUMANITARIAN); // get ocha
    this.mainDacCategories = list.filter(item => item.type === DomainTypes.DEVELOPMENT); // get dac
  }

  private emptySubCategories(): void {
    this.subDacCategories = [];
    this.subOchaCategories = [];
  }


  private listenToProjectComponentChange() {
    this.projectComponentChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        event.operation === OperationTypes.DELETE ? this.removeProjectComponentForm(event.model) : this.createProjectComponentForm(event.model);
        this.projectTotalCostField.setValue(this.model?.getTotalProjectComponentCost(2) ?? 0);
      });
  }

  private createProjectComponentForm(model: ProjectComponent): void {
    !this.componentBudgetArray.length ? this.componentBudgetArray.push(this.fb.group(model.buildForm(true))) : null;
  }

  private removeProjectComponentForm(model: ProjectComponent) {
    this.componentBudgetArray.removeAt(0);
    this.model?.componentList.splice(this.model?.componentList.indexOf(model), 1);
    this.model && (this.model.componentList = this.model?.componentList.slice());
  }

  get currentProjectComponent(): AbstractControl {
    return this.componentBudgetArray.get('0') as AbstractControl;
  }

  // noinspection JSUnusedLocalSymbols
  private displayAttachmentsMessage(validAttachments: boolean): void {
    if (!validAttachments) {
      this.dialog.error(this.lang.map.kindly_check_required_attachments);
      this.tabIndex$.next(this.tabsData.attachments.index);
    }
  }

  tabHasError(tabName: string): boolean {
    const field = this.form.get(tabName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  onDomainChange() {
    this.loadDacMainOcha().subscribe();
    if (this.domain.value === DomainTypes.HUMANITARIAN) {
      this.emptyFieldsAndValidation([
        'mainDACCategory',
        'subDACCategory',
        'firstSDGoal',
        'secondSDGoal',
        'thirdSDGoal',
        'firstSDGoalPercentage',
        'secondSDGoalPercentage',
        'thirdSDGoalPercentage'
      ]);
      this.setRequiredValidator(['mainUNOCHACategory', 'subUNOCHACategory']);
      this.displayDevGoals = false;
      this.categoryGoalPercentGroup.setValidators(null);
    } else if (this.domain.value === DomainTypes.DEVELOPMENT) {
      this.emptyFieldsAndValidation(['mainUNOCHACategory', 'subUNOCHACategory']);
      this.setRequiredValidator(['mainDACCategory', 'subDACCategory', 'firstSDGoal', 'firstSDGoalPercentage']);
      this.setZeroValue(['firstSDGoalPercentage', 'secondSDGoalPercentage', 'thirdSDGoalPercentage']);
      this.displayDevGoals = true;
      this.categoryGoalPercentGroup.setValidators(this.getPercentageSumValidation());
    } else {
      this.displayDevGoals = false;
      this.categoryGoalPercentGroup.setValidators(null);
      this.emptyFieldsAndValidation([
        'mainUNOCHACategory',
        'subUNOCHACategory',
        'mainDACCategory',
        'subDACCategory',
        'firstSDGoal',
        'secondSDGoal',
        'thirdSDGoal',
        'firstSDGoalPercentage',
        'secondSDGoalPercentage',
        'thirdSDGoalPercentage'
      ]);
    }
    this.categoryGoalPercentGroup.updateValueAndValidity();
  }

  listenToExecutionFieldChange() {
    this.projectWorkArea.valueChanges.subscribe(val => {
      if (val === ExecutionFields.OutsideQatar) {
        this.showProjectAddressesTab = this.isConstructional.value;
        this.removeQatarFromCountries();
        this.isOutsideQatarWorkArea = true;
        this.emptyFieldsAndValidation(['internalProjectClassification', 'sanadiDomain', 'sanadiMainClassification']);
      } else if (this.projectWorkArea.value === ExecutionFields.InsideQatar) {
        this.hideProjectAddressesTabAndClearProjectAddressesList();
        this.applyNotOutsideQatarChanges();
        this.setQatarAsTheOnlyChoiceInCountries();
      } else {
        this.hideProjectAddressesTabAndClearProjectAddressesList();
        this.countriesAvailableForSelection = this.countries;
        this.applyNotOutsideQatarChanges();
      }
    });
  }

  listenToIsConstructionalChange() {
    this.isConstructional.valueChanges.subscribe(val => {
      if (val) {
        if (this.projectWorkArea.value === ExecutionFields.OutsideQatar) {
          this.showProjectAddressesTab = true;
        } else {
          this.hideProjectAddressesTabAndClearProjectAddressesList();
        }
      } else {
        this.hideProjectAddressesTabAndClearProjectAddressesList();
      }
    });
  }

  hideProjectAddressesTabAndClearProjectAddressesList() {
    this.showProjectAddressesTab = false;
    this.projectAddresses = [];
  }

  applyNotOutsideQatarChanges() {
    this.emptyFieldsAndValidation(['firstSDGoal', 'secondSDGoal', 'thirdSDGoal']);
    this.emptyDomainField();
    this.isOutsideQatarWorkArea = false;
    this.setRequiredValidator(['internalProjectClassification', 'sanadiDomain', 'sanadiMainClassification']);

    this.setZeroValue(['firstSDGoalPercentage', 'secondSDGoalPercentage', 'thirdSDGoalPercentage']);
    this.displayDevGoals = false;
    this.categoryGoalPercentGroup.setValidators(this.getPercentageSumValidation());
  }

  setQatarAsTheOnlyChoiceInCountries() {
    this.countriesAvailableForSelection = this.countries.filter(x => x.id === this.qatarId);
    this.beneficiaryCountry.patchValue(null);
    this.executionCountry.patchValue(null);
  }

  removeQatarFromCountries() {
    this.countriesAvailableForSelection = this.countries.filter(x => x.id !== this.qatarId);
    this.beneficiaryCountry.patchValue(null);
    this.executionCountry.patchValue(null);
  }

  emptyDomainField() {
    this.domain.setValidators(null);
    this.domain.setValue(null);
    this.domain.updateValueAndValidity();
  }

  getSelectedMainDacOchId(): number {
    return this.domain.value === DomainTypes.HUMANITARIAN ? this.mainUNOCHACategory.value : this.mainDACCategory.value;
  }

  onMainDacOchaChanged(): void {
    let selectedId = this.domain.value === DomainTypes.HUMANITARIAN ? this.mainUNOCHACategory.value : this.mainDACCategory.value;
    this.subUNOCHACategory.setValue(null);
    this.subUNOCHACategory.updateValueAndValidity();
    this.subDACCategory.setValue(null);
    this.subDACCategory.updateValueAndValidity();
    selectedId ? this.loadSubDacOcha(selectedId) : this.emptySubCategories();
  }

  onClickAddProjectComponent(): void {
    this.currentEditedProjectComponent = undefined;
    this.projectComponentChange$.next({operation: OperationTypes.CREATE, model: new ProjectComponent()});
  }

  onClickEditProjectComponent(model: ProjectComponent): void {
    this.currentEditedProjectComponent = model;
    this.projectComponentChange$.next({operation: OperationTypes.UPDATE, model: model});
  }

  onClickDeleteProjectComponent(model: ProjectComponent): void {
    this.projectComponentChange$.next({operation: OperationTypes.DELETE, model: model});
  }

  saveProjectComponent(): void {
    if (this.currentProjectComponent.invalid) {
      return;
    }
    if (this.currentEditedProjectComponent) {
      this.model && this.model.componentList.splice(this.model.componentList.indexOf(this.currentEditedProjectComponent), 1, (new ProjectComponent()).clone({...this.currentProjectComponent.value}));
      this.model && (this.model.componentList = this.model.componentList.slice());
    } else {
      const list = this.model?.componentList ? this.model?.componentList : [];
      this.model && (this.model.componentList = list.concat(new ProjectComponent().clone({...this.currentProjectComponent.value})));
    }
    this.toast.success(this.lang.map.msg_save_success);
    this.projectTotalCostField.setValue(this.model?.getTotalProjectComponentCost(2) ?? 0);
    this.cancelProjectComponent();
  }

  cancelProjectComponent(): void {
    this.componentBudgetArray.removeAt(0);
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
        this.displayTemplateSerialField = requestTypeValue === ProjectModelRequestType.UPDATE;
        this.templateSerialControl.setValidators(CustomValidators.required);
      } else {
        this.requestType.setValue(this.requestType$.value);
      }
    });
  }

  searchForTemplate() {
    /*if (!this.templateSerialControl.value) {
      return;
    }*/
    this.searchTemplate$.next(this.templateSerialControl.value);
  }

  listenToTemplateSearch(): void {
    this.searchTemplate$
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(val => this.service.searchTemplateBySerial(val)))
      .pipe(tap(list => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null))
      .pipe(filter(v => !!v.length))
      .pipe(switchMap(list => {
        if (list.length === 1) {
          return this.service.getTemplateById(list[0].id)
            .pipe(
              map((data) => {
                if (!data) {
                  return of(null);
                }
                return data;
              }),
              catchError(() => {
                return of(null);
              })
            );
        } else {
          return this.service.openSelectTemplate(list).onAfterClose$;
        }
      }))
      .subscribe((result: UserClickOn | ProjectModel) => {
        if (result instanceof ProjectModel) {
          this.selectedModel = result;
          this.templateSerialControl.setValue(result.templateFullSerial);
          //TODO Need to refactor here
          of(null)
            .pipe(
              switchMap(_ => {
                return this.loadDacMainOcha(true);
              }),
              switchMap(_ => {
                this.loadSubDacOcha(this.getSelectedMainDacOchId());
                return of(null);
              })
            ).subscribe(() => this.onDomainChange());

          this._updateForm(result.clone({
            id: undefined,
            templateId: result.id,
            requestType: this.requestType.value,
          }));
        }
      });
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
      isAllowed = (caseStatus !== CommonCaseStatus.CANCELLED && caseStatus !== CommonCaseStatus.FINAL_APPROVE && caseStatus !== CommonCaseStatus.FINAL_REJECTION);
    }

    return !isAllowed;
  }

  private static updatePercentageRequired(control: AbstractControl, isRequired: boolean = false): AbstractControl {
    control.setValidators(isRequired ? CustomValidators.required : null);
    control.updateValueAndValidity();
    return control;
  }

  private listenToOptionalGoalsChanges() {
    const fields: (keyof Pick<IDacOchaFields, 'secondSDGoal' | 'thirdSDGoal'>)[] = ['secondSDGoal', 'thirdSDGoal'];
    fields.forEach((field) => {
      this[field].valueChanges
        .pipe(takeUntil(this.destroy$))
        .pipe(switchMap(value => of(ProjectModelComponent.updatePercentageRequired(this[(field + 'Percentage') as unknown as keyof IDacOchaFields], !!value))))
        .subscribe();
    });

  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      if (!(this.tabsData[key].validStatus())) {
        // @ts-ignore
        failedList.push(this.lang.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }

  addCountry($event?: MouseEvent): void {
    $event?.preventDefault();
    this.countryService.openCreateDialog()
      .pipe(takeUntil(this.destroy$))
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe(() => {
          this.loadCountries();
        });
      });
  }

  loadSanadiDomains() {
    this.aidLookupService.loadByCriteria({parent: null}).subscribe(list => {
      this.sanadiDomains = list;
    });
  }

  loadSanadiMainClassification(parentId: number): void {
    this.sanadiMainClassification.setValue(null);
    if (!parentId) {
      this.sanadiMainClassifications = [];
    } else {
      this.aidLookupService.loadByCriteria({parent: parentId}).subscribe(list => {
        this.sanadiMainClassifications = list;
      });
    }
  }

  loadExitMechanisms(): void {
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.EXIT_MECHANISM).subscribe(list => {
      this.exitMechanisms = list;
    });
  }

  loadIndicators(): void {
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.TEMPLATE_INDICATOR).subscribe(list => {
      this.indicators = list;
    });
  }

  loadForeignCountriesProjectsNeeds(): void {
    let countryId = this.beneficiaryCountry.value;
    if (!countryId) {
      this.foreignCountriesProjectsNeeds = [];
      this.pMForeignCountriesProjectForm.patchValue({objectDBId: null});
    }
    this.foreignCountriesProjectsService.loadForeignCountriesProjectsNeeds(countryId).subscribe(list => {
      this.foreignCountriesProjectsNeeds = list;
    });
  }

  buildEvaluationIndicatorForm(): void {
    this.evaluationIndicatorForm = this.fb.group({
      indicator: [null, [CustomValidators.required]],
      percentage: [null, [CustomValidators.required, Validators.max(100), CustomValidators.decimal(2)]],
      notes: [null]
    });
  }

  buildForeignCountriesProjectForm(): void {
    this.pMForeignCountriesProjectForm = this.fb.group({
      objectDBId: [null, [CustomValidators.required]],
      notes: [null]
    });
  }

  buildProjectAddressForm(): void {
    this.projectAddressForm = this.fb.group({
      beneficiaryRegion: [null, [CustomValidators.required]],
      address: [null],
      latitude: [{value: null, disabled: true}, [CustomValidators.required]],
      longitude: [{value: null, disabled: true}, [CustomValidators.required]]
    });
  }

  ///////// indicators functionality
  openAddIndicatorForm() {
    this.addIndicatorFormActive = true;
  }

  selectIndicator(event: MouseEvent, model: EvaluationIndicator) {
    this.addIndicatorFormActive = true;
    event.preventDefault();
    this.selectedEvaluationIndicator = model;
    this.evaluationIndicatorForm.patchValue(this.selectedEvaluationIndicator!);
    this.selectedIndicatorIndex = this.evaluationIndicators
      .findIndex(x => x.indicator === model.indicator && x.percentage === model.percentage && x.notes === model.notes);
  }

  _saveIndicator(evaluationIndicator: EvaluationIndicator) {
    if (!this.selectedEvaluationIndicator) {
      if (!this.isExistIndicatorInCaseOfAdd(this.evaluationIndicators, evaluationIndicator)) {
        this.evaluationIndicators = this.evaluationIndicators.concat(evaluationIndicator);
        this.resetEvaluationIndicatorForm();
        this.addIndicatorFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistIndicatorInCaseOfEdit(this.evaluationIndicators, evaluationIndicator, this.selectedIndicatorIndex!)) {
        let newList = this.evaluationIndicators.slice();
        newList.splice(this.selectedIndicatorIndex!, 1);
        newList.splice(this.selectedIndicatorIndex!, 0, evaluationIndicator);
        this.evaluationIndicators = newList;
        this.resetEvaluationIndicatorForm();
        this.addIndicatorFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  saveIndicator() {
    const evaluationIndicator = new EvaluationIndicator().clone(this.evaluationIndicatorForm.getRawValue());
    evaluationIndicator.indicatorInfo = evaluationIndicator.indicatorInfo ? evaluationIndicator.indicatorInfo : AdminResult.createInstance(this.indicators.find(x => x.id === evaluationIndicator.indicator)!);

    this._saveIndicator(evaluationIndicator);
  }

  cancelAddIndicator() {
    this.resetEvaluationIndicatorForm();
    this.addIndicatorFormActive = false;
  }

  resetEvaluationIndicatorForm() {
    this.selectedEvaluationIndicator = null;
    this.selectedIndicatorIndex = null;
    this.evaluationIndicatorForm.reset();
  }

  removeIndicator(event: MouseEvent, model: EvaluationIndicator) {
    event.preventDefault();
    this.evaluationIndicators = this.evaluationIndicators.filter(x => !(x.indicator === model.indicator && x.percentage === model.percentage && x.notes === model.notes));
    this.resetEvaluationIndicatorForm();
  }

  isExistIndicatorInCaseOfAdd(evaluationIndicators: EvaluationIndicator[], toBeAddedIndicator: EvaluationIndicator): boolean {
    return evaluationIndicators.some(x => x.indicator === toBeAddedIndicator.indicator && x.percentage === toBeAddedIndicator.percentage && x.notes === toBeAddedIndicator.notes);
  }

  isExistIndicatorInCaseOfEdit(evaluationIndicators: EvaluationIndicator[], toBeEditedIndicator: EvaluationIndicator, selectedIndex: number): boolean {
    for (let i = 0; i < evaluationIndicators.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (evaluationIndicators[i].indicator === toBeEditedIndicator.indicator && evaluationIndicators[i].percentage === toBeEditedIndicator.percentage && evaluationIndicators[i].notes === toBeEditedIndicator.notes) {
        return true;
      }
    }
    return false;
  }

  ///////// foreign countries project functionality
  openAddPMForeignCountriesProjectForm() {
    this.addPMForeignCountriesProjectFormActive = true;
  }

  selectPMForeignCountriesProject(event: MouseEvent, model: ProjectModelForeignCountriesProject) {
    this.addPMForeignCountriesProjectFormActive = true;
    event.preventDefault();
    this.selectedPMForeignCountriesProject = model;
    this.pMForeignCountriesProjectForm.patchValue(this.selectedPMForeignCountriesProject!);
    this.selectedPMForeignCountriesProjectIndex = this.pMForeignCountriesProjects
      .findIndex(x => x.objectDBId === model.objectDBId && x.notes === model.notes);
  }

  _savePMForeignCountriesProject(projectModelForeignCountriesProject: ProjectModelForeignCountriesProject) {
    if (!this.selectedPMForeignCountriesProject) {
      if (!this.isExistPMForeignCountriesProjectInCaseOfAdd(this.pMForeignCountriesProjects, projectModelForeignCountriesProject)) {
        this.pMForeignCountriesProjects = this.pMForeignCountriesProjects.concat(projectModelForeignCountriesProject);
        this.resetPMForeignCountriesProjectForm();
        this.addPMForeignCountriesProjectFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistPMForeignCountriesProjectInCaseOfEdit(this.pMForeignCountriesProjects, projectModelForeignCountriesProject, this.selectedPMForeignCountriesProjectIndex!)) {
        let newList = this.pMForeignCountriesProjects.slice();
        newList.splice(this.selectedPMForeignCountriesProjectIndex!, 1);
        newList.splice(this.selectedPMForeignCountriesProjectIndex!, 0, projectModelForeignCountriesProject);
        this.pMForeignCountriesProjects = newList;
        this.resetPMForeignCountriesProjectForm();
        this.addPMForeignCountriesProjectFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  savePMForeignCountriesProject() {
    const pMForeignCountriesProject = new ProjectModelForeignCountriesProject().clone(this.pMForeignCountriesProjectForm.getRawValue());
    pMForeignCountriesProject.projectName = (this.foreignCountriesProjectsNeeds.find(x => x.id === pMForeignCountriesProject.objectDBId)! as any).projectName;

    this._savePMForeignCountriesProject(pMForeignCountriesProject);
  }

  cancelAddPMForeignCountriesProject() {
    this.resetPMForeignCountriesProjectForm();
    this.addPMForeignCountriesProjectFormActive = false;
  }

  resetPMForeignCountriesProjectForm() {
    this.selectedPMForeignCountriesProject = null;
    this.selectedPMForeignCountriesProjectIndex = null;
    this.pMForeignCountriesProjectForm.reset();
  }

  removePMForeignCountriesProject(event: MouseEvent, model: ProjectModelForeignCountriesProject) {
    event.preventDefault();
    this.pMForeignCountriesProjects = this.pMForeignCountriesProjects.filter(x => !(x.objectDBId === model.objectDBId && x.notes === model.notes));
    this.resetPMForeignCountriesProjectForm();
  }

  isExistPMForeignCountriesProjectInCaseOfAdd(list: ProjectModelForeignCountriesProject[], toBeAddedItem: ProjectModelForeignCountriesProject): boolean {
    return list.some(x => x.objectDBId === toBeAddedItem.objectDBId && x.notes === toBeAddedItem.notes);
  }

  isExistPMForeignCountriesProjectInCaseOfEdit(list: ProjectModelForeignCountriesProject[], toBeEditedItem: ProjectModelForeignCountriesProject, selectedIndex: number): boolean {
    for (let i = 0; i < list.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (list[i].objectDBId === toBeEditedItem.objectDBId && list[i].notes === toBeEditedItem.notes) {
        return true;
      }
    }
    return false;
  }

  ///////// project addresses functionality
  openAddProjectAddressForm() {
    this.addProjectAddressFormActive = true;
    this.selectedProjectAddress = new ProjectAddress();
  }

  _saveProjectAddress(projectAddress: ProjectAddress) {
    if (this.selectedProjectAddressIndex === null) {
      if (!this.isExistProjectAddressInCaseOfAdd(this.projectAddresses, projectAddress)) {
        this.projectAddresses = this.projectAddresses.concat(projectAddress);
        this.resetProjectAddressForm();
        this.addProjectAddressFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    } else {
      if (!this.isExistProjectAddressInCaseOfEdit(this.projectAddresses, projectAddress, this.selectedProjectAddressIndex!)) {
        let newList = this.projectAddresses.slice();
        newList.splice(this.selectedProjectAddressIndex!, 1);
        newList.splice(this.selectedProjectAddressIndex!, 0, projectAddress);
        this.projectAddresses = newList;
        this.resetProjectAddressForm();
        this.addProjectAddressFormActive = false;
      } else {
        this.dialog.error(this.lang.map.selected_item_already_exists);
      }
    }
  }

  selectProjectAddress(event: MouseEvent, model: ProjectAddress) {
    this.addProjectAddressFormActive = true;
    event.preventDefault();
    this.selectedProjectAddress = model;
    this.projectAddressForm.patchValue(this.selectedProjectAddress!);
    this.selectedProjectAddressIndex = this.projectAddresses
      .findIndex(x => x.beneficiaryRegion === model.beneficiaryRegion && x.address === model.address);
  }

  saveProjectAddress() {
    console.log('form', this.projectAddressForm);
    const projectAddress = new ProjectAddress().clone(this.projectAddressForm.getRawValue());

    this._saveProjectAddress(projectAddress);
  }

  cancelAddProjectAddress() {
    this.resetProjectAddressForm();
    this.addProjectAddressFormActive = false;
  }

  resetProjectAddressForm() {
    this.selectedProjectAddress = null;
    this.selectedProjectAddressIndex = null;
    this.projectAddressForm.reset();
  }

  removeProjectAddress(event: MouseEvent, model: ProjectAddress) {
    event.preventDefault();
    this.projectAddresses = this.projectAddresses.filter(x => !(x.beneficiaryRegion === model.beneficiaryRegion && x.address === model.address));
    this.resetProjectAddressForm();
  }

  isExistProjectAddressInCaseOfAdd(projectAddresses: ProjectAddress[], toBeAddedProjectAddress: ProjectAddress): boolean {
    return projectAddresses.some(x => x.beneficiaryRegion === toBeAddedProjectAddress.beneficiaryRegion && x.address === toBeAddedProjectAddress.address);
  }

  isExistProjectAddressInCaseOfEdit(projectAddresses: ProjectAddress[], toBeEditedProjectAddress: ProjectAddress, selectedIndex: number): boolean {
    for (let i = 0; i < projectAddresses.length; i++) {
      if (i === selectedIndex) {
        continue;
      }

      if (projectAddresses[i].beneficiaryRegion === toBeEditedProjectAddress.beneficiaryRegion && projectAddresses[i].address === toBeEditedProjectAddress.address) {
        return true;
      }
    }
    return false;
  }

  ///////// location implementation
  openMapMarker() {
    (this.selectedProjectAddress!).openMap(this.readonly)
      .onAfterClose$
      .subscribe(({click, value}: { click: UserClickOn, value: ICoordinates }) => {
        if (click === UserClickOn.YES) {
          this.selectedProjectAddress!.latitude = value.latitude;
          this.selectedProjectAddress!.longitude = value.longitude;
          this.latitude.patchValue(value.latitude);
          this.longitude.patchValue(value.longitude);
        }
      });
  }

  openLocationMap(item: CollectionItem) {
    item.openMap(true);
  }

  isDisabledSaveAddress() {
    return this.projectAddressForm.invalid || !CommonUtils.isValidValue(this.latitude.value) || !CommonUtils.isValidValue(this.longitude.value);
  }
}
