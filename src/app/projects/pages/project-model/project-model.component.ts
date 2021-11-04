import {Component, ViewChild} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {ProjectModel} from "@app/models/project-model";
import {LangService} from '@app/services/lang.service';
import {ProjectModelService} from "@app/services/project-model.service";
import {iif, Observable, of, Subject} from 'rxjs';
import {CountryService} from "@app/services/country.service";
import {Country} from "@app/models/country";
import {filter, switchMap, takeUntil, tap} from "rxjs/operators";
import {LookupService} from "@app/services/lookup.service";
import {Lookup} from "@app/models/lookup";
import {DacOchaService} from "@app/services/dac-ocha.service";
import {DacOcha} from "@app/models/dac-ocha";
import {SDGoalService} from "@app/services/sdgoal.service";
import {SDGoal} from "@app/models/sdgoal";
import {ProjectComponent} from "@app/models/project-component";
import {CustomValidators} from "@app/validators/custom-validators";
import {ProjectModelTypes} from "@app/enums/project-model-types";
import {ProjectTypes} from "@app/enums/project-types";
import {DomainTypes} from "@app/enums/domain-types";
import {IDacOchaFields} from "@app/interfaces/idac-ocha-fields";
import {TabComponent} from "@app/shared/components/tab/tab.component";
import {ToastService} from "@app/services/toast.service";
import {DialogService} from "@app/services/dialog.service";
import {EmployeeService} from "@app/services/employee.service";
import {AttachmentsComponent} from "@app/shared/components/attachments/attachments.component";
import {ProjectModelRequestType} from "@app/enums/project-model-request-type";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {CaseStatus} from "@app/enums/case-status.enum";

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'project-model',
  templateUrl: './project-model.component.html',
  styleUrls: ['./project-model.component.scss']
})
export class ProjectModelComponent extends EServicesGenericComponent<ProjectModel, ProjectModelService> {
  form!: FormGroup;
  domainTypes: typeof DomainTypes = DomainTypes;
  countries: Country[] = [];
  domains: Lookup[] = this.lookupService.listByCategory.Domain;
  projectTypes: Lookup[] = this.lookupService.listByCategory.ProjectType;
  modelTypes: Lookup[] = this.lookupService.listByCategory.TemplateType;
  requestTypes: Lookup[] = this.lookupService.listByCategory.ExternalModelingReqType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  implementingAgencyTypes: Lookup[] = this.lookupService.listByCategory.ImplementingAgencyType;
  mainOchaCategories: DacOcha[] = [];
  subOchaCategories: DacOcha[] = [];
  mainDacCategories: DacOcha[] = [];
  subDacCategories: DacOcha[] = [];
  isDacOchaLoaded: boolean = false;
  goals: SDGoal[] = [];
  loadAttachments: boolean = false;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;

  projectComponentChange$: Subject<{ operation: OperationTypes, model: ProjectComponent }> = new Subject<{ operation: OperationTypes, model: ProjectComponent }>();
  projectListColumns: string[] = ['componentName', 'details', 'totalCost', 'actions'];
  projectListFooterColumns: string[] = ['totalComponentCostLabel', 'totalComponentCost'];
  currentEditedProjectComponent?: ProjectComponent;
  tabIndex$: Subject<number> = new Subject<number>();

  @ViewChild(AttachmentsComponent)
  attachmentComponent!: AttachmentsComponent;

  selectedModel?: ProjectModel;
  displayedColumns: string[] = ['domainInfo', 'projectTypeInfo', 'templateStatusInfo', 'createdBy', 'createdOn', 'templateTypeInfo'];
  displayTemplateSerialField: boolean = false;

  templateSerialControl: FormControl = new FormControl(null);

  searchTemplate$: Subject<string> = new Subject<string>();

  constructor(public lang: LangService,
              public fb: FormBuilder,
              private toast: ToastService,
              private dialog: DialogService,
              private employeeService: EmployeeService,
              private dacOchaService: DacOchaService,
              private lookupService: LookupService,
              private countyService: CountryService,
              private sdgService: SDGoalService,
              public service: ProjectModelService) {
    super();
  }

  _getNewInstance(): ProjectModel {
    return new ProjectModel();
  }

  _initComponent(): void {
    this.loadCountries();
    this.loadGoals();
    this.listenToProjectComponentChange();
    this.listenToTemplateSearch();
  }

  _buildForm(): void {
    let model = (new ProjectModel()).clone({
      requestType: this.requestTypes[0].lookupKey,
      implementingAgencyType: this.implementingAgencyTypes[0].lookupKey
    });

    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfoTab(true)),
      categoryInfo: this.fb.group(model.buildCategoryTab(true)),
      categoryGoalPercentGroup: this.fb.group(model.buildCategoryGoalPercentGroup(true), {
        validators: CustomValidators.validateSum(100, 2,
          ['firstSDGoalPercentage', 'secondSDGoalPercentage', 'thirdSDGoalPercentage'],
          [this.lang.getLocalByKey('first_sd_goal_percentage'), this.lang.getLocalByKey('second_sd_goal_percentage'), this.lang.getLocalByKey('third_sd_goal_percentage')]
        )
      }),
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
      description: this.fb.control(model.description, CustomValidators.required)
    });
  }

  _afterBuildForm(): void {
    setTimeout(() => {
      if (this.fromDialog) {
        this.readonly = this.model?.getCaseStatus() === CaseStatus.CANCELED || this.model?.getCaseStatus() === CaseStatus.FINAL_APPROVE;

        this.model && this.model.templateId && this.service.getTemplateById(this.model?.templateId)
          .pipe(takeUntil(this.destroy$)).subscribe((template) => {
            this.selectedModel = template;
            this.displayTemplateSerialField = true;
            this.templateSerialControl.setValue(template.templateFullSerial);
          })
        this.onModelTypeChange();
      }
    })
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    const validAttachments$ = this.attachmentComponent.attachments.length ? of(true) : this.attachmentComponent.reload();
    if (saveType === SaveTypes.DRAFT) {
      return true;
    }
    return of(this.form.valid)
      .pipe(
        switchMap((valid) => iif(() => !!(valid && this.model?.id), validAttachments$, of(valid)))
      )
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterLaunch(): void {
    this._resetForm();
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
      description: this.descriptionTab.value
    });
  }

  _afterSave(model: ProjectModel, saveType: SaveTypes, operation: OperationTypes): void {
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
  }

  /**
   *  list of getters for most used FormController/FormGroup
   */

  get requestType(): AbstractControl {
    return this.form.get('basicInfo')?.get('requestType') as AbstractControl;
  }

  get projectTotalCostField(): AbstractControl {
    return this.form.get('componentBudgetInfo')?.get('projectTotalCost') as AbstractControl;
  }

  get componentBudgetArray(): FormArray {
    return this.form.get('componentBudgetInfo')?.get('componentList') as FormArray;
  }

  get basicInfoTab(): FormGroup {
    return this.form.get('basicInfo') as FormGroup
  }

  get categoryInfoTab(): FormGroup {
    return this.form.get('categoryInfo') as FormGroup
  }

  get categoryGoalPercentGroup(): FormGroup {
    return this.form.get('categoryGoalPercentGroup') as FormGroup
  }

  get summaryInfoTab(): FormGroup {
    return this.form.get('summaryInfo') as FormGroup
  }

  get summaryPercentGroup(): FormGroup {
    return this.form.get('summaryPercentGroup') as FormGroup
  }

  get descriptionTab(): AbstractControl {
    return this.form.get('description') as AbstractControl
  }

  get modelType(): AbstractControl {
    return this.basicInfoTab.get('templateType') as AbstractControl;
  }

  get projectType(): AbstractControl {
    return this.basicInfoTab.get('projectType') as AbstractControl;
  }

  get firstGoal(): AbstractControl {
    return this.categoryInfoTab.get('firstSDGoal') as AbstractControl;
  }

  get secondGoal(): AbstractControl {
    return this.categoryInfoTab.get('secondSDGoal') as AbstractControl;
  }

  get thirdGoal(): AbstractControl {
    return this.categoryInfoTab.get('thirdSDGoal') as AbstractControl;
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

  private loadCountries(): void {
    this.countyService.loadCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countries = countries);
  }

  private loadGoals(): void {
    this.sdgService.load().subscribe((goals) => this.goals = goals);
  }

  private loadDacMainOcha(forceLoad: boolean = false): void {
    if (this.isDacOchaLoaded && !forceLoad) {
      return;
    }

    this.dacOchaService
      .load() //TODO: later we can filter the deactivated in case if it is new request
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(_ => this.isDacOchaLoaded = true))
      .subscribe((list) => this.separateDacFromOcha(list))
  }

  private loadSubDacOcha(parent: number): void {
    if (!this.domain.value || !parent) {
      return;
    }
    this.dacOchaService
      .loadSubDacOchas(parent)
      .pipe(takeUntil(this.destroy$))
      .subscribe((list) => {
        this.domain.value === DomainTypes.HUMANITARIAN ? this.subOchaCategories = list : this.subDacCategories = list;
      });
  }

  private emptyFieldsAndValidation(fields: (keyof IDacOchaFields)[]): void {
    fields.forEach((field) => {
      this[field].setValidators(null);
      this[field].setValue(null);
      this[field].updateValueAndValidity();
    });
  }

  private setRequiredValidator(fields: (keyof IDacOchaFields)[]) {
    fields.forEach((field) => {
      this[field].setValidators(CustomValidators.required);
      this[field].updateValueAndValidity();
    });
  }

  private separateDacFromOcha(list: DacOcha[]) {
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
        this.projectTotalCostField.setValue(this.model?.getTotalProjectComponentCost() ?? 0);
      })
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
      this.tabIndex$.next(5);
    }
  }

  tabHasError(tabName: string): boolean {
    const field = this.form.get(tabName);
    return !!(field && field.invalid && (field.touched || field.dirty))
  }

  onModelTypeChange() {
    if (this.modelType.value === ProjectModelTypes.SECTORAL_AGGREGATING_MODEL) {
      //TODO: there is one more condition here related if the admin allowed option to give the user ability to select Structural
      this.projectType.setValue(ProjectTypes.SOFTWARE);
      this.projectType.disable({emitEvent: false});
      this.domain.setValue(DomainTypes.HUMANITARIAN);
      this.onDomainChange();
      this.domain.disable();
    } else if (this.modelType.value === ProjectModelTypes.PROJECT_MODEL) {
      this.projectType.enable({emitEvent: false});
      this.domain.enable();
    } else {
      this.projectType.enable({emitEvent: false});
      this.projectType.setValue(null);
      this.domain.enable();
    }
  }

  onDomainChange() {
    this.loadDacMainOcha();
    if (this.domain.value === DomainTypes.HUMANITARIAN) {
      this.emptyFieldsAndValidation(['mainDACCategory', 'subDACCategory']);
      this.setRequiredValidator(['mainUNOCHACategory', 'subUNOCHACategory'])
      this.sustainabilityItems.setValidators(CustomValidators.maxLength(1200))
    } else if (this.domain.value === DomainTypes.DEVELOPMENT) {
      this.sustainabilityItems.setValidators([CustomValidators.required, CustomValidators.maxLength(1200)])
      this.emptyFieldsAndValidation(['mainUNOCHACategory', 'subUNOCHACategory']);
      this.setRequiredValidator(['mainDACCategory', 'subDACCategory'])
    } else {
      this.emptyFieldsAndValidation([
        'mainUNOCHACategory',
        'subUNOCHACategory',
        'mainDACCategory',
        'subDACCategory'
      ])
    }
    this.sustainabilityItems.updateValueAndValidity();
  }

  onMainDacOchaChanged(): void {
    let selectedId = this.domain.value === DomainTypes.HUMANITARIAN ? this.mainUNOCHACategory.value : this.mainDACCategory.value
    selectedId ? this.loadSubDacOcha(selectedId) : this.emptySubCategories();
  }

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === 'attachments';
  }

  onClickAddProjectComponent(): void {
    this.projectComponentChange$.next({operation: OperationTypes.CREATE, model: new ProjectComponent()})
  }

  onClickEditProjectComponent(model: ProjectComponent): void {
    this.projectComponentChange$.next({operation: OperationTypes.UPDATE, model: model});
    this.currentEditedProjectComponent = model;
  }

  onClickDeleteProjectComponent(model: ProjectComponent): void {
    this.projectComponentChange$.next({operation: OperationTypes.DELETE, model: model})
  }

  saveProjectComponent(): void {
    if (this.currentProjectComponent.invalid) {
      return;
    }
    if (this.currentEditedProjectComponent) {
      this.model && this.model.componentList.splice(this.model.componentList.indexOf(this.currentEditedProjectComponent), 1, (new ProjectComponent()).clone({...this.currentProjectComponent.value}))
      this.model && (this.model.componentList = this.model.componentList.slice());
    } else {
      const list = this.model?.componentList ? this.model?.componentList : []
      this.model && (this.model.componentList = list.concat(new ProjectComponent().clone({...this.currentProjectComponent.value})))
    }
    this.toast.success(this.lang.map.msg_save_success);
    this.projectTotalCostField.setValue(this.model?.getTotalProjectComponentCost() ?? 0);
    this.cancelProjectComponent();
  }

  cancelProjectComponent(): void {
    this.componentBudgetArray.removeAt(0);
  }

  onRequestTypeChange() {
    this.displayTemplateSerialField = this.requestType.value === ProjectModelRequestType.EDIT;
    this.templateSerialControl.setValidators(CustomValidators.required);
  }

  searchForTemplate() {
    if (!this.templateSerialControl.value) {
      return;
    }
    this.searchTemplate$.next(this.templateSerialControl.value);
  }

  listenToTemplateSearch(): void {
    this.searchTemplate$
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap(val => this.service.searchTemplateBySerial(val)))
      .pipe(tap(list => !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria) : null))
      .pipe(filter(v => !!v))
      .pipe(switchMap(list => this.service.openSelectTemplate(list).onAfterClose$))
      .subscribe((result: UserClickOn | ProjectModel) => {
        if (result instanceof ProjectModel) {
          this.selectedModel = result;
          this.templateSerialControl.setValue(result.templateFullSerial);
          this._updateForm(result.clone({
            id: undefined,
            templateId: result.id,
            requestType: this.requestType.value,
          }))
        }
      });
  }
}
