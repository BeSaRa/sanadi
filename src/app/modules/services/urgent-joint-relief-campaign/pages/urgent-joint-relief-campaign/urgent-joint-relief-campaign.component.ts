import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { SaveTypes } from '@enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { UrgentJointReliefCampaign } from '@models/urgent-joint-relief-campaign';
import { UrgentJointReliefCampaignService } from '@services/urgent-joint-relief-campaign.service';
import { Observable } from 'rxjs';
import { OperationTypes } from '@enums/operation-types.enum';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { LangService } from '@services/lang.service';
import { LookupService } from '@services/lookup.service';
import { DialogService } from '@services/dialog.service';
import { ToastService } from '@services/toast.service';
import { EmployeeService } from '@services/employee.service';
import { DatepickerControlsMap, DatepickerOptionsMap, ReadinessStatus, TabMap } from '@app/types/types';
import { DateUtils } from '@helpers/date-utils';
import { FormManager } from '@models/form-manager';
import { CommonStatusEnum } from '@enums/common-status.enum';
import { Lookup } from '@models/lookup';
import { Country } from '@models/country';
import { CountryService } from '@services/country.service';
import { CaseStepName } from '@enums/case-step-name';
import { IMyInputFieldChanged } from '@nodro7/angular-mydatepicker';
import { ParticipantOrganization } from '@models/participant-organization';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { OpenFrom } from '@enums/open-from.enum';
import { ProfileService } from '@services/profile.service';
import { Profile } from '@models/profile';
import { UrgentJoinOrganizationOfficerComponent } from '../../shared/urgent-join-organization-officer/urgent-join-organization-officer.component';
import { take, takeUntil } from 'rxjs/operators';
import { ApprovalDecisions } from '@app/enums/approval-decisions.enum';
import { ITerminateOrganizationTask } from '@app/interfaces/iterminate-organization-task';

@Component({
  selector: 'urgent-joint-relief-campaign',
  templateUrl: './urgent-joint-relief-campaign.component.html',
  styleUrls: ['./urgent-joint-relief-campaign.component.scss']
})
export class UrgentJointReliefCampaignComponent extends EServicesGenericComponent<UrgentJointReliefCampaign, UrgentJointReliefCampaignService> implements AfterViewInit {
  form!: UntypedFormGroup;
  fm!: FormManager;
  organizationUnits: Profile[] = [];
  selectedOrganizationUnits: ParticipantOrganization[] = [];
  selectedOrg!: Profile;

  datepickerControlsMap: DatepickerControlsMap = {};
  datepickerOptionsMap: DatepickerOptionsMap = {
    licenseStartDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
    licenseEndDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' }),
    workStartDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' }),
  };

  organizationDisplayedColumns: string[] = ['arName', 'enName', 'donation', 'workStartDate', 'decision', 'actions'];
  commonStatusEnum = CommonStatusEnum;
  countries: Country[] = [];
  requestTypes: Lookup[] = this.lookupService.listByCategory.RequestTypeNewOnly;
  isExternalUser!: boolean;
  organizationStepNames: string[] = [CaseStepName.ORG_REV, CaseStepName.ORG_REW, CaseStepName.ORG_MNGR_REV];
  @ViewChild('organizationOfficersTab')
  organizationOfficerComponentRef!: UrgentJoinOrganizationOfficerComponent;
  tabsData: TabMap = {
    basicInfo: {
      name: 'basic_info',
      langKey: 'lbl_basic_info',
      index: 0,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => this.basicInfo && this.basicInfo.valid,
    },
    externalUserData: {
      name: 'participant_organizations',
      langKey: 'participant_organizations',
      index: 1,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => this.externalUserData && this.externalUserData.valid,
    },
    organizationOfficer: {
      name: 'organization_officers',
      langKey: 'organization_officers',
      index: 2,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => {
        return (!this.isExternalUser ||
          (!this.organizationOfficerComponentRef ||  this.organizationOfficerComponentRef.offcersList.length > 0
          ));
      },
    },
    specialExplanations: {
      name: 'special_explanations',
      langKey: 'special_explanations',
      index: 3,
      isTouchedOrDirty: () => true,
      show: () => true,
      validStatus: () =>
        this.specialExplanation && this.specialExplanation.valid,
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      index: 4,
      checkTouchedDirty: false,
      isTouchedOrDirty: () => false,
      show: () => true,
      validStatus: () => true,
    },
  };
  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }
  constructor(public lang: LangService,
    public fb: UntypedFormBuilder,
    private cd: ChangeDetectorRef,
    public service: UrgentJointReliefCampaignService,
    private lookupService: LookupService,
    private dialog: DialogService,
    private toast: ToastService,
    private employeeService: EmployeeService,
    private profileService: ProfileService,
    private countryService: CountryService) {
    super();
  }

  ngAfterViewInit() {
    this.cd.detectChanges();
  }

  get basicInfo(): UntypedFormGroup {
    return this.form.get('basicInfo')! as UntypedFormGroup;
  }

  get licenseStartDate(): UntypedFormControl {
    return this.form.get('basicInfo.licenseStartDate')! as UntypedFormControl;
  }

  get licenseEndDate(): UntypedFormControl {
    return this.form.get('basicInfo.licenseEndDate')! as UntypedFormControl;
  }

  get specialExplanation(): UntypedFormGroup {
    return this.form.get('explanation')! as UntypedFormGroup;
  }

  get externalUserData(): UntypedFormGroup {
    return this.form.get('externalUserData')! as UntypedFormGroup;
  }
  get selectedOrganizations(): UntypedFormControl {
    return (this.form.get('selectedOrganizations.participatingOrganizaionList')) as UntypedFormControl;
  }

  _initComponent(): void {
    if (this.operation === OperationTypes.UPDATE) {
      this.datepickerOptionsMap.licenseStartDate = DateUtils.removeDisablePeriod(this.datepickerOptionsMap.licenseStartDate, 'past');
    }
    this.isExternalUser = this.employeeService.isExternalUser();
    this.loadOrgUnits();
    this.loadCountries();
  }

  loadOrgUnits() {
    this.profileService.loadAsLookups().subscribe((list) => {
      this.organizationUnits = list;
    });
  }

  mapOrgUnitsToParticipantOrgUnits(org: any): ParticipantOrganization {
    return new ParticipantOrganization()
      .clone({
        organizationId: org.id,
        arabicName: org.arName,
        englishName: org.enName,
        donation: this.model?.participatingOrganizaionList.find(xx => xx.organizationId == org.id)?.donation,
        workStartDate: this.model?.participatingOrganizaionList.find(xx => xx.organizationId == org.id)?.workStartDate
      });
  }

  // setSelectedOrganizations() {
  //   this.model?.participatingOrganizaionList!.forEach(x => x.managerDecisionInfo = (new Lookup()).clone(x.managerDecisionInfo));
  //   return this.model?.participatingOrganizaionList;
  // }

  loadCountries() {
    this.countryService.loadAsLookups().subscribe((list) => {
      this.countries = list;
    });
  }

  _buildForm(): void {
    const model = new UrgentJointReliefCampaign();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true)),
      externalUserData: this.fb.group(model.buildExternalUserData(true)),
      totalCost: model.buildMainInfo()
    });

    this._buildDatepickerControlsMap();
    this.fm = new FormManager(this.form, this.lang);
  }

  private _buildDatepickerControlsMap() {
    this.datepickerControlsMap = {
      licenseStartDate: this.licenseStartDate,
      licenseEndDate: this.licenseEndDate
    };
  }

  _afterBuildForm(): void {
    this.enableSaveButtonToExternalUsers();
    this.handleReadonly();
  }

  enableSaveButtonToExternalUsers() {
    const stepName = this.model?.taskDetails?.name!;
    if (this.organizationStepNames.includes(stepName) && this.model?.taskDetails.isClaimed()) {
      this.readonly = false;
    }
  }

  _updateForm(model: UrgentJointReliefCampaign | undefined): void {
    if (!model) {
      return;
    }
    this.model = (new UrgentJointReliefCampaign()).clone({ ...this.model, ...model });
    this.form.patchValue({
      basicInfo: this.model?.buildBasicInfo(),
      explanation: this.model?.buildExplanation(),
      externalUserData: this.model?.buildExternalUserData(),
      totalCost: this.model?.buildMainInfo()
    });

    this.selectedOrganizationUnits = this.model?.participatingOrganizaionList as ParticipantOrganization[];
    this.loadLogs();

  }

  _resetForm(): void {
    this.form.reset();
    this.organizationOfficerComponentRef.forceClearComponent();
    this.selectedOrganizationUnits = [];
  }

  _prepareModel(): Observable<UrgentJointReliefCampaign> | UrgentJointReliefCampaign {
    let model = new UrgentJointReliefCampaign().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue()
    });

    if (this.isExternalUser) {
      model = new UrgentJointReliefCampaign().clone({
        ...model,
        ...this.externalUserData.getRawValue()
      });
      model.participatingOrganizaionList.find(x => x.organizationId == this.employeeService.getProfile()!.id)!.donation = this.externalUserData?.get('donation')?.value!;
      model.participatingOrganizaionList.find(x => x.organizationId == this.employeeService.getProfile()!.id)!.workStartDate = this.externalUserData?.get('workStartDate')?.value!;
    } else {
      model.participatingOrganizaionList = this.selectedOrganizationUnits;
    }

    model.organizaionOfficerList = this.organizationOfficerComponentRef.list;
    model.requestType = this.requestTypes[0].lookupKey;
    return model;
  }
  _getNewInstance(): UrgentJointReliefCampaign {
    return new UrgentJointReliefCampaign();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (saveType === SaveTypes.DRAFT) {
      return true;
    }
    if (this.isExternalUser) {
      if (this.externalUserData.invalid) {
        this.dialog.error(this.lang.map.enter_donation_and_start_work_date);
        return false;
      }

      if (this.organizationOfficerComponentRef.list.length < 1) {
        this.dialog.error(this.lang.map.add_organization_officers);
        return false;
      }
    }
    return this.form.valid;
  }

  _afterSave(model: UrgentJointReliefCampaign, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return this.form.valid;
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _launchFail(error: any): void {
  }

  _destroyComponent(): void {
  }

  onChangeSelectedOrganization(val: number) {
    this.selectedOrg = this.organizationUnits.find(x => x.id == val)!;
  }

  addOrganization() {
    if (!this.selectedOrg) {
      this.dialog.error(this.lang.map.please_select_organization_first);
      return;
    }

    if (!this.selectedOrganizationUnits.includes(this.selectedOrganizationUnits.find(x => x.organizationId == this.selectedOrg.id)!)) {
      this.selectedOrganizationUnits = this.selectedOrganizationUnits.concat(this.mapOrgUnitsToParticipantOrgUnits(this.selectedOrg));
    } else {
      this.dialog.error(this.lang.map.selected_item_already_exists);
    }
  }

  removeOrganization(event: MouseEvent, model: ParticipantOrganization) {
    event.preventDefault();
    this.selectedOrganizationUnits = this.selectedOrganizationUnits.filter(x => x.organizationId != model.organizationId);
  }

  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap
    });
  }

  handleReadonly(): void {
    if (this.isExternalUser) {
      this.handleReadonlyForExternalUsers();
    } else {
      this.handleReadonlyForInternalUsers();
    }
  }

  handleReadonlyForExternalUsers() {
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
      this.readonly = false;
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        this.readonly = false;
      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }

  // readonlyIfCharityUserOrManager() {
  //   if (this.employeeService.isCharityManager() && !this.employeeService.isCharityUser()) {
  //     this.readonly = false;
  //   } else if (this.employeeService.isCharityUser()) {
  //     this.readonly = !this.model?.isReturned();
  //   }
  // }

  handleReadonlyForInternalUsers() {
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
      if (this.employeeService.isLicensingChiefManager()) {
        this.readonly = false;
      } else if (this.employeeService.isLicensingUser()) {
        this.readonly = !this.model.isReturned();
      } else if (this.employeeService.isLicensingManager() || this.employeeService.isLicensingGeneralManager()) {
        this.readonly = true;
      }
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isLicensingChiefManager()) {
          this.readonly = false;
        } else if (this.employeeService.isLicensingUser()) {
          this.readonly = !this.model.isReturned();
        } else if (this.employeeService.isLicensingManager() || this.employeeService.isLicensingGeneralManager()) {
          this.readonly = true;
        }
      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft and opened by creator who is licensing user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }
  loadLogs() {
    this.service.actionLogService
      .loadCaseLocation(this.model?.getCaseId())
      .pipe(takeUntil(this.destroy$))
      .subscribe((locations) => {
        this.model!.locations = locations;
      });
  }
  isTerminated(record: ParticipantOrganization){
    return !this.model!.locations.find(location=>location.organizationId === record.organizationId);
  }
  isInitialApproved(){
    return this.model!.getCaseStatus() === CommonCaseStatus.INITIAL_APPROVE;
  }
  get participatingOrgsCanTerminate(): boolean {
    return this.employeeService.isInternalUser() && this.isInitialApproved()
  }
  terminate($event: MouseEvent, record: ParticipantOrganization) {
    $event.preventDefault();
    const {tkiid}= this.model!.locations.find(location=>location.organizationId === record.organizationId)!;
    this.terminateOrganizationTask({
      organizationId:record.organizationId,
      taskId: tkiid!
    })
  }
  terminateOrganizationTask(orgTask: ITerminateOrganizationTask) {
    this.service
      .terminateOrganizationTask(this.model!.id,orgTask.organizationId,orgTask.taskId)
      .pipe(take(1))
      .subscribe((success) => {
        if (success) {
          this.model!.locations = this.model!.locations.filter(
            (location) => location.tkiid !== orgTask.taskId
          );
          this.dialog.success(this.lang.map.terminate_task_success);
          const org= this.model?.participatingOrganizaionList.find(org=>org.organizationId === orgTask.organizationId);
            if(org){
              org.managerDecisionInfo = this.lookupService.listByCategory.ApprovalDecision
              .find(x => x.lookupKey === ApprovalDecisions.TERMINATE)!.convertToAdminResult();
            }
        }
      });
  }
}
