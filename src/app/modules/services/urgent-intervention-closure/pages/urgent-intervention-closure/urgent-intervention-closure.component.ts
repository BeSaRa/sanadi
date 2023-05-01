import {AfterViewInit, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {LookupService} from '@services/lookup.service';
import {EmployeeService} from '@services/employee.service';
import {LicenseService} from '@services/license.service';
import {Observable, of, Subject} from 'rxjs';
import {UrgentInterventionClosure} from '@models/urgent-intervention-closure';
import {UrgentInterventionClosureService} from '@services/urgent-intervention-closure.service';
import {SaveTypes} from '@enums/save-types';
import {OperationTypes} from '@enums/operation-types.enum';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {ReadinessStatus, TabMap} from '@app/types/types';
import {ServiceRequestTypes} from '@enums/service-request-types';
import {CommonUtils} from '@helpers/common-utils';
import {OpenFrom} from '@enums/open-from.enum';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {Lookup} from '@models/lookup';
import {
  InterventionImplementingAgencyListComponent
} from '@modules/services/shared-services/components/intervention-implementing-agency-list/intervention-implementing-agency-list.component';
import {
  InterventionRegionListComponent
} from '@modules/services/shared-services/components/intervention-region-list/intervention-region-list.component';
import {
  InterventionFieldListComponent
} from '@modules/services/shared-services/components/intervention-field-list/intervention-field-list.component';
import {catchError, exhaustMap, filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {CountryService} from '@services/country.service';
import {Country} from '@models/country';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {StageListComponent} from '@modules/services/urgent-intervention-closure/pages/urgent-intervention-closure/components/stage-list/stage-list.component';
import {CustomValidators} from '@app/validators/custom-validators';
import {ResultListComponent} from '@modules/services/urgent-intervention-closure/pages/urgent-intervention-closure/components/result-list/result-list.component';
import {
  ImplementationEvaluationListComponent
} from '@modules/services/urgent-intervention-closure/pages/urgent-intervention-closure/components/implementation-evaluation-list/implementation-evaluation-list.component';
import {UrgentInterventionAnnouncementResult} from '@models/urgent-intervention-announcement-result';
import {
  BestPracticesListComponent
} from '@modules/services/urgent-intervention-closure/pages/urgent-intervention-closure/components/best-practices-list/best-practices-list.component';
import {Localization} from '@models/localization';
import {UserClickOn} from '@enums/user-click-on.enum';

@Component({
  selector: 'urgent-intervention-closure',
  templateUrl: './urgent-intervention-closure.component.html',
  styleUrls: ['./urgent-intervention-closure.component.scss']
})
export class UrgentInterventionClosureComponent extends EServicesGenericComponent<UrgentInterventionClosure, UrgentInterventionClosureService> implements AfterViewInit {

  constructor(public lang: LangService,
              private cd: ChangeDetectorRef,
              private toastService: ToastService,
              private dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public service: UrgentInterventionClosureService,
              private lookupService: LookupService,
              public employeeService: EmployeeService,
              private countryService: CountryService,
              private licenseService: LicenseService) {
    super();
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  form!: UntypedFormGroup;
  loadAttachments: boolean = false;
  requestTypesList: Lookup[] = this.lookupService.listByCategory.RequestTypeNewOnly;
  countriesList: Country[] = [];

  licenseSearch$: Subject<string> = new Subject<string>();
  selectedLicense?: UrgentInterventionClosure;

  tabsData: TabMap = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info',
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => this.basicInfoTab && this.basicInfoTab.valid
    },
    beneficiaryAnalysis: {
      name: 'beneficiaryAnalysisTab',
      langKey: 'beneficiary_analysis',
      index: 1,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return this.beneficiaryGroup && this.beneficiaryGroup.valid && this.beneficiaryByAgeGroup && this.beneficiaryByAgeGroup.valid;
      }
    },
    entities: {
      name: 'entitiesTab',
      langKey: 'entities',
      index: 2,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () => {
        return !this.implementingAgencyListComponentRef || (this.entitiesTabStatus === 'READY' && this.implementingAgencyListComponentRef.list.length > 0);
      }
    },
    interventionAreas: {
      name: 'interventionAreasTab',
      langKey: 'intervention_areas',
      index: 3,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return !this.interventionRegionListComponentRef || (this.interventionAreasTabStatus === 'READY' && this.interventionRegionListComponentRef.list.length > 0);
      }
    },
    interventionFields: {
      name: 'interventionFieldsTab',
      langKey: 'intervention_fields',
      index: 4,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return !this.interventionFieldListComponentRef || (this.interventionFieldsTabStatus === 'READY' && this.interventionFieldListComponentRef.list.length > 0);
      }
    },
    phasesAndOutcomes: {
      name: 'phasesAndOutcomesTab',
      langKey: 'phases_and_outcomes',
      index: 5,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return !this.stageListComponentRef || (this.phasesAndOutcomesTabStatus === 'READY' && this.stageListComponentRef.list.length > 0 && this.stageListComponentRef.totalInterventionCost > 0);
      }
    },
    outputAndImpactAnalysis: {
      name: 'outputAndImpactAnalysisTab',
      langKey: 'output_and_impact_analysis',
      index: 6,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return !this.resultListComponentRef || (this.outputAndImpactAnalysisTabStatus === 'READY' && this.resultListComponentRef.list.length > 0);
      }
    },
    implementationEvaluation: {
      name: 'implementationEvaluationTab',
      langKey: 'implementation_evaluation',
      index: 7,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return !this.implementationEvaluationListComponentRef || (this.implementationEvaluationTabStatus === 'READY' && this.implementationEvaluationListComponentRef.list.length > 0);
      }
    },
    bestPractices: {
      name: 'bestPracticesTab',
      langKey: 'best_practices',
      index: 8,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return !this.bestPracticesListComponentRef || this.bestPracticesListComponentRef.list.length > 0;
      }
    },
    lessonsLearnt: {
      name: 'lessonsLearntTab',
      langKey: 'lessons_learnt',
      index: 9,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return !this.lessonsLearntListComponentRef || (this.lessonsLearntTabStatus === 'READY' && this.lessonsLearntListComponentRef.list.length > 0);
      }
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 10,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true
    }
  };
  tabIndex$: Subject<number> = new Subject<number>();

  @ViewChild('implementingAgencyListComponent') implementingAgencyListComponentRef!: InterventionImplementingAgencyListComponent;
  @ViewChild('interventionRegionListComponent') interventionRegionListComponentRef!: InterventionRegionListComponent;
  @ViewChild('interventionFieldListComponent') interventionFieldListComponentRef!: InterventionFieldListComponent;
  @ViewChild('stageListComponent') stageListComponentRef!: StageListComponent;
  @ViewChild('resultListComponent') resultListComponentRef!: ResultListComponent;
  @ViewChild('implementationEvaluationListComponent') implementationEvaluationListComponentRef!: ImplementationEvaluationListComponent;
  @ViewChild('bestPracticesListComponent') bestPracticesListComponentRef!: BestPracticesListComponent;
  @ViewChild('lessonsLearntListComponent') lessonsLearntListComponentRef!: BestPracticesListComponent;

  entitiesTabStatus: ReadinessStatus = 'READY';
  interventionAreasTabStatus: ReadinessStatus = 'READY';
  interventionFieldsTabStatus: ReadinessStatus = 'READY';
  phasesAndOutcomesTabStatus: ReadinessStatus = 'READY';
  outputAndImpactAnalysisTabStatus: ReadinessStatus = 'READY';
  implementationEvaluationTabStatus: ReadinessStatus = 'READY';
  lessonsLearntTabStatus: ReadinessStatus = 'READY';

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
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

  _initComponent(): void {
    this.loadCountries();
    this.listenToLicenseSearch();
  }

  _buildForm(): void {
    let objUrgentInterventionClosure = this._getNewInstance();
    this.form = this.fb.group({
      basicInfo: this.fb.group(objUrgentInterventionClosure.getBasicFormFields(true)),
      beneficiary: this.fb.group(objUrgentInterventionClosure.getBeneficiaryFields(true)),
      beneficiaryByAge: this.fb.group(objUrgentInterventionClosure.getBeneficiaryByAgeFields(true)),
    });
  }

  _afterBuildForm(): void {
    this.handleReadonly();
    if(!this.model?.id) {
      this._setDefaultValues();
    }
    if (this.fromDialog) {
      this.loadSelectedLicenseById(this.model!.oldLicenseId, () => {
        this.oldLicenseFullSerialField.updateValueAndValidity();
      });
    }
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toastService.success(this.lang.map.request_has_been_sent_successfully);
  }

  private _updateModelAfterSave(model: UrgentInterventionClosure): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }

  _afterSave(model: UrgentInterventionClosure, saveType: SaveTypes, operation: OperationTypes): void {
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

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.selectedLicense) {
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
        // if total intervention cost is 0, mark it invalid
        if (!this.stageListComponentRef || !CommonUtils.isValidValue(this.stageListComponentRef.totalInterventionCost) || this.stageListComponentRef.totalInterventionCost === 0) {
          this.toastService.error(this.lang.map.err_invalid_total_intervention_cost_x.change({value: this.stageListComponentRef.totalInterventionCost || 0}));
          return false;
        }
        return true;
      }
    }
  }

  _destroyComponent(): void {
  }

  _getNewInstance(): UrgentInterventionClosure {
    return new UrgentInterventionClosure().clone();
  }

  _launchFail(error: any): void {
    console.log('problem in launch');
  }

  _prepareModel(): Observable<UrgentInterventionClosure> | UrgentInterventionClosure {
    return new UrgentInterventionClosure().clone({
      ...this.model,
      ...this.basicInfoTab.getRawValue(),
      ...this.beneficiaryGroup.getRawValue(),
      ...this.beneficiaryByAgeGroup.getRawValue(),
      interventionFieldList: this.interventionFieldListComponentRef.list,
      interventionRegionList: this.interventionRegionListComponentRef.list,
      implementingAgencyList: this.implementingAgencyListComponentRef.list,
      stageList: this.stageListComponentRef.list,
      resultList: this.resultListComponentRef.list,
      officeEvaluationList: this.implementationEvaluationListComponentRef.list,
      bestPracticesList: this.bestPracticesListComponentRef.list,
      lessonsLearnedList: this.lessonsLearntListComponentRef.list,
      interventionTotalCost: this.stageListComponentRef.totalInterventionCost
    });
  }

  private _disableDefaults() {
    [this.executionCountryField, this.executionRegionField, this.beneficiaryCountryField, this.beneficiaryRegionField, this.descriptionField].map(x => x.disable());
  }
  private _setDefaultZeros() {
    Object.keys(this.beneficiaryGroup.controls).forEach(key => {
      this.beneficiaryGroup.get(key)?.setValue(0);
    });
    Object.keys(this.beneficiaryByAgeGroup.controls).forEach(key => {
      this.beneficiaryByAgeGroup.get(key)?.setValue(0);
    });
    this.beneficiaryGroup.updateValueAndValidity();
    this.beneficiaryByAgeGroup.updateValueAndValidity();
  }

  _setDefaultValues(): void {
    this.requestTypeField.setValue(ServiceRequestTypes.NEW);
    this.handleRequestTypeChange(ServiceRequestTypes.NEW, false);
    this._setDefaultZeros();
    this._disableDefaults();
    this._updateBeneficiaryByAgeGroupValidation();
  }

  private _getBeneficiaryByAgeFieldNames(): string[] {
    return [
      'beneficiaries0to5',
      'beneficiaries5to18',
      'beneficiaries19to60',
      'beneficiariesOver60'
    ];
  }

  private _getBeneficiaryByAgeFieldLabels(): Localization[] {
    return [
      this.lang.getLocalByKey('number_of_0_to_5'),
      this.lang.getLocalByKey('number_of_5_to_18'),
      this.lang.getLocalByKey('number_of_19_to_60'),
      this.lang.getLocalByKey('number_of_above_60')
    ];
  }

  private _updateBeneficiaryByAgeGroupValidation(): void {
    let ageGroupValidations = CustomValidators.validateSum(this._getTotalDirectBeneficiaries(), 0, this._getBeneficiaryByAgeFieldNames(), this._getBeneficiaryByAgeFieldLabels());
    this.beneficiaryByAgeGroup.clearValidators();
    this.beneficiaryByAgeGroup.setValidators(ageGroupValidations);
    this.beneficiaryByAgeGroup.updateValueAndValidity();
    this.beneficiaryByAgeGroup.markAsTouched();
    this.beneficiaryByAgeGroup.markAsPristine();
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this.setSelectedLicense(undefined, true);
    this._setDefaultValues();
  }

  _saveFail(error: any): void {
    console.log('problem in save');
  }

  _updateForm(model: UrgentInterventionClosure | undefined): void {
    this.model = model;
    if (!model) {
      this.cd.detectChanges();
      return;
    }
    // patch the form here
    this.form.patchValue({
      basicInfo: model.getBasicFormFields(),
      beneficiary: model.getBeneficiaryFields(),
      beneficiaryByAge: model.getBeneficiaryByAgeFields()
    });
    this.handleRequestTypeChange(model.requestType, false);
    this.cd.detectChanges();
  }

  handleChangeDirectMaleBeneficiaries($event: Event): void {
    if ($event) {
      this._updateBeneficiaryByAgeGroupValidation();
    }
  }

  handleChangeDirectFemaleBeneficiaries($event: Event): void {
    if ($event) {
      this._updateBeneficiaryByAgeGroupValidation();
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

        this._handleLicenseValidationsByRequestType();
      } else {
        this.requestTypeField.setValue(this.requestType$.value);
      }
    });
  }

  private _handleLicenseValidationsByRequestType(): void {
    // set validators to empty
    this.oldLicenseFullSerialField?.setValidators([]);

    // if no requestType
    // if new record or draft, reset license and its validations
    // also reset the values in model
    if (!CommonUtils.isValidValue(this.requestTypeField?.value)) {
      if (!this.model?.id || this.model.canCommit()) {
        this.oldLicenseFullSerialField?.setValue(null);
        this.setSelectedLicense(undefined, true);

        if (this.model) {
          this.model.licenseNumber = '';
          this.model.licenseDuration = 0;
          this.model.licenseStartDate = '';
        }
      }
    } else {
      this.oldLicenseFullSerialField?.setValidators([CustomValidators.required, CustomValidators.maxLength(250), (control) => {
        return this.selectedLicense && this.selectedLicense?.fullSerial === control.value ? null : {select_license: true};
      }]);
    }
    this.oldLicenseFullSerialField.updateValueAndValidity();
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

  isEditRequestTypeAllowed(): boolean {
    return false; // request type is a fixed value (NEW)

    /*// allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());*/
  }

  isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    // noinspection UnnecessaryLocalVariableJS
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return isAllowed;// && CommonUtils.isValidValue(this.requestTypeField.value) && this.requestTypeField.value !== ServiceRequestTypes.NEW;
  }

  private loadCountries(): void {
    this.countryService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countriesList = countries);
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

  handleChangeExecutionCountry(country: number, userInteraction: boolean) {
    if (userInteraction) {
      this.implementingAgencyListComponentRef.forceClearComponent();
    }
  }

  licenseSearch($event?: Event): void {
    $event?.preventDefault();
    const value = this.oldLicenseFullSerialField.value && this.oldLicenseFullSerialField.value.trim();
    this.licenseSearch$.next(value);
  }

  private loadSelectedLicenseById(id: string, callback?: any): void {
    if (!id) {
      return;
    }
    this.licenseService.loadUrgentInterventionAnnouncementByLicenseId(id)
      .pipe(
        filter(license => !!license),
        takeUntil(this.destroy$)
      )
      .subscribe((license) => {
        this.setSelectedLicense(license.convertToUrgentInterventionClosure(), true);

        callback && callback();
      });
  }

  private listenToLicenseSearch() {
    this.licenseSearch$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap(oldLicenseFullSerial => {
          return this.service.licenseSearchUrgentInterventionAnnouncement({fullSerial: oldLicenseFullSerial})
            .pipe(catchError(() => of([])));
        }))
      .pipe(
        // display message in case there is no returned license
        tap(list => !list.length ? this.dialogService.info(this.lang.map.no_result_for_your_search_criteria) : null),
        // allow only the result if it has value
        filter(result => !!result.length)
      ).pipe(
      exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      })
    ).pipe(filter((info): info is UrgentInterventionClosure => !!info))
      .subscribe((selection) => {
        this.setSelectedLicense(selection, false);
      });
  }

  setSelectedLicense(licenseDetails: UrgentInterventionClosure | undefined, ignoreUpdateForm: boolean) {
    this.selectedLicense = licenseDetails;
    // update form fields if i have license
    if (licenseDetails && !ignoreUpdateForm) {
      let value: any = (new UrgentInterventionClosure()).clone({...licenseDetails});
      value.requestType = this.requestTypeField.value;
      value.oldLicenseFullSerial = licenseDetails.fullSerial;
      value.oldLicenseId = licenseDetails.id;
      value.oldLicenseSerial = licenseDetails.serial;
      value.documentTitle = '';
      value.fullSerial = null;
      value.description = '';
      value.createdOn = '';
      value.classDescription = '';

      // delete id because license details contains old license id, and we are adding new, so no id is needed
      delete value.id;
      delete value.vsId;
      delete value.serial;

      this._updateForm(value);
      this.yearField.addValidators(Validators.min(licenseDetails.year || new Date().getFullYear()));
      this.yearField.updateValueAndValidity();
    }
  }

  private validateSingleLicense(license: UrgentInterventionAnnouncementResult): Observable<undefined | UrgentInterventionClosure> {
    return this.licenseService.validateLicenseByRequestType<UrgentInterventionClosure>(this.model!.caseType, this.requestTypeField.value, license.id) as Observable<undefined | UrgentInterventionClosure>;
  }

  private openSelectLicense(licenses: UrgentInterventionAnnouncementResult[]): Observable<undefined | UrgentInterventionClosure> {
    return this.licenseService.openSelectLicenseDialog(licenses, this.model?.clone({requestType: this.requestTypeField.value || null}), true, this.service.selectLicenseDisplayColumnsReport)
      .onAfterClose$
      .pipe(map((result: ({ selected: UrgentInterventionClosure, details: UrgentInterventionClosure } | undefined)) => result ? result.details : result));
  }

  get basicInfoTab(): UntypedFormGroup {
    return (this.form.get('basicInfo')) as UntypedFormGroup;
  }

  get requestTypeField(): UntypedFormControl {
    return this.basicInfoTab.get('requestType') as UntypedFormControl;
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return this.basicInfoTab.get('oldLicenseFullSerial') as UntypedFormControl;
  }

  get yearField(): UntypedFormControl {
    return this.basicInfoTab.get('year') as UntypedFormControl;
  }

  get beneficiaryCountryField(): UntypedFormControl {
    return this.basicInfoTab.get('beneficiaryCountry') as UntypedFormControl;
  }

  get beneficiaryRegionField(): UntypedFormControl {
    return this.basicInfoTab.get('beneficiaryRegion') as UntypedFormControl;
  }

  get executionCountryField(): UntypedFormControl {
    return this.basicInfoTab.get('executionCountry') as UntypedFormControl;
  }

  get executionRegionField(): UntypedFormControl {
    return this.basicInfoTab.get('executionRegion') as UntypedFormControl;
  }

  get descriptionField(): UntypedFormControl {
    return this.basicInfoTab.get('projectDescription') as UntypedFormControl;
  }

  get beneficiaryGroup(): UntypedFormGroup {
    return this.form.get('beneficiary') as UntypedFormGroup;
  }

  get directMaleBeneficiariesField(): UntypedFormControl {
    return this.beneficiaryGroup.get('directMaleBeneficiaries') as UntypedFormControl;
  }

  get directFemaleBeneficiariesField(): UntypedFormControl {
    return this.beneficiaryGroup.get('directFemaleBeneficiaries') as UntypedFormControl;
  }

  private _getTotalDirectBeneficiaries(): number {
    let male = (this.directMaleBeneficiariesField ? this.directMaleBeneficiariesField.value : 0),
      female = (this.directFemaleBeneficiariesField ? this.directFemaleBeneficiariesField.value : 0);
    return (Number(male) + Number(female)) ?? 0;
  }

  get beneficiaryByAgeGroup(): UntypedFormGroup {
    return this.form.get('beneficiaryByAge') as UntypedFormGroup;
  }
}
