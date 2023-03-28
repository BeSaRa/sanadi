import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {InternalProjectLicense} from '@models/internal-project-license';
import {InternalProjectLicenseService} from '@services/internal-project-license.service';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {IKeyValue} from '@contracts/i-key-value';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {DialogService} from '@services/dialog.service';
import {EmployeeService} from '@services/employee.service';
import {ConfigurationService} from '@services/configuration.service';
import {ToastService} from '@services/toast.service';
import {Observable, of, Subject} from 'rxjs';
import {SaveTypes} from '@enums/save-types';
import {OperationTypes} from '@enums/operation-types.enum';
import {OpenFrom} from '@enums/open-from.enum';
import {Lookup} from '@models/lookup';
import {CommonUtils} from '@helpers/common-utils';
import {ServiceRequestTypes} from '@enums/service-request-types';
import {catchError, exhaustMap, filter, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {CustomValidators} from '@app/validators/custom-validators';
import {InternalProjectLicenseResult} from '@models/internal-project-license-result';
import {AidLookup} from '@models/aid-lookup';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {AidLookupService} from '@services/aid-lookup.service';
import {AidTypes} from '@enums/aid-types.enum';
import {SDGoal} from '@models/sdgoal';
import {SDGoalService} from '@services/sdgoal.service';
import {DateUtils} from '@helpers/date-utils';
import {ProjectComponent} from '@models/project-component';
import {UserClickOn} from '@enums/user-click-on.enum';
import {LicenseService} from '@services/license.service';
import {InternalProjectLicenseSearchCriteria} from '@models/internal-project-license-search-criteria';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {FileIconsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {DatepickerOptionsMap} from '@app/types/types';
import {CommonCaseStatus} from '@enums/common-case-status.enum';

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
              public fb: UntypedFormBuilder) {
    super();
  }

  form!: UntypedFormGroup;
  operation: OperationTypes = OperationTypes.CREATE;
  readonly: boolean = false;
  validFamilyOrIndividualSwitchMsg: string = '&nbsp;';
  fileIconsEnum = FileIconsEnum;

  requestTypesList: Lookup[] = this.lookupService.listByCategory.ServiceRequestTypeNoRenew.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  projectTypesList: Lookup[] = this.lookupService.listByCategory.ProjectType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  mainCategoriesList: AidLookup[] = [];
  subCategories1List: AidLookup[] = [];
  subCategories2List: AidLookup[] = [];
  goalsList: SDGoal[] = [];
  nationalityList: Lookup[] = this.lookupService.listByCategory.Nationality;
  loadAttachments: boolean = false;

  private projectComponentChanged$: Subject<ProjectComponent | null> = new Subject<ProjectComponent | null>();
  private currentProjectComponentRecord?: ProjectComponent;
  addProjectComponent$: Subject<any> = new Subject<any>();
  private saveProjectComponent$: Subject<any> = new Subject<any>();
  editProjectComponentIndex: number = -1;
  projectListColumns: string[] = ['componentName', 'details', 'totalCost', 'actions'];
  projectListTotalCostFooterColumns: string[] = ['totalComponentCostLabel', 'totalComponentCost'];
  projectListAdminTotalCostFooterColumns: string[] = ['adminTotalCostLabel', 'adminTotalCost'];
  projectListTargetCostFooterColumns: string[] = ['targetCostLabel', 'targetCost'];

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      index: 0,
      validStatus: () => this.basicInfoGroup && this.basicInfoGroup.valid
    },
    projectCategory: {
      name: 'projectCategoryTab',
      langKey: 'project_category_info',
      index: 1,
      validStatus: () => this.projectCategoryGroup && this.projectCategoryGroup.valid && this.projectCategoryPercentGroup && this.projectCategoryPercentGroup.valid
    },
    projectSummary: {
      name: 'projectSummaryTab',
      langKey: 'project_summary_info',
      index: 2,
      validStatus: () => this.projectSummaryGroup && this.projectSummaryGroup.valid
    },
    beneficiaryAnalysis: {
      name: 'beneficiaryAnalysisTab',
      langKey: 'beneficiary_analysis',
      index: 3,
      validStatus: () => {
        // if groups don't exist or beneficiaryAnalysisGroup is inValid, return false
        if (!(this.beneficiaryAnalysisGroup && this.beneficiaryAnalysisGroup.valid && this.beneficiaryAnalysisIndividualPercentGroup)) {
          return false;
        }
        if (!this._checkValidFamilyOrIndividualSwitch()) {
          return false;
        }

        // if beneficiaryAnalysisIndividualPercentGroup is disabled, means its valid => return true
        if (this.beneficiaryAnalysisIndividualPercentGroup.disabled) {
          return true;
        }
        return this.beneficiaryAnalysisIndividualPercentGroup.valid;
      }
    },
    projectComponentsAndBudget: {
      name: 'projectComponentsAndBudgetTab',
      langKey: 'project_components_budgets',
      index: 4,
      validStatus: () => this.projectBudgetGroup && this.projectBudgetGroup.valid && (this.model && this.model.componentList.length > 0) && this.projectTotalCostField && this.projectTotalCostField.value > 0
    },
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      index: 5,
      validStatus: () => this.specialExplanationsGroup && this.specialExplanationsGroup.valid
    },
    comments: {
      name: 'commentsTab',
      langKey: 'comments',
      index: 6,
      validStatus: () => true
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 7,
      validStatus: () => true
    }
  };
  tabIndex$: Subject<number> = new Subject<number>();

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }

  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: InternalProjectLicense;

  datepickerOptionsMap: DatepickerOptionsMap = {
    expectedImpactDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'})
  };

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  private _getGroupPercentageValidations(groupName: 'NONE' | 'projectCategoryPercent' | 'beneficiaryAnalysisIndividualPercent'): (ValidatorFn | ValidatorFn[] | null) {
    let validators: (ValidatorFn | ValidatorFn[] | null) = null;

    if (groupName === 'projectCategoryPercent') {
      validators = CustomValidators.validateSum(100, 2,
        ['firstSDGoalPercentage',
          'secondSDGoalPercentage',
          'thirdSDGoalPercentage'
        ], [
          this.lang.getLocalByKey('first_sd_goal_percentage'),
          this.lang.getLocalByKey('second_sd_goal_percentage'),
          this.lang.getLocalByKey('third_sd_goal_percentage')
        ]);
    } else if (groupName === 'beneficiaryAnalysisIndividualPercent') {
      validators = CustomValidators.validateSum(100, 2,
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
      );
    }
    return validators;
  }

  _buildForm(): void {
    let objInternalProjectLicense = this._getNewInstance();
    this.form = this.fb.group({
      basicInfo: this.fb.group(objInternalProjectLicense.getBasicFormFields(true)),
      projectCategory: this.fb.group(objInternalProjectLicense.getProjectCategoryFields(true)),
      projectCategoryPercent: this.fb.group(objInternalProjectLicense.getProjectCategoryPercentFields(true), {
        validators: this._getGroupPercentageValidations('projectCategoryPercent')
      }),
      projectSummary: this.fb.group(objInternalProjectLicense.getProjectSummaryFields(true)),
      beneficiaryAnalysis: this.fb.group(objInternalProjectLicense.getBeneficiaryAnalysisFields(true)),
      beneficiaryAnalysisIndividualPercent: this.fb.group(objInternalProjectLicense.getBeneficiaryAnalysisDirectPercentFields(true)),
      projectComponents: this.fb.array([]),
      projectBudget: this.fb.group(objInternalProjectLicense.getProjectBudgetFields(true)),
      specialExplanations: this.fb.group(objInternalProjectLicense.getSpecialExplanationFields(true))
    });
  }

  _destroyComponent(): void {
  }

  _getNewInstance(): InternalProjectLicense {
    return (new InternalProjectLicense()).clone({
      ageAverageCategory: 0,
      beneficiaries0to5: 0,
      beneficiaries5to18: 0,
      beneficiaries19to60: 0,
      beneficiariesOver60: 0,
      beneficiaryFamiliesNumber: 0,
      directBeneficiaryNumber: 0,
      firstSDGoalPercentage: 0,
      handicappedBeneficiaryNumber: 0,
      indirectBeneficiaryNumber: 0,
      individualsAverageNumber: 0,
      thirdSDGoalPercentage: 0,
      secondSDGoalPercentage: 0,
      allNationalities: true
    });
  }

  _initComponent(): void {
    this.loadGoalsList();
    this.listenToLicenseSearch();
  }

  _afterBuildForm(): void {

    this.handleReadonly();
    this.loadAidLookup(AidTypes.CLASSIFICATIONS);
    this.listenToAddProjectComponent();
    this.listenToProjectComponentChange();
    this.listenToSaveProjectComponent();

    this.updateBeneficiaryValidations();

    if (this.fromDialog) {
      this.loadSelectedLicenseById(this.model!.oldLicenseId, () => {
        this.oldLicenseFullSerialField.updateValueAndValidity();
      });
    }

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
        if (!this._checkValidFamilyOrIndividualSwitch()) {
          this.toastService.error(this.lang.map.at_least_one_field_should_be_filled.change({fields: this.lang.map.family_beneficiary + ', ' + this.lang.map.individual_beneficiary}));
          return false;
        }
        // if project component total cost is 0, mark it invalid
        if (!this.projectTotalCostField || !CommonUtils.isValidValue(this.projectTotalCostField.value) || this.projectTotalCostField.value === 0) {
          this.toastService.error(this.lang.map.err_invalid_project_component_total_x.change({value: this.projectTotalCostField.value || 0}));
          return false;
        }
        return true;
      }
    }
  }

  private _updateModelAfterSave(model: InternalProjectLicense): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }

  _afterSave(model: InternalProjectLicense, saveType: SaveTypes, operation: OperationTypes): void {
    this._updateModelAfterSave(model);

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
    this.resetForm$.next();
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
      ...this.beneficiaryAnalysisIndividualPercentGroup.value,
      ...this.form.value.projectBudget,
      ...this.form.value.specialExplanations,
    });
  }

  _saveFail(error: any): void {
    console.log('problem in save');
  }

  private _touchPercentGroups(): void {
    this.projectCategoryPercentGroup.markAsTouched();
    this.beneficiaryAnalysisIndividualPercentGroup.markAsTouched();
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

    this.handleRequestTypeChange(model.requestType, false);
    this.handleChangeMainCategory(model.domain, false);
    this.handleChangeSubCategory1(model.firstSubDomain, false);
    this.updateBeneficiaryValidations();
    this.handleAllNationalitiesChange();

    this.cd.detectChanges();
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.setSelectedLicense(undefined, true);
    this.subCategories1List = [];
    this.subCategories2List = [];
    this.projectTotalCostField.setValue(null);
    this.projectTotalCostField.updateValueAndValidity();

    this.updateBeneficiaryValidations();
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

  get basicInfoGroup(): UntypedFormGroup {
    return (this.form.get('basicInfo')) as UntypedFormGroup;
  }

  get projectCategoryGroup(): UntypedFormGroup {
    return (this.form.get('projectCategory')) as UntypedFormGroup;
  }

  get projectCategoryPercentGroup(): UntypedFormGroup {
    return (this.form.get('projectCategoryPercent')) as UntypedFormGroup;
  }

  get projectSummaryGroup(): UntypedFormGroup {
    return (this.form.get('projectSummary')) as UntypedFormGroup;
  }

  get beneficiaryAnalysisGroup(): UntypedFormGroup {
    return (this.form.get('beneficiaryAnalysis')) as UntypedFormGroup;
  }

  get beneficiaryAnalysisIndividualPercentGroup(): UntypedFormGroup {
    return (this.form.get('beneficiaryAnalysisIndividualPercent')) as UntypedFormGroup;
  }

  get projectBudgetGroup(): UntypedFormGroup {
    return (this.form.get('projectBudget')) as UntypedFormGroup;
  }

  get projectComponentsFormArray(): UntypedFormArray {
    return (this.form.get('projectComponents')) as UntypedFormArray;
  }

  get specialExplanationsGroup(): UntypedFormGroup {
    return (this.form.get('specialExplanations')) as UntypedFormGroup;
  }

  get requestTypeField(): UntypedFormControl {
    return (this.basicInfoGroup?.get('requestType')) as UntypedFormControl;
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return (this.basicInfoGroup?.get('oldLicenseFullSerial')) as UntypedFormControl;
  }

  get mainCategoryField(): UntypedFormControl {
    return (this.projectCategoryGroup?.get('domain')) as UntypedFormControl;
  }

  get subCategory1Field(): UntypedFormControl {
    return (this.projectCategoryGroup?.get('firstSubDomain')) as UntypedFormControl;
  }

  get subCategory2Field(): UntypedFormControl {
    return (this.projectCategoryGroup?.get('secondSubDomain')) as UntypedFormControl;
  }

  get firstSDGoalField(): UntypedFormControl {
    return (this.projectCategoryGroup?.get('firstSDGoal')) as UntypedFormControl;
  }

  get secondSDGoalField(): UntypedFormControl {
    return (this.projectCategoryGroup?.get('secondSDGoal')) as UntypedFormControl;
  }

  get thirdSDGoalField(): UntypedFormControl {
    return (this.projectCategoryGroup?.get('thirdSDGoal')) as UntypedFormControl;
  }

  get individualBeneficiarySwitchField(): UntypedFormControl {
    return (this.beneficiaryAnalysisGroup?.get('hasIndividualBeneficiaries')) as UntypedFormControl;
  }

  get familyBeneficiarySwitchField(): UntypedFormControl {
    return (this.beneficiaryAnalysisGroup?.get('hasFamilyBeneficiaries')) as UntypedFormControl;
  }

  get targetedNationalitiesField(): UntypedFormControl {
    return (this.beneficiaryAnalysisGroup?.get('targetedNationalities')) as UntypedFormControl;
  }

  get allNationalitiesField(): UntypedFormControl {
    return (this.beneficiaryAnalysisGroup?.get('allNationalities')) as UntypedFormControl;
  }

  get familyNumberOfTargetedFamiliesField(): UntypedFormControl {
    return (this.beneficiaryAnalysisGroup?.get('beneficiaryFamiliesNumber')) as UntypedFormControl;
  }

  get familyAverageNumberOfPeopleField(): UntypedFormControl {
    return (this.beneficiaryAnalysisGroup?.get('individualsAverageNumber')) as UntypedFormControl;
  }

  get familyAverageAgeGroupField(): UntypedFormControl {
    return (this.beneficiaryAnalysisGroup?.get('ageAverageCategory')) as UntypedFormControl;
  }

  get individualNumberOfDirectBeneficiaryField(): UntypedFormControl {
    return (this.beneficiaryAnalysisGroup?.get('directBeneficiaryNumber')) as UntypedFormControl;
  }

  get individualNumberOfInDirectBeneficiaryField(): UntypedFormControl {
    return (this.beneficiaryAnalysisGroup?.get('indirectBeneficiaryNumber')) as UntypedFormControl;
  }

  get individualSpecialNeedsBeneficiaryField(): UntypedFormControl {
    return (this.beneficiaryAnalysisGroup?.get('handicappedBeneficiaryNumber')) as UntypedFormControl;
  }

  get individual_0To5_Field(): UntypedFormControl {
    return (this.beneficiaryAnalysisIndividualPercentGroup?.get('beneficiaries0to5')) as UntypedFormControl;
  }

  get individual_5To18_Field(): UntypedFormControl {
    return (this.beneficiaryAnalysisIndividualPercentGroup?.get('beneficiaries5to18')) as UntypedFormControl;
  }

  get individual_19To60_Field(): UntypedFormControl {
    return (this.beneficiaryAnalysisIndividualPercentGroup?.get('beneficiaries19to60')) as UntypedFormControl;
  }

  get individual_60Above_Field(): UntypedFormControl {
    return (this.beneficiaryAnalysisIndividualPercentGroup?.get('beneficiariesOver60')) as UntypedFormControl;
  }

  get deductionPercentField(): UntypedFormControl {
    return (this.projectBudgetGroup?.get('deductionPercent')) as UntypedFormControl;
  }

  get projectTotalCostField(): UntypedFormControl {
    return (this.projectBudgetGroup?.get('projectTotalCost')) as UntypedFormControl;
  }

  get adminTotalDeductionCostField(): UntypedFormControl {
    return (this.projectBudgetGroup?.get('administrativeDeductionAmount')) as UntypedFormControl;
  }

  get targetCostField(): UntypedFormControl {
    return (this.projectBudgetGroup?.get('targetAmount')) as UntypedFormControl;
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
    this._handleRequestTypeDependentControls();
    this._handleAllNationalityReadonly();
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

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this.resetForm$.next();
          this.requestTypeField.setValue(requestTypeValue);
        }
        this.requestType$.next(requestTypeValue);

        this._handleRequestTypeDependentControls();

        // if no requestType or (requestType = new)
        // if new record or draft, reset license and its validations
        // also reset the values in model
        if (!requestTypeValue || (requestTypeValue === ServiceRequestTypes.NEW)) {
          if (!this.model?.id || this.model.canCommit()) {
            this.oldLicenseFullSerialField.reset();
            this.oldLicenseFullSerialField.setValidators([]);
            this.setSelectedLicense(undefined, true);

            if (this.model) {
              this.model.licenseNumber = '';
              this.model.licenseDuration = 0;
              this.model.licenseStartDate = '';
            }
          }
        } else {
          this.oldLicenseFullSerialField.setValidators([CustomValidators.required, (control) => {
            return this.selectedLicense && this.selectedLicense?.fullSerial === control.value ? null : {select_license: true};
          }]);
        }
        this.oldLicenseFullSerialField.updateValueAndValidity();
      } else {
        this.requestTypeField.setValue(this.requestType$.value);
      }
    });
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

  private _checkValidFamilyOrIndividualSwitch(): boolean {
    const validFamilyOrIndividual = this.familyBeneficiarySwitchField.value || this.individualBeneficiarySwitchField.value;
    this.validFamilyOrIndividualSwitchMsg = validFamilyOrIndividual ? '&nbsp;' : this.lang.map.at_least_one_field_should_be_filled.change({fields: '(' + this.lang.map.family_beneficiary + ', ' + this.lang.map.individual_beneficiary + ')'});
    return validFamilyOrIndividual;
  }

  updateBeneficiaryValidations(type: 'FAMILY' | 'INDIVIDUAL' | 'BOTH' = 'BOTH', resetValues: boolean = false): void {
    switch (type) {
      case 'FAMILY':
        this._updateFamilyBeneficiaryValidations(resetValues);
        break;
      case 'INDIVIDUAL':
        this._updateIndividualBeneficiaryValidations(resetValues);
        break;
      default:
        this._updateIndividualBeneficiaryValidations(resetValues);
        this._updateFamilyBeneficiaryValidations(resetValues);
    }

    this._touchPercentGroups();
    this._checkValidFamilyOrIndividualSwitch();
  }

  private static _setFieldValidation(fieldOrGroup: (UntypedFormControl | UntypedFormGroup), validations: (ValidatorFn | ValidatorFn[] | null), updateValueAndValidity: boolean = false) {
    fieldOrGroup.setValidators(validations);
    if (updateValueAndValidity) {
      fieldOrGroup.updateValueAndValidity();
    }
  }

  private static _setFieldValue(field: UntypedFormControl, value: any, updateValueAndValidity: boolean = false): void {
    field.setValue(value);
    if (updateValueAndValidity) {
      field.updateValueAndValidity();
    }
  }

  private _updateIndividualBeneficiaryValidations(resetValues: boolean): void {
    let isEnabled = this.individualBeneficiarySwitchField.value,
      validators = isEnabled ? [CustomValidators.required] : [],
      newModel = this._getNewInstance();

    if (resetValues) {
      InternalProjectLicenseComponent._setFieldValue(this.individualNumberOfDirectBeneficiaryField, newModel.directBeneficiaryNumber);
      InternalProjectLicenseComponent._setFieldValue(this.individualNumberOfInDirectBeneficiaryField, newModel.indirectBeneficiaryNumber);
      InternalProjectLicenseComponent._setFieldValue(this.individualSpecialNeedsBeneficiaryField, newModel.handicappedBeneficiaryNumber);
      InternalProjectLicenseComponent._setFieldValue(this.individual_0To5_Field, newModel.beneficiaries0to5);
      InternalProjectLicenseComponent._setFieldValue(this.individual_5To18_Field, newModel.beneficiaries5to18);
      InternalProjectLicenseComponent._setFieldValue(this.individual_19To60_Field, newModel.beneficiaries19to60);
      InternalProjectLicenseComponent._setFieldValue(this.individual_60Above_Field, newModel.beneficiariesOver60);
    }

    InternalProjectLicenseComponent._setFieldValidation(this.individualNumberOfDirectBeneficiaryField, validators.concat([CustomValidators.number, CustomValidators.maxLength(20)]), true);
    InternalProjectLicenseComponent._setFieldValidation(this.individualNumberOfInDirectBeneficiaryField, validators.concat([CustomValidators.number, CustomValidators.maxLength(20)]), true);
    InternalProjectLicenseComponent._setFieldValidation(this.individualSpecialNeedsBeneficiaryField, validators.concat([CustomValidators.number, CustomValidators.maxLength(20)]), true);
    InternalProjectLicenseComponent._setFieldValidation(this.individual_0To5_Field, validators.concat([CustomValidators.decimal(2), Validators.max(100)]), true);
    InternalProjectLicenseComponent._setFieldValidation(this.individual_5To18_Field, validators.concat([CustomValidators.decimal(2), Validators.max(100)]), true);
    InternalProjectLicenseComponent._setFieldValidation(this.individual_19To60_Field, validators.concat([CustomValidators.decimal(2), Validators.max(100)]), true);
    InternalProjectLicenseComponent._setFieldValidation(this.individual_60Above_Field, validators.concat([CustomValidators.decimal(2), Validators.max(100)]), true);

    // update the validators for group
    InternalProjectLicenseComponent._setFieldValidation(this.beneficiaryAnalysisIndividualPercentGroup, this._getGroupPercentageValidations(isEnabled ? 'beneficiaryAnalysisIndividualPercent' : 'NONE'), true);
  }

  private _updateFamilyBeneficiaryValidations(resetValues: boolean): void {
    let isEnabled = this.familyBeneficiarySwitchField.value,
      validators = isEnabled ? [CustomValidators.required] : [],
      newModel = this._getNewInstance();
    if (resetValues) {
      InternalProjectLicenseComponent._setFieldValue(this.familyNumberOfTargetedFamiliesField, newModel.beneficiaryFamiliesNumber);
      InternalProjectLicenseComponent._setFieldValue(this.familyAverageNumberOfPeopleField, newModel.individualsAverageNumber);
      InternalProjectLicenseComponent._setFieldValue(this.familyAverageAgeGroupField, newModel.ageAverageCategory);
    }
    InternalProjectLicenseComponent._setFieldValidation(this.familyNumberOfTargetedFamiliesField, validators.concat([CustomValidators.number, CustomValidators.maxLength(20)]), true);
    InternalProjectLicenseComponent._setFieldValidation(this.familyAverageNumberOfPeopleField, validators.concat([CustomValidators.number, CustomValidators.maxLength(20)]), true);
    InternalProjectLicenseComponent._setFieldValidation(this.familyAverageAgeGroupField, validators.concat([CustomValidators.number, CustomValidators.maxLength(20)]), true);
  }

  private loadSelectedLicenseById(id: string, callback?: any): void {
    if (!id) {
      return;
    }
    this.licenseService.loadInternalProjectLicenseByLicenseId(id)
      .pipe(
        filter(license => !!license),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license, true);

        callback && callback();
      });
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    const value = this.oldLicenseFullSerialField.value && this.oldLicenseFullSerialField.value.trim();
    /*if (!value) {
      this.dialogService.info(this.lang.map.need_license_number_to_search)
      return;
    }*/
    this.licenseSearch$.next(value);
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(exhaustMap(oldLicenseFullSerial => {
        return this.loadLicencesByCriteria({fullSerial: oldLicenseFullSerial})
          .pipe(catchError(() => of([])));
      }))
      .pipe(
        // display message in case there is no returned license
        tap(list => !list.length ? this.dialogService.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the collection if it has value
        filter(result => !!result.length),
        // switch to the dialog ref to use it later and catch the user response
        switchMap(licenses => {
          if (licenses.length === 1) {
            return this.licenseService.validateLicenseByRequestType(this.model!.getCaseType(), this.requestTypeField.value, licenses[0].id)
              .pipe(
                map((data) => {
                  if (!data) {
                    return of(null);
                  }
                  return {selected: licenses[0], details: data};
                }),
                catchError(() => {
                  return of(null);
                })
              );
          } else {
            return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({requestType: this.requestTypeField.value || null})).onAfterClose$;
          }
        }),
        // allow only if the user select license
        filter<{ selected: InternalProjectLicenseResult, details: InternalProjectLicense }, any>
        ((selection): selection is { selected: InternalProjectLicenseResult, details: InternalProjectLicense } => {
          return !!(selection);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((selection) => {
        this.setSelectedLicense(selection.details, false);
      });
  }

  private setSelectedLicense(licenseDetails: InternalProjectLicense | undefined, ignoreUpdateForm: boolean) {
    this.selectedLicense = licenseDetails;
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = (new InternalProjectLicense()).clone(licenseDetails);
      value.requestType = this.requestTypeField.value;
      value.oldLicenseFullSerial = licenseDetails.fullSerial;
      value.oldLicenseId = licenseDetails.id;
      value.oldLicenseSerial = licenseDetails.serial;
      value.documentTitle = '';
      value.fullSerial = null;

      // delete id because license details contains old license id, and we are adding new, so no id is needed
      delete value.id;
      delete value.vsId;
      delete value.serial;

      this._updateForm(value);
    }
  }

  loadLicencesByCriteria(criteria: Partial<InternalProjectLicenseSearchCriteria>): Observable<InternalProjectLicenseResult[]> {
    return this.service.licenseSearch(criteria);
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
    this.sdGoalService.loadAsLookups()
      .subscribe((data) => {
        this.goalsList = data;
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
        return (this.form.get('projectComponents.0')) as UntypedFormArray;
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

        this._updateProjectTotalCost();
        this.updateTotalAdminDeductionAndTargetCost();
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

  addProjectComponent() {
    this.addProjectComponent$.next();
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

  private _updateProjectTotalCost(): void {
    this.projectTotalCostField.setValue(this.model!.getTotalProjectComponentCost(2));
    this.projectTotalCostField.updateValueAndValidity();
  }

  private _updateTotalAdminDeductionCost(): void {
    let adminTotalDeductionCost = this.model!.getAdminDeductionCost(this.deductionPercentField.value!, 2);
    this.adminTotalDeductionCostField.setValue(adminTotalDeductionCost);
    this.adminTotalDeductionCostField.updateValueAndValidity();
  }

  private _updateTargetCost(): void {
    let targetCost = this.model!.getTargetCost(this.deductionPercentField.value!, 2);

    this.targetCostField.setValue(targetCost);
    this.targetCostField.updateValueAndValidity();
  }

  updateTotalAdminDeductionAndTargetCost(): void {
    this._updateTotalAdminDeductionCost();
    this._updateTargetCost();
  }

  private _handleAllNationalityReadonly(): void {
    if (this.employeeService.isInternalUser() || this.isExtendOrCancelRequestType() || this.readonly) {
      this.allNationalitiesField.disable();
    } else {
      this.allNationalitiesField.enable();
    }
  }

  handleAllNationalitiesChange($event?: Event): void {
    // $event is available if user toggle the switch
    if ($event) {
      this.targetedNationalitiesField.setValue([]);
    }
    InternalProjectLicenseComponent._setFieldValidation(this.targetedNationalitiesField, (this.allNationalitiesField.value ? null : [CustomValidators.requiredArray]), true);
    this.targetedNationalitiesField.markAsTouched();
  }

  // noinspection JSUnusedLocalSymbols
  private displayAttachmentsMessage(validAttachments: boolean): void {
    if (!validAttachments) {
      this.dialogService.error(this.lang.map.kindly_check_required_attachments);
      this.tabIndex$.next(this.tabsData.attachments.index);
    }
  }

  searchNgSelect(term: string, item: any): boolean {
    return item.ngSelectSearch(term);
  }
}
