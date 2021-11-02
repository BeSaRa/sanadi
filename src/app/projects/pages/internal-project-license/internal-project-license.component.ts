import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {InternalProjectLicense} from '@app/models/internal-project-license';
import {InternalProjectLicenseService} from '@app/services/internal-project-license.service';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn} from '@angular/forms';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {DialogService} from '@app/services/dialog.service';
import {EmployeeService} from '@app/services/employee.service';
import {ConfigurationService} from '@app/services/configuration.service';
import {ToastService} from '@app/services/toast.service';
import {Observable, of, Subject} from 'rxjs';
import {SaveTypes} from '@app/enums/save-types';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {OpenFrom} from '@app/enums/open-from.enum';
import {Lookup} from '@app/models/lookup';
import {CommonUtils} from '@app/helpers/common-utils';
import {ServiceRequestTypes} from '@app/enums/service-request-types';
import {catchError, delay, exhaustMap, filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {CustomValidators} from '@app/validators/custom-validators';
import {InternalProjectLicenseResult} from '@app/models/internal-project-license-result';
import {AidLookup} from '@app/models/aid-lookup';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {AidLookupService} from '@app/services/aid-lookup.service';
import {AidTypes} from '@app/enums/aid-types.enum';
import {SDGoal} from '@app/models/sdgoal';
import {SDGoalService} from '@app/services/sdgoal.service';
import {DateUtils} from '@app/helpers/date-utils';
import {ProjectComponent} from '@app/models/project-component';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {LicenseService} from '@app/services/license.service';
import {CaseTypes} from '@app/enums/case-types.enum';

@Component({
  selector: 'internal-project-license',
  templateUrl: './internal-project-license.component.html',
  styleUrls: ['./internal-project-license.component.scss']
})
export class InternalProjectLicenseComponent extends EServicesGenericComponent<InternalProjectLicense, InternalProjectLicenseService> implements AfterViewInit {
  constructor(public lang: LangService,
              private cd: ChangeDetectorRef,
              public service: InternalProjectLicenseService,
              public lookupService: LookupService,
              private dialogService: DialogService,
              public employeeService: EmployeeService,
              private configurationService: ConfigurationService,
              private toastService: ToastService,
              private aidLookupService: AidLookupService,
              private sdGoalService: SDGoalService,
              private licenseService: LicenseService,
              public fb: FormBuilder) {
    super();
  }

  form!: FormGroup;
  operation: OperationTypes = OperationTypes.CREATE;
  readonly: boolean = false;

  requestTypesList: Lookup[] = this.lookupService.listByCategory.ServiceRequestType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  projectTypesList: Lookup[] = this.lookupService.listByCategory.ProjectType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  mainCategoriesList: AidLookup[] = [];
  subCategories1List: AidLookup[] = [];
  subCategories2List: AidLookup[] = [];
  goalsList: SDGoal[] = [];
  nationalityList: Lookup[] = this.lookupService.listByCategory.Nationality;

  selectedLicenseDisplayColumns: string[] = ['arName', 'enName', 'licenseNumber', 'status', 'endDate', 'action'];

  private projectComponentChanged$: Subject<ProjectComponent | null> = new Subject<ProjectComponent | null>();
  private currentProjectComponentRecord?: ProjectComponent;
  addProjectComponent$: Subject<any> = new Subject<any>();
  private saveProjectComponent$: Subject<any> = new Subject<any>();
  editProjectComponentIndex: number = -1;
  projectListColumns: string[] = ['componentName', 'details', 'totalCost', 'actions'];
  projectListFooterColumns: string[] = ['totalComponentCostLabel', 'totalComponentCost'];

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      validStatus: () => this.basicInfoGroup && this.basicInfoGroup.valid
    },
    projectCategory: {
      name: 'projectCategoryTab',
      langKey: 'project_category_info',
      validStatus: () => this.projectCategoryGroup && this.projectCategoryGroup.valid && this.projectCategoryPercentGroup && this.projectCategoryPercentGroup.valid
    },
    projectSummary: {
      name: 'projectSummaryTab',
      langKey: 'project_summary_info',
      validStatus: () => this.projectSummaryGroup && this.projectSummaryGroup.valid
    },
    beneficiaryAnalysis: {
      name: 'beneficiaryAnalysisTab',
      langKey: 'beneficiary_analysis',
      validStatus: () => this.beneficiaryAnalysisGroup && this.beneficiaryAnalysisGroup.valid && this.beneficiaryAnalysisIndividualPercentGroup && this.beneficiaryAnalysisIndividualPercentGroup.valid
    },
    projectComponentsAndBudget: {
      name: 'projectComponentsAndBudgetTab',
      langKey: 'project_components_budgets',
      validStatus: () => this.projectBudgetGroup && this.projectBudgetGroup.valid && (this.model && this.model.componentList.length > 0) && this.projectTotalCostField && this.projectTotalCostField.value > 0
    },
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      validStatus: () => this.specialExplanationsGroup && this.specialExplanationsGroup.valid
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
    recommendations: {
      name: 'recommendations',
      langKey: 'recommendations',
      validStatus: () => true
    }
  };

  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: InternalProjectLicenseResult;

  showAddComponentForm: boolean = false;

  datepickerOptionsMap: IKeyValue = {
    expectedImpactDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  _buildForm(): void {
    let objInternalProjectLicense = new InternalProjectLicense();
    this.form = this.fb.group({
      basicInfo: this.fb.group(objInternalProjectLicense.getBasicFormFields(true)),
      projectCategory: this.fb.group(objInternalProjectLicense.getProjectCategoryFields(true)),
      projectCategoryPercent: this.fb.group(objInternalProjectLicense.getProjectCategoryPercentFields(true), {
        validators: CustomValidators.validateSum(100,
          ['firstSDGoalPercentage', 'secondSDGoalPercentage', 'thirdSDGoalPercentage'],
          [this.lang.getLocalByKey('first_sd_goal_percentage'), this.lang.getLocalByKey('second_sd_goal_percentage'), this.lang.getLocalByKey('third_sd_goal_percentage')])
      }),
      projectSummary: this.fb.group(objInternalProjectLicense.getProjectSummaryFields(true)),
      beneficiaryAnalysis: this.fb.group(objInternalProjectLicense.getBeneficiaryAnalysisFields(true)),
      beneficiaryAnalysisIndividualPercent: this.fb.group(objInternalProjectLicense.getBeneficiaryAnalysisDirectPercentFields(true), {
        validators: CustomValidators.validateSum(100,
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
      projectComponents: this.fb.array([]),
      projectBudget: this.fb.group(objInternalProjectLicense.getProjectBudgetFields(true)),
      specialExplanations: this.fb.group(objInternalProjectLicense.getSpecialExplanationFields(true))
    });
  }

  _destroyComponent(): void {
  }

  _getNewInstance(): InternalProjectLicense {
    return new InternalProjectLicense();
  }

  _initComponent(): void {
    this.loadGoalsList();
    this.listenToLicenseSearch();
  }

  _afterBuildForm(): void {
    setTimeout(() => {
      this.loadAidLookup(AidTypes.CLASSIFICATIONS);
      this.listenToAddProjectComponent();
      this.listenToProjectComponentChange();
      this.listenToSaveProjectComponent();

      if (this.fromDialog) {
        const oldLicenseFullSerial = this.oldLicenseFullSerialField.value && this.oldLicenseFullSerialField.value.trim();
        if (oldLicenseFullSerial) {
          this.loadSelectedLicense(oldLicenseFullSerial);
        }
      }
    })
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (this.requestTypeField.value !== ServiceRequestTypes.NEW && !this.selectedLicense) {
      this.dialogService.error(this.lang.map.please_select_license_to_complete_save);
      return false;
    } else {
      if (saveType === SaveTypes.DRAFT) {
        return true;
      }
      const invalidTabs = this._getInvalidTabs();
      if (invalidTabs.length > 0) {
        const listHtml = CommonUtils.generateHtmlList(this.lang.map.msg_following_tabs_valid, invalidTabs);
        this.dialogService.error(listHtml.outerHTML);
        return false;
      } else {
        // if project component total cost is 0, mark it invalid
        if (!this.projectTotalCostField || !CommonUtils.isValidValue(this.projectTotalCostField.value) || this.projectTotalCostField.value === 0) {
          this.toastService.error(this.lang.map.err_invalid_project_component_total_x.change({value: this.projectTotalCostField.value || 0}));
          return false;
        }
        return true;
      }
    }
  }

  _afterSave(model: InternalProjectLicense, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialogService.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toastService.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toastService.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {
  }

  _prepareModel(): Observable<InternalProjectLicense> | InternalProjectLicense {
    return (new InternalProjectLicense()).clone({
      ...this.model,
      ...this.form.value.basicInfo,
      ...this.form.value.projectCategory,
      ...this.form.value.projectCategoryPercent,
      ...this.form.value.projectSummary,
      ...this.form.value.beneficiaryAnalysis,
      ...this.form.value.beneficiaryAnalysisIndividualPercent,
      ...this.form.value.projectBudget,
      ...this.form.value.specialExplanations,
    });
  }

  _saveFail(error: any): void {
    console.log('problem in save');
  }

  _updateForm(model: InternalProjectLicense | undefined): void {
    this.model = model;
    // patch the form here
    if (!model) {
      this.cd.detectChanges();
      return;
    }

    this.form.patchValue({
      basicInfo: model.getBasicFormFields(),
      projectCategory: model.getProjectCategoryFields(),
      projectCategoryPercent: model.getProjectCategoryPercentFields(),
      projectSummary: model.getProjectSummaryFields(),
      beneficiaryAnalysis: model.getBeneficiaryAnalysisFields(),
      beneficiaryAnalysisIndividualPercent: model.getBeneficiaryAnalysisDirectPercentFields(),
      projectBudget: model.getProjectBudgetFields(),
      specialExplanations: model.getSpecialExplanationFields()
    });

    this.handleRequestTypeChange(model.requestType);
    this.handleChangeMainCategory(model.domain, false);
    this.handleChangeSubCategory1(model.firstSubDomain, false);
    this.updateBeneficiaryValidations();

    console.log('basicInfo.oldLicenseFullserial', this.form.get('basicInfo.oldLicenseFullserial')?.value);
    console.log('basicInfo.oldLicenseId', this.form.get('basicInfo.oldLicenseId')?.value);
    console.log('basicInfo.oldLicenseSerial', this.form.get('basicInfo.oldLicenseSerial')?.value);

    this.cd.detectChanges();
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;

    this.subCategories1List = [];
    this.subCategories2List = [];
    this.projectTotalCostField.setValue(null);
    this.projectTotalCostField.updateValueAndValidity();

    this.updateBeneficiaryValidations();
  }

  isAddAttachmentAllowed(): boolean {
    if (!this.model?.id) {
      return false;
    }
    let isAllowed = true;
    if (this.openFrom === OpenFrom.TEAM_INBOX) {
      isAllowed = this.model.taskDetails.isClaimed();
    }

    return isAllowed;
  }

  get basicInfoGroup(): FormGroup {
    return (this.form.get('basicInfo')) as FormGroup;
  }

  get projectCategoryGroup(): FormGroup {
    return (this.form.get('projectCategory')) as FormGroup;
  }

  get projectCategoryPercentGroup(): FormGroup {
    return (this.form.get('projectCategoryPercent')) as FormGroup;
  }

  get projectSummaryGroup(): FormGroup {
    return (this.form.get('projectSummary')) as FormGroup;
  }

  get beneficiaryAnalysisGroup(): FormGroup {
    return (this.form.get('beneficiaryAnalysis')) as FormGroup;
  }

  get beneficiaryAnalysisIndividualPercentGroup(): FormGroup {
    return (this.form.get('beneficiaryAnalysisIndividualPercent')) as FormGroup;
  }

  get projectBudgetGroup(): FormGroup {
    return (this.form.get('projectBudget')) as FormGroup;
  }

  get projectComponentsFormArray(): FormArray {
    return (this.form.get('projectComponents')) as FormArray;
  }

  get specialExplanationsGroup(): FormGroup {
    return (this.form.get('specialExplanations')) as FormGroup;
  }

  get requestTypeField(): FormControl {
    return (this.basicInfoGroup?.get('requestType')) as FormControl;
  }

  get oldLicenseFullSerialField(): FormControl {
    return (this.basicInfoGroup?.get('oldLicenseFullserial')) as FormControl;
  }

  get mainCategoryField(): FormControl {
    return (this.projectCategoryGroup?.get('domain')) as FormControl;
  }

  get subCategory1Field(): FormControl {
    return (this.projectCategoryGroup?.get('firstSubDomain')) as FormControl;
  }

  get subCategory2Field(): FormControl {
    return (this.projectCategoryGroup?.get('secondSubDomain')) as FormControl;
  }

  get firstSDGoalField(): FormControl {
    return (this.projectCategoryGroup?.get('firstSDGoal')) as FormControl;
  }

  get secondSDGoalField(): FormControl {
    return (this.projectCategoryGroup?.get('secondSDGoal')) as FormControl;
  }

  get thirdSDGoalField(): FormControl {
    return (this.projectCategoryGroup?.get('thirdSDGoal')) as FormControl;
  }

  get individualBeneficiarySwitchField(): FormControl {
    return (this.beneficiaryAnalysisGroup?.get('hasIndividualBeneficiaries')) as FormControl;
  }

  get familyBeneficiarySwitchField(): FormControl {
    return (this.beneficiaryAnalysisGroup?.get('hasFamilyBeneficiaries')) as FormControl;
  }

  get targetedNationalitiesField(): FormControl {
    return (this.beneficiaryAnalysisGroup?.get('targetedNationalities')) as FormControl;
  }

  get familyNumberOfTargetedFamiliesField(): FormControl {
    return (this.beneficiaryAnalysisGroup?.get('beneficiaryFamiliesNumber')) as FormControl;
  }

  get familyAverageNumberOfPeopleField(): FormControl {
    return (this.beneficiaryAnalysisGroup?.get('individualsAverageNumber')) as FormControl;
  }

  get familyAverageAgeGroupField(): FormControl {
    return (this.beneficiaryAnalysisGroup?.get('ageAverageCategory')) as FormControl;
  }

  get individualNumberOfDirectBeneficiaryField(): FormControl {
    return (this.beneficiaryAnalysisGroup?.get('directBeneficiaryNumber')) as FormControl;
  }

  get individualNumberOfInDirectBeneficiaryField(): FormControl {
    return (this.beneficiaryAnalysisGroup?.get('indirectBeneficiaryNumber')) as FormControl;
  }

  get individualSpecialNeedsBeneficiaryField(): FormControl {
    return (this.beneficiaryAnalysisGroup?.get('handicappedBeneficiaryNumber')) as FormControl;
  }

  get individual_0To5_Field(): FormControl {
    return (this.beneficiaryAnalysisIndividualPercentGroup?.get('beneficiaries0to5')) as FormControl;
  }

  get individual_5To18_Field(): FormControl {
    return (this.beneficiaryAnalysisIndividualPercentGroup?.get('beneficiaries5to18')) as FormControl;
  }

  get individual_19To60_Field(): FormControl {
    return (this.beneficiaryAnalysisIndividualPercentGroup?.get('beneficiaries19to60')) as FormControl;
  }

  get individual_60Above_Field(): FormControl {
    return (this.beneficiaryAnalysisIndividualPercentGroup?.get('beneficiariesOver60')) as FormControl;
  }

  get projectTotalCostField(): FormControl {
    return (this.projectBudgetGroup?.get('projectTotalCost')) as FormControl;
  }


  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return isAllowed && CommonUtils.isValidValue(this.requestTypeField.value) && this.requestTypeField.value !== ServiceRequestTypes.NEW;
  }

  private _handleRequestTypeDependentControls(): void {
    if (this.isExtendOrCancelRequestType() || this.readonly) {
      this.familyBeneficiarySwitchField.disable();
      this.individualBeneficiarySwitchField.disable();
    } else {
      this.familyBeneficiarySwitchField.enable();
      this.individualBeneficiarySwitchField.enable();
    }
  }

  handleRequestTypeChange(requestTypeValue: number): void {
    this._handleRequestTypeDependentControls();

    if (!requestTypeValue) {
      requestTypeValue = this.requestTypeField && this.requestTypeField.value;
    }

    // if no requestType or (requestType = new)
    // if new record or draft, reset license and its validations
    // also reset the values in model
    if (!requestTypeValue || (requestTypeValue === ServiceRequestTypes.NEW)) {
      if (!this.model?.id || this.model.canCommit()) {
        this.oldLicenseFullSerialField.reset();
        this.oldLicenseFullSerialField.setValidators([]);
        this.setSelectedLicense(undefined, undefined);

        if (this.model) {
          this.model.licenseNumber = '';
          this.model.licenseDuration = 0;
          this.model.licenseStartDate = '';
        }
      }
    } else {
      this.oldLicenseFullSerialField.setValidators([CustomValidators.required, (control) => {
        return this.selectedLicense && this.selectedLicense?.fullSerial === control.value ? null : {select_license: true}
      }]);
    }

    this.oldLicenseFullSerialField.updateValueAndValidity();
  }

  handleChangeMainCategory(value: number, forceResetSubValue: boolean = false): void {
    this.subCategories1List = [];
    this.subCategories2List = [];

    if (forceResetSubValue) {
      this.subCategory1Field.reset();
      this.subCategory1Field.updateValueAndValidity();
      this.subCategory1Field.markAsTouched();

      this.subCategory2Field.reset();
      this.subCategory2Field.updateValueAndValidity();
      this.subCategory2Field.markAsTouched();
    }

    if (value) {
      this.loadAidLookup(AidTypes.MAIN_CATEGORY, value);
    }
  }

  handleChangeSubCategory1(value: number, forceResetSubValue: boolean = false): void {
    this.subCategories2List = [];
    if (forceResetSubValue) {
      this.subCategory2Field.reset();
      this.subCategory2Field.updateValueAndValidity();
      this.subCategory2Field.markAsTouched();
    }
    if (value) {
      this.loadAidLookup(AidTypes.SUB_CATEGORY, value);
    }
  }

  updateBeneficiaryValidations(type: 'FAMILY' | 'INDIVIDUAL' | 'BOTH' = 'BOTH'): void {
    switch (type) {
      case 'FAMILY':
        this._updateFamilyBeneficiaryValidations();
        break;
      case 'INDIVIDUAL':
        this._updateIndividualBeneficiaryValidations();
        break;
      default:
        this._updateIndividualBeneficiaryValidations();
        this._updateFamilyBeneficiaryValidations();
    }
  }

  private static _setFieldValidationAndUpdate(field: FormControl, validations: ValidatorFn | ValidatorFn[] | null) {
    field.setValidators(validations);
    field.updateValueAndValidity();
  }

  private _updateIndividualBeneficiaryValidations(): void {
    let isEnabled = this.individualBeneficiarySwitchField.value,
      validators = isEnabled ? [CustomValidators.required] : [];

    InternalProjectLicenseComponent._setFieldValidationAndUpdate(this.individualNumberOfDirectBeneficiaryField, validators.concat([CustomValidators.number]));
    InternalProjectLicenseComponent._setFieldValidationAndUpdate(this.individualNumberOfInDirectBeneficiaryField, validators.concat([CustomValidators.number]));
    InternalProjectLicenseComponent._setFieldValidationAndUpdate(this.individualSpecialNeedsBeneficiaryField, validators.concat([CustomValidators.number]));
    InternalProjectLicenseComponent._setFieldValidationAndUpdate(this.individual_0To5_Field, validators.concat([CustomValidators.decimal(2)]));
    InternalProjectLicenseComponent._setFieldValidationAndUpdate(this.individual_5To18_Field, validators.concat([CustomValidators.decimal(2)]));
    InternalProjectLicenseComponent._setFieldValidationAndUpdate(this.individual_19To60_Field, validators.concat([CustomValidators.decimal(2)]));
    InternalProjectLicenseComponent._setFieldValidationAndUpdate(this.individual_60Above_Field, validators.concat([CustomValidators.decimal(2)]));
  }

  private _updateFamilyBeneficiaryValidations(): void {
    let isEnabled = this.familyBeneficiarySwitchField.value,
      validators = isEnabled ? [CustomValidators.required] : [];

    InternalProjectLicenseComponent._setFieldValidationAndUpdate(this.familyNumberOfTargetedFamiliesField, validators.concat([CustomValidators.number]));
    InternalProjectLicenseComponent._setFieldValidationAndUpdate(this.familyAverageNumberOfPeopleField, validators.concat([CustomValidators.number]));
    InternalProjectLicenseComponent._setFieldValidationAndUpdate(this.familyAverageAgeGroupField, validators.concat([CustomValidators.number]));
  }

  private loadSelectedLicense(oldLicenseFullSerial: string): void {
    if (!this.model || !oldLicenseFullSerial) {
      return;
    }
    this.service
      .licenseSearch({licenseNumber: oldLicenseFullSerial})
      .pipe(
        filter(list => !!list.length),
        map(list => list[0]),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license, undefined)
      })
  }

  licenseSearch($event: Event): void {
    $event.preventDefault();
    const value = this.oldLicenseFullSerialField.value && this.oldLicenseFullSerialField.value.trim();
    if (!value) {
      this.dialogService.info(this.lang.map.need_license_number_to_search)
      return;
    }
    this.licenseSearch$.next(value);
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(exhaustMap(oldLicenseFullSerial => {
        return this.service
          .licenseSearch({fullSerial: oldLicenseFullSerial})
          .pipe(catchError(() => of([])))
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => !list.length ? this.dialogService.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter(result => !!result.length),
        // switch to the dialog ref to use it later and catch the user response
        switchMap(license => this.licenseService.openSelectLicenseDialog(license, this.model).onAfterClose$),
        // allow only if the user select license
        filter<{ selected: InternalProjectLicenseResult, details: InternalProjectLicense }, any>
        ((selection): selection is { selected: InternalProjectLicenseResult, details: InternalProjectLicense } => {
          return !!(selection);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection.selected, selection.details);
      })
  }

  private setSelectedLicense(selectedLicense?: InternalProjectLicenseResult, licenseDetails?: InternalProjectLicense) {
    this.selectedLicense = selectedLicense;
    // update form fields if i have license
    if (selectedLicense && licenseDetails) {
      let value: any = (new InternalProjectLicense()).clone(licenseDetails);
      value.requestType = this.requestTypeField.value;
      value.oldLicenseFullserial = selectedLicense.fullSerial;
      value.oldLicenseId = selectedLicense.id;
      value.oldLicenseSerial = selectedLicense.serial;

      // delete id because license details contains old license id and we are adding new, so no id is needed
      delete value.id;
      delete value.vsId;

      this._updateForm(value);
    }
  }

  loadLicencesByCriteria(value: any): Observable<InternalProjectLicenseResult[]> {
    return this.service.licenseSearch({licenseNumber: value});
  }

  isNewRequestType(): boolean {
    return this.requestTypeField.value && (this.requestTypeField.value === ServiceRequestTypes.NEW);
  }

  isRenewOrUpdateRequestType(): boolean {
    return this.requestTypeField.value && (this.requestTypeField.value === ServiceRequestTypes.RENEW || this.requestTypeField.value === ServiceRequestTypes.UPDATE);
  }

  isExtendOrCancelRequestType(): boolean {
    return this.requestTypeField.value && (this.requestTypeField.value === ServiceRequestTypes.EXTEND || this.requestTypeField.value === ServiceRequestTypes.CANCEL);
  }

  loadAidLookup(aidType: AidTypes, parentId?: number): void {
    this.aidLookupService.loadByCriteria({aidType: aidType, parent: parentId})
      .subscribe((data) => {
        if (aidType === AidTypes.CLASSIFICATIONS) {
          this.mainCategoriesList = data;
        } else if (aidType === AidTypes.MAIN_CATEGORY) {
          this.subCategories1List = data;
        } else if (aidType === AidTypes.SUB_CATEGORY) {
          this.subCategories2List = data;
        }
      });
  }

  loadGoalsList(): void {
    this.sdGoalService.load()
      .subscribe((data) => {
        this.goalsList = data;
      })
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

  private resetProjectComponentsForm() {
    this.projectComponentsFormArray.clear();
    this.projectComponentsFormArray.markAsUntouched();
    this.projectComponentsFormArray.markAsPristine();
  }

  private listenToAddProjectComponent() {
    this.addProjectComponent$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.projectComponentChanged$.next(new ProjectComponent());
      });
  }

  listenToProjectComponentChange() {
    this.projectComponentChanged$.pipe(takeUntil(this.destroy$)).subscribe((projectComponent) => {
      this.currentProjectComponentRecord = projectComponent || undefined;
      this.updateProjectComponentForm(this.currentProjectComponentRecord);
    });
  }

  private updateProjectComponentForm(projectComponent: ProjectComponent | undefined) {
    const projectComponentsFormArray = this.projectComponentsFormArray;
    projectComponentsFormArray.clear();
    if (projectComponent) {
      projectComponentsFormArray.push(this.fb.group(projectComponent.buildForm(true)));
      if (this.readonly) {
        this.projectComponentsFormArray.disable();
      }
    }
  }

  cancelProjectComponent() {
    this.resetProjectComponentsForm();
    this.editProjectComponentIndex = -1;
  }


  saveProjectComponent() {
    if (this.readonly) {
      return;
    }
    this.saveProjectComponent$.next();
  }

  private listenToSaveProjectComponent() {
    const projectComponentForm$ = this.saveProjectComponent$.pipe(map(() => {
      return (this.form.get('projectComponents.0')) as AbstractControl;
    }));

    const validForm$ = projectComponentForm$.pipe(filter((form) => form.valid));
    const invalidForm$ = projectComponentForm$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.form.get('projectComponents')?.markAllAsTouched();
        });
    });

    validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return (this.form.get('projectComponents.0')) as FormArray;
      }),
      map((form) => {
        return (new ProjectComponent()).clone({
          ...this.currentProjectComponentRecord, ...form.getRawValue()
        });
      })
    ).subscribe((projectComponent: ProjectComponent) => {
      if (!projectComponent) {
        return;
      }

      if (this.model) {
        if (this.editProjectComponentIndex > -1) {
          this.model.componentList.splice(this.editProjectComponentIndex, 1, projectComponent);
        } else {
          this.model.componentList.push(projectComponent);
        }

        this.model.componentList = this.model.componentList.slice();
        this.projectTotalCostField.setValue(this.model.getTotalProjectComponentCost());
        this.projectTotalCostField.updateValueAndValidity();
      }

      this.toastService.success(this.lang.map.msg_save_success);
      this.editProjectComponentIndex = -1;
      this.projectComponentChanged$.next(null);
    });
  }


  editProjectComponent($event: MouseEvent, record: ProjectComponent, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editProjectComponentIndex = index;
    this.projectComponentChanged$.next(record);
  }

  deleteProjectComponent($event: MouseEvent, record: ProjectComponent, index: number): any {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          if (this.model) {
            this.model.componentList.splice(index, 1);
            this.model.componentList = this.model.componentList.slice();
          }
          this.toastService.success(this.lang.map.msg_delete_success);
        }
      });
  }

  viewLicenseAsPDF(license: InternalProjectLicenseResult) {
    return this.licenseService.showLicenseContent(license, CaseTypes.INTERNAL_PROJECT_LICENSE)
      .subscribe((file) => {
        if (file.blob.type === 'error') {
          return;
        }
        return this.licenseService.openLicenseFullContentDialog(file, license);
      });
  }

  searchNgSelect(term: string, item: any): boolean {
    return item.ngSelectSearch(term);
  }
}
