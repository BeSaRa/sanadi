import {Component} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {ProjectModel} from "@app/models/project-model";
import {LangService} from '@app/services/lang.service';
import {ProjectModelService} from "@app/services/project-model.service";
import {Observable} from 'rxjs';
import {CountryService} from "@app/services/country.service";
import {Country} from "@app/models/country";
import {takeUntil, tap} from "rxjs/operators";
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
  requestTypes: Lookup[] = this.lookupService.listByCategory.ServiceRequestType.slice().reverse();
  implementingAgencyTypes: Lookup[] = this.lookupService.listByCategory.ImplementingAgencyType;

  mainOchaCategories: DacOcha[] = [];
  subOchaCategories: DacOcha[] = [];
  mainDacCategories: DacOcha[] = [];
  subDacCategories: DacOcha[] = [];

  isDacOchaLoaded: boolean = false;

  goals: SDGoal[] = [];

  loadAttachments: boolean = false;

  constructor(public lang: LangService,
              public fb: FormBuilder,
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
  }

  _buildForm(): void {
    let model = new ProjectModel();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfoTab(true)),
      categoryInfo: this.fb.group(model.buildCategoryTab(true)),
      summaryInfo: this.fb.group(model.buildSummaryTab(true)),
      componentBudgetInfo: this.fb.array([this.fb.group(new ProjectComponent().buildForm(true))]),
      description: this.fb.control(model.description, CustomValidators.required)
    });
  }

  _afterBuildForm(): void {
    // throw new Error('Method not implemented.');
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    // throw new Error('Method not implemented.');
    return true;
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    // throw new Error('Method not implemented.');
    return true;
  }

  _afterLaunch(): void {
    // throw new Error('Method not implemented.');
  }

  _prepareModel(): ProjectModel | Observable<ProjectModel> {
    return new ProjectModel().clone({});
  }

  _afterSave(model: ProjectModel, saveType: SaveTypes, operation: OperationTypes): void {
    // throw new Error('Method not implemented.');
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

  _updateForm(model: ProjectModel | undefined): void {
    // throw new Error('Method not implemented.');
  }

  _resetForm(): void {
    // throw new Error('Method not implemented.');
  }

  /**
   *  list of getters for most used FormController/FormGroup
   */
  get componentBudgetArray(): FormArray {
    return this.form.get('componentBudgetInfo') as FormArray;
  }

  get basicInfoTab(): AbstractControl {
    return this.form.get('basicInfo') as AbstractControl
  }

  get categoryInfoTab(): AbstractControl {
    return this.form.get('categoryInfo') as AbstractControl
  }

  get summaryInfoTab(): AbstractControl {
    return this.form.get('summaryInfo') as AbstractControl
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

  get subDACCategory(): AbstractControl {
    return this.categoryInfoTab.get('subDACCategory') as AbstractControl;
  }

  get mainUNOCHACategory(): AbstractControl {
    return this.categoryInfoTab.get('mainUNOCHACategory') as AbstractControl;
  }

  get subUNOCHACategory(): AbstractControl {
    return this.categoryInfoTab.get('subUNOCHACategory') as AbstractControl;
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
    } else if (this.domain.value === DomainTypes.DEVELOPMENT) {
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
  }

  onMainDacOchaChanged(): void {
    let selectedId = this.domain.value === DomainTypes.HUMANITARIAN ? this.mainUNOCHACategory.value : this.mainDACCategory.value
    selectedId ? this.loadSubDacOcha(selectedId) : this.emptySubCategories();
  }

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === 'attachments';
  }
}
