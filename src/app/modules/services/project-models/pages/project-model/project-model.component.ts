import {Component, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn} from '@angular/forms';
import {ProjectModelProjectTypes} from '@app/enums/project-model-project-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {AttachmentsComponent} from '@app/shared/components/attachments/attachments.component';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {FieldControlAndLabelKey} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {IKeyValue} from '@contracts/i-key-value';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {IDacOchaFields} from '@contracts/idac-ocha-fields';
import {IInternalExternalExecutionFields} from '@contracts/iinternal-external-execution-fields';
import {AdminLookupTypeEnum} from '@enums/admin-lookup-type-enum';
import {CaseTypes} from '@enums/case-types.enum';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {DomainTypes} from '@enums/domain-types';
import {ExecutionFields} from '@enums/execution-fields';
import {FileIconsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {OpenFrom} from '@enums/open-from.enum';
import {OperationTypes} from '@enums/operation-types.enum';
import {SaveTypes} from '@enums/save-types';
import {ProjectModelRequestType} from '@enums/service-request-types';
import {UserClickOn} from '@enums/user-click-on.enum';
import {CommonUtils} from '@helpers/common-utils';
import {AdminLookup} from '@models/admin-lookup';
import {AidLookup} from '@models/aid-lookup';
import {Country} from '@models/country';
import {ForeignCountriesProjectsNeed} from '@models/foreign-countries-projects-need';
import {Lookup} from '@models/lookup';
import {ProjectModel} from '@models/project-model';
import {ProjectModelForeignCountriesProject} from '@models/project-model-foreign-countries-project';
import {SDGoal} from '@models/sdgoal';
import {AdminLookupService} from '@services/admin-lookup.service';
import {AidLookupService} from '@services/aid-lookup.service';
import {CountryService} from '@services/country.service';
import {DacOchaService} from '@services/dac-ocha.service';
import {DialogService} from '@services/dialog.service';
import {EmployeeService} from '@services/employee.service';
import {ForeignCountriesProjectsService} from '@services/foreign-countries-projects.service';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {ProjectModelService} from '@services/project-model.service';
import {SDGoalService} from '@services/sdgoal.service';
import {ServiceDataService} from '@services/service-data.service';
import {ToastService} from '@services/toast.service';
import {Observable, of, Subject} from 'rxjs';
import {catchError, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {ComponentBudgetsComponent} from './component-budgets/component-budgets.component';
import {EvaluationIndicatorsComponent} from './evaluation-indicators/evaluation-indicators.component';
import {ProjectAddressesComponent} from './project-addresses/project-addresses.component';
import {ForeignCountriesProjectsComponent} from './foreign-countries-projects/foreign-countries-projects.component';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'project-model',
  templateUrl: './project-model.component.html',
  styleUrls: ['./project-model.component.scss']
})
export class ProjectModelComponent extends EServicesGenericComponent<ProjectModel, ProjectModelService> {
  form!: UntypedFormGroup;

  _saveFail(error: any): void {
    // throw new Error('Method not implemented.');
  }

  _launchFail(error: any): void {
    // throw new Error('Method not implemented.');
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  pMForeignCountriesProjectForm!: UntypedFormGroup;
  addPMForeignCountriesProjectFormActive!: boolean;
  selectedPMForeignCountriesProject!: ProjectModelForeignCountriesProject | null;
  selectedPMForeignCountriesProjectIndex!: number | null;
  foreignCountriesProjectsNeeds: ForeignCountriesProjectsNeed[] = [];
  projectClassifications:Lookup[] = this.lookupService.listByCategory.InternalProjectClassification;
  onAddProjectClassification(val:string){
    if(this.readonly) return null;
    if(!CommonUtils.isValidValue(val)) return null;
    // if(this.subInternalProjectClassification.value.some((x:string)=> x.toLocaleLowerCase() === val.toLowerCase())){
    //   this.toast.info(this.lang.map.msg_duplicate_record_in_list)
    //   return null;
    // }
    return val;
  }
  onClearProjectClassification(){
    //this.model!.subInternalProjectClassification = [];
    }
  onRemoveProjectClassification(val:any){
    // this.model!.subInternalProjectClassification = this.model!.subInternalProjectClassification.filter(x=>x !== val.label)
 }

  domainTypes: typeof DomainTypes = DomainTypes;
  countries: Country[] = [];
  countriesAvailableForSelection: Country[] = [];
  domains: Lookup[] = this.lookupService.listByCategory.Domain;
  projectTypes: Lookup[] = this.lookupService.listByCategory.ProjectType;
  requestTypes: Lookup[] = this.lookupService.listByCategory.ProjectModelingReqType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  projectWorkAreas: Lookup[] = this.lookupService.listByCategory.ProjectWorkArea;
  interventionTypes: Lookup[] = this.lookupService.listByCategory.InterventionType;
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

  @ViewChild('componentBudgetsTap')
  componentBudgetsRef!: ComponentBudgetsComponent

  @ViewChild('evaluationIndicatorsRef')
  evaluationIndicatorsRef!: EvaluationIndicatorsComponent

  @ViewChild('projectAddressesRef')
  projectAddressesRef!: ProjectAddressesComponent

  @ViewChild('foreignCountriesProjectsRef')
  foreignCountriesProjectsRef!: ForeignCountriesProjectsComponent

  @ViewChild('subClassification')
  subClassificationRef!: NgSelectComponent

  selectedModel?: ProjectModel;
  displayedColumns: string[] = ['domainInfo', 'projectTypeInfo', 'templateStatusInfo', 'createdBy', 'createdOn'];
  displayTemplateSerialField: boolean = false;
  displayDevGoals: boolean = false;
  isOutsideQatarWorkArea: boolean = false;
  isCharityProfile: boolean = false;
  isInstitutionProfile: boolean = false;

  templateSerialControl: UntypedFormControl = new UntypedFormControl(null);
  filterControl: UntypedFormControl = new UntypedFormControl('');

  searchTemplate$: Subject<string> = new Subject<string>();
  addPMForeignCountriesProjectForm$: Subject<any> = new Subject<any>();
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
      validStatus: () => {
        return !this.componentBudgetsRef
          || (this.componentBudgetsRef.list.length > 0 && this.componentBudgetsRef.projectTotalCostField.value > 0);
        /*return (this.model && this.model.componentList && this.model.componentList.length > 0)
          && this.projectTotalCostField && this.projectTotalCostField.value > 0*/
      }
    },
    evaluationIndicators: {
      name: 'evaluationIndicatorsTab',
      langKey: 'project_evaluation_indicators',
      index: 4,
      validStatus: () => {
        return !this.evaluationIndicatorsRef || (this.evaluationIndicatorsRef.list.length > 0);
        // return (this.model && this.model.evaluationIndicatorList && this.model.evaluationIndicatorList.length > 0)
      }
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
    return (this.model && this.model.projectAddressList && this.model.projectAddressList.length > 0) || !this.showProjectAddressesTab
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
    this.loadExitMechanisms();
    this.loadSanadiDomains();
    this.loadCountries();
    this.loadGoals();
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
      description: this.fb.control(model.description, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)])
    });

    this.listenToExecutionFieldChange();
    this.listenToIsConstructionalChange();
    this.listenToProjectTypeChange();
  }

  listenToProjectTypeChange() {
    this.projectType.valueChanges.pipe(
      takeUntil(this.destroy$),
      tap(_ => this._handleProjectClassifications())
    ).subscribe();
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

  private _isValidDraftData(): boolean {
    const draftFields: FieldControlAndLabelKey[] = [
      {control: this.requestType, labelKey: 'request_type'},
    ];
    const invalidDraftField = this.getInvalidDraftField(draftFields);
    if (invalidDraftField) {
      this.dialog.error(this.lang.map.msg_please_validate_x_to_continue.change({x: this.lang.map[invalidDraftField.labelKey]}));
      invalidDraftField.control.markAsTouched();
      return false;
    }
    return true;
  }

  isNewRequestType(): boolean {
    return this.requestType.value === ProjectModelRequestType.NEW;
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    let model: any = new ProjectModel().clone({
      ...this.model,
      ...this.basicInfoTab.getRawValue(),
      ...this.categoryInfoTab.getRawValue(),
      ...this.categoryGoalPercentGroup.getRawValue(),
      ...this.summaryInfoTab.getRawValue(),
      ...this.summaryPercentGroup.getRawValue(),
      componentList: this.componentBudgetsRef.list,
      evaluationIndicatorList: this.evaluationIndicatorsRef.list,
      projectTotalCost: this.projectTotalCostField.value,
      foreignCountriesProjectList: this.foreignCountriesProjectsRef?.list ?? [],
      projectAddressList: this.projectAddressesRef?.list ?? [],
      description: this.descriptionTab.value
    });
    console.log(model);
    return false;

    if (!this.selectedModel && !this.isNewRequestType()) {
      this.dialog.error(this.lang.map.msg_please_select_x_to_continue.change({x: this.lang.map.lbl_model}));
      return false;
    } else {
      if (saveType === SaveTypes.DRAFT) {
        return this._isValidDraftData();
      }
      const invalidTabs = this._getInvalidTabs();
      if (invalidTabs.length > 0) {
        const listHtml = CommonUtils.generateHtmlList(this.lang.map.msg_following_tabs_valid, invalidTabs);
        this.dialog.error(listHtml.outerHTML);
        return false;
      } else {
        if (!this.projectTotalCostField || !CommonUtils.isValidValue(this.projectTotalCostField.value) || this.projectTotalCostField.value === 0) {
          this.toast.error(this.lang.map.err_invalid_project_component_total_x.change({value: this.projectTotalCostField.value || 0}));
          return false;
        }
      }
      const validAttachments$ = this.attachmentComponent.attachments.length ? of(true) : this.attachmentComponent.reload();
      return (this.model?.id ? validAttachments$ : of(true));
    }
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterLaunch(): void {
    this.resetForm$.next();

    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): any | Observable<any> {
    let model: any = new ProjectModel().clone({
      ...this.model,
      ...this.basicInfoTab.getRawValue(),
      ...this.categoryInfoTab.getRawValue(),
      ...this.categoryGoalPercentGroup.getRawValue(),
      ...this.summaryInfoTab.getRawValue(),
      ...this.summaryPercentGroup.getRawValue(),
      componentList: this.componentBudgetsRef.list,
      evaluationIndicatorList: this.evaluationIndicatorsRef.list,
      projectTotalCost: this.projectTotalCostField.value,
      foreignCountriesProjectList: this.foreignCountriesProjectsRef?.list ?? [],
      projectAddressList: this.projectAddressesRef?.list ?? [],
      description: this.descriptionTab.value
    });
    if (model.getCaseStatus() === CommonCaseStatus.DRAFT) {
      delete model.serial
    }
    return model;
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


  _updateForm(model: ProjectModel): void {
    this.model = model;
    this.form.patchValue({
      basicInfo: model.buildBasicInfoTab(false),
      categoryInfo: model.buildCategoryTab(false),
      categoryGoalPercentGroup: model.buildCategoryGoalPercentGroup(false),
      summaryInfo: model.buildSummaryTab(false),
      summaryPercentGroup: model.buildSummaryPercentGroup(false),
      description: model.description
    });
    this.handleRequestTypeChange(model.requestType, false);
    if (model.domain === DomainTypes.DEVELOPMENT) {
      this.displayDevGoals = true;
    }
  }

  _resetForm(): void {
    this.form.reset();
    this.componentBudgetsRef.forceClearComponent();
    this.evaluationIndicatorsRef.forceClearComponent();
    this.foreignCountriesProjectsRef?.forceClearComponent();
    this.projectAddressesRef?.forceClearComponent();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.templateSerialControl.setValue('');
    this.templateSerialControl.setValidators(null);
    this.templateSerialControl.updateValueAndValidity();
    this.selectedModel = undefined;
    this.displayTemplateSerialField = false;
    this.setDefaultValues();
  }

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
    return this.componentBudgetsRef?.projectTotalCostField as AbstractControl;
  }

  get basicInfoTab(): UntypedFormGroup {
    return this.form.get('basicInfo') as UntypedFormGroup;
  }

  get categoryInfoTab(): UntypedFormGroup {
    return this.form.get('categoryInfo') as UntypedFormGroup;
  }
  get subInternalProjectClassification(): AbstractControl {
    return this.basicInfoTab.get('subInternalProjectClassification') as AbstractControl;
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
    this.mainOchaCategories = list.filter(item => item.type === DomainTypes.HUMANITARIAN).filter(item => item.isActive()); // get ocha
    this.mainDacCategories = list.filter(item => item.type === DomainTypes.DEVELOPMENT).filter(item => item.isActive()); // get dac
  }

  private emptySubCategories(): void {
    this.subDacCategories = [];
    this.subOchaCategories = [];
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
      if (this.projectWorkArea.value !== ExecutionFields.InsideQatar) {
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
      } else {
        this.emptyFieldsAndValidation(['mainUNOCHACategory', 'subUNOCHACategory']);
      }

    }
    this.categoryGoalPercentGroup.updateValueAndValidity();
  }

  listenToExecutionFieldChange() {
    this.projectWorkArea.valueChanges.subscribe(val => {
      this.subClassificationRef?.clearModel();
      this.domain.setValidators([]);
      if (this.isOutsideQatarProject()) {
        this.removeQatarFromCountries();
        this.isOutsideQatarWorkArea = true;
        this.domain.setValidators([CustomValidators.required]);
        this.emptyFieldsAndValidation(['internalProjectClassification', 'sanadiDomain', 'sanadiMainClassification']);
      } else if (this.isInsideQatarProject()) {
        this.applyNotOutsideQatarChanges();
        this.setQatarAsTheOnlyChoiceInCountries();
      } else {
        this.countriesAvailableForSelection = this.countries;
        this.applyNotOutsideQatarChanges();
      }
      this.domain.updateValueAndValidity();

    });
  }

  listenToIsConstructionalChange() {
    this.isConstructional.valueChanges.subscribe(val => {
      if (val) {
        this.showProjectAddressesTab = true;
      } else {
        this.hideProjectAddressesTabAndClearProjectAddressesList();
      }
    });
  }

  hideProjectAddressesTabAndClearProjectAddressesList() {
    this.showProjectAddressesTab = false;
    this.projectAddressesRef?.forceClearComponent()
  }

  applyNotOutsideQatarChanges() {
    this.emptyFieldsAndValidation(['firstSDGoal', 'secondSDGoal', 'thirdSDGoal', 'firstSDGoalPercentage', 'secondSDGoalPercentage', 'thirdSDGoalPercentage']);
    this.emptyDomainField();
    this._handleProjectClassifications();
    this.isOutsideQatarWorkArea = false;

    this.setRequiredValidator(['firstSDGoal', 'secondSDGoal', 'thirdSDGoal', 'firstSDGoalPercentage', 'secondSDGoalPercentage', 'thirdSDGoalPercentage']);

    this.setZeroValue(['firstSDGoalPercentage', 'secondSDGoalPercentage', 'thirdSDGoalPercentage']);
    this.displayDevGoals = false;
    this.categoryGoalPercentGroup.setValidators(this.getPercentageSumValidation());

  }

  isInsideQatarProject(): boolean {
    return this.projectWorkArea.value === ExecutionFields.InsideQatar
  }

  isOutsideQatarProject(): boolean {
    return this.projectWorkArea.value === ExecutionFields.OutsideQatar
  }

  isSoftwareProjectType(): boolean {
    return this.projectType.value === ProjectModelProjectTypes.SOFTWARE;
  }

  isAidsProjectType(): boolean {
    return this.projectType.value === ProjectModelProjectTypes.AIDS;
  }

  private _handleProjectClassifications() {
    this.emptyFieldsAndValidation(['internalProjectClassification', 'sanadiDomain', 'sanadiMainClassification']);
    if (this.projectWorkArea.value !== ExecutionFields.InsideQatar) {
      return;
    }
    if (this.isSoftwareProjectType()) {
      this.setRequiredValidator(['internalProjectClassification']);
    }
    if (this.isAidsProjectType()) {
      this.setRequiredValidator(['sanadiDomain', 'sanadiMainClassification']);
    }

  }

  setQatarAsTheOnlyChoiceInCountries() {
    this.countriesAvailableForSelection = this.countries.filter(x => x.id === this.qatarId);
    this.beneficiaryCountry.patchValue(this.qatarId);
    this.executionCountry.patchValue(this.qatarId);
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
}
