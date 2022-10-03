import { Component, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { ProjectModel } from '@app/models/project-model';
import { LangService } from '@app/services/lang.service';
import { ProjectModelService } from '@app/services/project-model.service';
import { Observable, of, Subject } from 'rxjs';
import { CountryService } from '@app/services/country.service';
import { Country } from '@app/models/country';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { LookupService } from '@app/services/lookup.service';
import { Lookup } from '@app/models/lookup';
import { SDGoalService } from '@app/services/sdgoal.service';
import { SDGoal } from '@app/models/sdgoal';
import { ProjectComponent } from '@app/models/project-component';
import { CustomValidators } from '@app/validators/custom-validators';
import { DomainTypes } from '@app/enums/domain-types';
import { IDacOchaFields } from '@app/interfaces/idac-ocha-fields';
import { ToastService } from '@app/services/toast.service';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { AttachmentsComponent } from '@app/shared/components/attachments/attachments.component';
import { ProjectModelRequestType } from '@app/enums/project-model-request-type';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { OpenFrom } from '@app/enums/open-from.enum';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CommonUtils } from '@app/helpers/common-utils';
import { FileIconsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { DacOchaNewService } from '@services/dac-ocha-new.service';
import { AdminLookup } from '@app/models/admin-lookup';
import {AidLookupService} from '@services/aid-lookup.service';
import {AidLookup} from '@app/models/aid-lookup';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'project-model',
  templateUrl: './project-model.component.html',
  styleUrls: ['./project-model.component.scss']
})
export class ProjectModelComponent extends EServicesGenericComponent<ProjectModel, ProjectModelService> {
  form!: UntypedFormGroup;
  domainTypes: typeof DomainTypes = DomainTypes;
  countries: Country[] = [];
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
  isDacOchaLoaded: boolean = false;
  goals: SDGoal[] = [];
  loadAttachments: boolean = false;
  fileIconsEnum = FileIconsEnum;

  projectComponentChange$: Subject<{ operation: OperationTypes, model: ProjectComponent }> = new Subject<{ operation: OperationTypes, model: ProjectComponent }>();
  projectListColumns: string[] = ['componentName', 'details', 'totalCost', 'actions'];
  projectListTotalCostFooterColumns: string[] = ['totalComponentCostLabel', 'totalComponentCost'];
  currentEditedProjectComponent?: ProjectComponent;
  tabIndex$: Subject<number> = new Subject<number>();

  @ViewChild(AttachmentsComponent)
  attachmentComponent!: AttachmentsComponent;

  selectedModel?: ProjectModel;
  displayedColumns: string[] = ['domainInfo', 'projectTypeInfo', 'templateStatusInfo', 'createdBy', 'createdOn'];
  displayTemplateSerialField: boolean = false;
  displayDevGoals: boolean = false;

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
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      index: 4,
      validStatus: () => this.descriptionTab.valid
    },
    comments: {
      name: 'commentsTab',
      langKey: 'comments',
      index: 5,
      validStatus: () => true
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 6,
      validStatus: () => true
    }
  };

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  constructor(public lang: LangService,
              public fb: UntypedFormBuilder,
              private toast: ToastService,
              private dialog: DialogService,
              public employeeService: EmployeeService,
              private dacOchaService: DacOchaNewService,
              private lookupService: LookupService,
              private countryService: CountryService,
              private sdgService: SDGoalService,
              public service: ProjectModelService,
              private aidLookupService: AidLookupService) {
    super();
  }

  _getNewInstance(): ProjectModel {
    return new ProjectModel();
  }

  _initComponent(): void {
    this.loadSanadiDomains();
    this.loadCountries();
    this.loadGoals();
    this.listenToProjectComponentChange();
    this.listenToTemplateSearch();
  }

  _buildForm(): void {
    let model = (new ProjectModel()).clone({
      requestType: this.requestTypes[0].lookupKey
    });

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
      description: this.fb.control(model.description, CustomValidators.required)
    });
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
      projectTotalCost: this.projectTotalCostField.value,
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
  }

  /**
   *  list of getters for most used FormController/FormGroup
   */

  get requestType(): AbstractControl {
    return this.form.get('basicInfo')?.get('requestType') as AbstractControl;
  }

  get projectWorkArea(): AbstractControl {
    return this.form.get('basicInfo')?.get('projectWorkArea') as AbstractControl;
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

  getPercentageSumValidation(): ValidatorFn {
    return CustomValidators.validateSum(100, 2,
      ['firstSDGoalPercentage', 'secondSDGoalPercentage', 'thirdSDGoalPercentage'],
      [this.lang.getLocalByKey('first_sd_goal_percentage'), this.lang.getLocalByKey('second_sd_goal_percentage'), this.lang.getLocalByKey('third_sd_goal_percentage')]
    );
  }

  private loadCountries(): void {
    this.countryService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countries = countries);
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
      this.sustainabilityItems.setValidators(CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS));
      this.displayDevGoals = false;
      this.categoryGoalPercentGroup.setValidators(null);
    } else if (this.domain.value === DomainTypes.DEVELOPMENT) {
      this.sustainabilityItems.setValidators([CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]);
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
    this.sustainabilityItems.updateValueAndValidity();
    this.categoryGoalPercentGroup.updateValueAndValidity();
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

  onRequestTypeChange() {
    const value = this.requestType.value;
    this._resetForm();
    this.requestType.setValue(value);

    this.displayTemplateSerialField = this.requestType.value === ProjectModelRequestType.EDIT;
    this.templateSerialControl.setValidators(CustomValidators.required);
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
    })
  }

  loadSanadiMainClassification(parentId: number) {
    this.aidLookupService.loadByCriteria({parent: parentId}).subscribe(list => {
      this.sanadiMainClassifications = list;
    })
  }
}
