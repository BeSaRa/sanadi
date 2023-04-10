import {ApprovalDecisions} from '@enums/approval-decisions.enum';
import {catchError, map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {ITerminateOrganizationTask} from '@contracts/iterminate-organization-task';
import {Component, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, UntypedFormControl, Validators} from '@angular/forms';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {CoordinationTypes} from '@enums/coordination-types-enum';
import {FileExtensionsEnum} from '@enums/file-extension-mime-types-icons.enum';
import {OperationTypes} from '@enums/operation-types.enum';
import {ProfileTypes} from '@enums/profile-types.enum';
import {SaveTypes} from '@enums/save-types';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {DateUtils} from '@helpers/date-utils';
import {IKeyValue} from '@contracts/i-key-value';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {BuildingAbility} from '@models/building-ability';
import {CoordinationWithOrganizationsRequest} from '@models/coordination-with-organizations-request';
import {DynamicModel} from '@models/dynamic-model';
import {EffectiveCoordinationCapabilities} from '@models/effective-coordination-capabilities';
import {FileNetDocument} from '@models/file-net-document';
import {Lookup} from '@models/lookup';
import {OrganizationOfficer} from '@models/organization-officer';
import {Profile} from '@models/profile';
import {ResearchAndStudies} from '@models/research-and-studies';
import {
  BuildingAbilityComponent
} from '@modules/services/coordination-with-organization-request/shared/building-ability/building-ability.component';
import {
  DynamicTemplatesComponent
} from '@modules/services/coordination-with-organization-request/shared/dynamic-templates/dynamic-templates.component';
import {
  ResearchAndStudiesComponent
} from '@modules/services/coordination-with-organization-request/shared/research-and-studies/research-and-studies.component';
import {
  CoordinationWithOrganizationsRequestService
} from '@services/coordination-with-organizations-request.service';
import {DialogService} from '@services/dialog.service';
import {DynamicModelService} from '@services/dynamic-models.service';
import {EmployeeService} from '@services/employee.service';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {ToastService} from '@services/toast.service';
import {AttachmentsComponent} from '@app/shared/components/attachments/attachments.component';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {DatepickerControlsMap, DatepickerOptionsMap, ReadinessStatus} from '@app/types/types';
import {ExternalUserService} from '@services/external-user.service';
import {ProfileService} from '@services/profile.service';
import {IMyInputFieldChanged} from 'angular-mydatepicker';
import {Observable, of} from 'rxjs';
import {
  OrganizationOfficerComponent
} from '../../shared/organization-officer/organization-officer.component';
import {CoordinationWithOrganizationTemplate} from '@models/corrdination-with-organization-template';
import {
  EffectiveCoordinationCapabilitiesComponent
} from '@modules/services/coordination-with-organization-request/shared/effective-coordination-capabilities/effective-coordination-capabilities.component';
import {
  ParticipantOrganizationComponent
} from '@modules/services/coordination-with-organization-request/shared/participant-organization/participant-organization.component';
import { GlobalSettingsService } from '@app/services/global-settings.service';
import { GlobalSettings } from '@app/models/global-settings';

@Component({
  selector: 'app-coordination-with-organizations-request',
  templateUrl: './coordination-with-organizations-request.component.html',
  styleUrls: ['./coordination-with-organizations-request.component.scss'],
})
export class CoordinationWithOrganizationsRequestComponent extends EServicesGenericComponent<
  CoordinationWithOrganizationsRequest,
  CoordinationWithOrganizationsRequestService
> {
  form!: FormGroup;

  // Participating  Organizations
  domains: Lookup[] = this.lookupService.listByCategory.CoordinationType?.sort(
    (a, b) => a?.lookupKey - b?.lookupKey
  );
  coordinationTypes = CoordinationTypes;
  trainingTypes: Lookup[] =
    this.lookupService.listByCategory.TrainingActivityType?.sort(
      (a, b) => a?.lookupKey - b?.lookupKey
    );
  trainingLanguages: Lookup[] =
    this.lookupService.listByCategory.TrainingLanguage?.sort(
      (a, b) => a?.lookupKey - b?.lookupKey
    );
  trainingWays: Lookup[] = this.lookupService.listByCategory.TrainingWay?.sort(
    (a, b) => a?.lookupKey - b?.lookupKey
  );
  recommendedWays: Lookup[] =
    this.lookupService.listByCategory.RecommendedWay?.sort(
      (a, b) => a?.lookupKey - b?.lookupKey
    );
  organizationWays: Lookup[] =
    this.lookupService.listByCategory.OrganizationWay?.sort(
      (a, b) => a?.lookupKey - b?.lookupKey
    );

  formsList: DynamicModel[] = [];
  isCharityUser!: boolean;
  isInternalUser!: boolean;
  isLicensingUser!: boolean;
  isInitialApproved!: boolean;
  currentUserOrgId!: number | undefined;
  isClaimed: boolean = false;
  datepickerOptionsMap: DatepickerOptionsMap = {};
  datepickerControlsMap: DatepickerControlsMap = {};
  @ViewChild('participantOrganizations')
  participantOrganizationsComponentRef!: ParticipantOrganizationComponent;
  participantOrganizationsTapStatus: ReadinessStatus = 'READY';
  globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
  allowedFileMaxSize: number = this.globalSettings.fileSize

  tabsData: IKeyValue = {
    basicInfo: {
      name: 'basicInfoTab',
      langKey: 'lbl_basic_info' as keyof ILanguageKeys,
      validStatus: () => true,
    },
    participantOrganizations: {
      name: 'participantOrganizations',
      langKey: 'participant_organizations',
      validStatus: () => {
        return (
          this.participantOrganizationsTapStatus === 'READY' &&
          this.model?.participatingOrganizaionList?.length! > 0
        );
      },
    },
    organizationOfficers: {
      name: 'organizationOfficersTap',
      langKey: 'organization_officers',
      validStatus: () => {
        return this.model!.temporaryOrganizaionOfficerList.length > 0;
      },
    },
    buildingAbilities: {
      name: 'buildingAbilitiesTap',
      langKey: 'building_abilities',
      validStatus: () => {
        return this.model!.temporaryBuildingAbilitiesList.length > 0;
      },
    },
    effectiveCoordinationCapabilities: {
      name: 'effectiveCoordinationCapabilitiesTap',
      langKey: 'effective_coordination_capabilities',
      validStatus: () => {
        return (
          this.model!.temporaryEffectiveCoordinationCapabilities.length > 0
        );
      },
    },
    researchAndStudies: {
      name: 'researchAndStudiesTap',
      langKey: 'research_and_studies',
      validStatus: () => {
        return this.model!.temporaryResearchAndStudies.length > 0;
      },
    },
    dynamicTempaltes: {
      name: 'dynamicTemplatesTap',
      langKey: 'lbl_template',
      validStatus: () => {
        return this.model!.temporaryTemplateList.length > 0;
      },
    },
    specialExplanation: {
      name: 'specialExplanationTab',
      langKey: 'special_explanations',
      validStatus: () => true,
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true,
    },
  };
  organizationUnits: Profile[] = [];
  // Organization Officers
  organizationOfficersTabStatus: ReadinessStatus = 'READY';
  organizationUsers: OrganizationOfficer[] = [];
  @ViewChild('organizationOfficersTap')
  organizationOfficersComponentRef!: OrganizationOfficerComponent;
  @ViewChild('buildingAbilityTap')
  buildingAbilityComponentRef!: BuildingAbilityComponent;
  effectiveCoordinationCapabilitiesTabStatus: ReadinessStatus = 'READY';
  @ViewChild('effectiveCoordinationCapabilitiesTap')
  effectiveCoordinationCapabilitiesComponentRef!: EffectiveCoordinationCapabilitiesComponent;
  // Research And Studies
  ResearchAndStudiesTabStatus: ReadinessStatus = 'READY';
  @ViewChild('researchAndStudiesTap')
  ResearchAndStudiesComponentRef!: ResearchAndStudiesComponent;
  @ViewChild('dynamicTemplatesTap')
  DynamicTemplatesComponentRef!: DynamicTemplatesComponent;

  loadAttachments: boolean = false;

  @ViewChild('attachment')
  attachmentsComponentRef!: AttachmentsComponent;

  constructor(
    public lang: LangService,
    private lookupService: LookupService,
    private dialog: DialogService,
    private toast: ToastService,
    private employeeService: EmployeeService,
    private profileService: ProfileService,
    private externalUserService: ExternalUserService,
    public service: CoordinationWithOrganizationsRequestService,
    private dynamicModelService: DynamicModelService,
    public fb: FormBuilder,
    private globalSettingsService: GlobalSettingsService
  ) {
    super();
    this._buildForm();
    this.service.mainModel = new CoordinationWithOrganizationsRequest();
  }

  // building Abilities

  get participatingOrgsCanAdd(): boolean {
    return (
      (this.isLicensingUser && !this.isInitialApproved) ||
      !!(!this.isInitialApproved && this.model?.isClaimed())
    );
  }

  // Effective Coordination Capabilities

  get participatingOrgsCanView(): boolean {
    return (
      this.isInternalUser &&
      (this.model?.organizaionOfficerList?.length! > 0 ||
        this.model?.buildingAbilitiesList?.length! > 0 ||
        this.model?.effectiveCoordinationCapabilities?.length! > 0 ||
        this.model?.researchAndStudies?.length! > 0 ||
        this.model?.templateList?.length! > 0)
    );
  }
  get participatingOrgsCanTerminate(): boolean {
    return this.isInternalUser && this.model!.isApproved;
  }

  get participatingOrgsCanDelete(): boolean {
    if (this.model?.isApproved) return false;
    return (
      (!this.isInitialApproved &&
        this.isInternalUser &&
        (this.model?.isClaimed() ?? false)) ||
      (!this.isInitialApproved && this.isLicensingUser)
    );
  }

  get effectiveCoordinationCapabilities(): FormGroup {
    return this.effectiveCoordinationCapabilities! as FormGroup;
  }

  get licenseStartDate(): UntypedFormControl {
    return this.form.controls.licenseStartDate as UntypedFormControl;
  }

  get licenseEndDate(): UntypedFormControl {
    return this.form.controls.licenseEndDate as UntypedFormControl;
  }

  isCorrectModelToDisplay(type: CoordinationTypes): boolean {
    return this.model?.domain === type;
  }

  _getNewInstance(): CoordinationWithOrganizationsRequest {
    return new CoordinationWithOrganizationsRequest().clone({
      classDescription: '',
      clone(override: Partial<any> | undefined): any {},
      id: undefined,
      createdBy: '',
      createdByGeneralId: 0,
      createdByOUId: 0,
      createdByUserType: 0,
      createdOn: '',
      creatorInfo: undefined,
      lastModified: '',
      lastModifier: '',
      processId: 0,
      ouInfo: undefined,
      search(
        searchText: string,
        searchFieldsName: string | undefined
      ): boolean {
        return false;
      },
      searchFields: undefined,
      fullName: '',
      domain: 0,
      buildingAbilitiesList: [],
      participatingOrganizaionList: [],
      organizaionOfficerList: [],
      effectiveCoordinationCapabilities: [],
      researchAndStudies: [],
      templateList: [],
    });
  }

  isApproved(): boolean {
    return (
      this.model!.temporaryOrganizaionOfficerList?.length > 0 &&
      (this.model!.temporaryBuildingAbilitiesList?.length > 0 ||
        this.model!.temporaryEffectiveCoordinationCapabilities?.length > 0 ||
        this.model!.temporaryResearchAndStudies?.length > 0 ||
        this.model!.temporaryTemplateList?.length > 0)
    );
  }

  _initComponent(): void {
    this.isCharityUser =
      this.employeeService.isCharityUser() ||
      this.employeeService.isCharityManager();
    this.isInternalUser = this.employeeService.isInternalUser();
    this.isLicensingUser = this.employeeService.isLicensingUser();
    this.currentUserOrgId = this.employeeService.getProfile()?.id;
    this.loadOrgUnits();
    this.loadOrgUsers();
    this.loadCoordForms();
    this.datepickerOptionsMap = {
      licenseStartDate: DateUtils.getDatepickerOptions({
        disablePeriod: !this.isLicensingUser ? 'none' : 'past',
      }),
      licenseEndDate: DateUtils.getDatepickerOptions({
        disablePeriod: !this.isLicensingUser ? 'none' : 'past',
      }),
    };
  }
  loadCoordForms() {
    this.dynamicModelService.loadActive().subscribe((forms) => {
      this.formsList = forms;
      this.service.formsList = forms;
    });
  }
  _buildForm(): void {
    this.form = this.fb.group(
      new CoordinationWithOrganizationsRequest().formBuilder(true)
    );
  }

  _afterBuildForm(): void {
    this._buildDatepickerControlsMap();
    if (this.buildingAbilityComponentRef) {
      this.model!.buildingAbilitiesList = this.buildingAbilityComponentRef.list;
    }
    if (this.effectiveCoordinationCapabilitiesComponentRef) {
      this.model!.effectiveCoordinationCapabilities =
        this.effectiveCoordinationCapabilitiesComponentRef.list;
    }
    if (this.ResearchAndStudiesComponentRef) {
      this.model!.researchAndStudies = this.ResearchAndStudiesComponentRef.list;
    }
    if (this.DynamicTemplatesComponentRef) {
      this.model!.templateList = this.DynamicTemplatesComponentRef.list;
    }
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    this.model = this.service.prepareModelBeforeSave(this.model!);
    if (saveType === SaveTypes.DRAFT) {
      return true;
    }
    if (this.form.invalid) {
      this.dialog
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$.pipe(take(1))
        .subscribe(() => {
          this.form.markAllAsTouched();
        });
      return false;
    }
    if (this.model!.participatingOrganizaionList.length < 1) {
      this.dialog.error(this.lang.map.participant_organizations_required);
      return false;
    }
    if (!this.isInternalUser) {
      if (this.organizationOfficersList.length < 1) {
        this.dialog.error(this.lang.map.organization_officers_required);
        return false;
      }

      if (
        this.model.domain === this.coordinationTypes.BuildingAbilities &&
        this.buildingAbilitiesList.length < 1
      ) {
        this.dialog.error(this.lang.map.building_abilities_required);
        return false;
      }

      if (
        this.model.domain ===
          this.coordinationTypes.EffectiveCoordinationCapabilities &&
        this.effectiveCoordinationCapabilitiesList.length < 1
      ) {
        this.dialog.error(this.lang.map.effective_coordination_required);
        return false;
      }

      if (
        this.model.domain === this.coordinationTypes.ResearchAndStudies &&
        this.researchAndStudiesList.length < 1
      ) {
        this.dialog.error(this.lang.map.research_and_studies_required);
        return false;
      }
      if (
        this.model.domain === this.coordinationTypes.Other &&
        this.dynamicTemplatesList.length < 1
      ) {
        this.dialog.error(this.lang.map.dynamic_template_required);
        return false;
      }
    }
    this.disableListsUpdate();
    return of(this.form.valid);
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return true;
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel():
    | CoordinationWithOrganizationsRequest
    | Observable<CoordinationWithOrganizationsRequest> {
    return new CoordinationWithOrganizationsRequest().clone({
      ...this.model,
      ...this.form.value,
    });
  }

  _afterSave(
    model: CoordinationWithOrganizationsRequest,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    this.enableListsUpdate();
    const taskDetails = this.model!.taskDetails;
    this.service.mainModel = this.prepareMainModel(
      this.currentUserOrgId!,
      model
    );
    this.model = this.filterModelByOrgId(this.currentUserOrgId!, model);
    this.model!.approved = this.isApproved();
    this.model!.taskDetails = taskDetails;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(
        this.lang.map.msg_request_has_been_added_successfully.change({
          serial: model.fullSerial,
        })
      );
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {
    console.log(error);
  }

  _launchFail(error: any): void {}

  _destroyComponent(): void {
  }

  _updateForm(model: CoordinationWithOrganizationsRequest | undefined): void {
    if (!model) {
      return;
    }
    if (this.currentUserOrgId) {
      this.service.mainModel = this.prepareMainModel(
        this.currentUserOrgId,
        model
      );
      this.model = this.filterModelByOrgId(this.currentUserOrgId, model)!;
    } else {
      this.model = model;
    }
    this.form = this.fb.group(model.formBuilder(true));

    this.isInitialApproved = this.model?.isInitialApproved();
    this.model.approved = this.isApproved();
    this.model.taskDetails.piid = model.taskDetails.piid;
    this.loadLogs();
  }

  _resetForm(): void {
    this.model = this._getNewInstance();
    this.form.reset();
    this.participantOrganizationsComponentRef.list! = [];
    if (this.organizationOfficersComponentRef) {
      this.organizationOfficersComponentRef.list = [];
    }
    if (this.buildingAbilityComponentRef) {
      this.buildingAbilityComponentRef.list = [];
    }
    if (this.effectiveCoordinationCapabilitiesComponentRef) {
      this.effectiveCoordinationCapabilitiesComponentRef.list = [];
    }
    if (this.ResearchAndStudiesComponentRef) {
      this.ResearchAndStudiesComponentRef.list = [];
    }
    if (this.DynamicTemplatesComponentRef) {
      this.DynamicTemplatesComponentRef.list = [];
    }

    this.loadOrgUnits(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  handleDomainChange() {
    this.templateField.setValidators([]);
    if (this.isOtherDomain) {
      this.templateField.setValidators([Validators.required]);
    }
    this.templateField.reset();
  }
  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  loadOrgUnits(reset = false) {
    this.profileService
      .getProfilesByProfileType([
        ProfileTypes.CHARITY,
        ProfileTypes.NON_PROFIT_ORGANIZATIONS,
        ProfileTypes.INSTITUTION,
      ])
      .pipe(
        map((list) => {
          if (reset) {
            return list;
          }
          if (this.model!.participatingOrganizaionList.length > 0) {
            return list.filter(
              (org) =>
                !this.model?.participatingOrganizaionList.find(
                  (ptOrg) => ptOrg.organizationId === org.id
                )
            );
          }
          return list;
        })
      )

      .subscribe((list) => {
        const propName =
          this.lang.getCurrentLanguage().name === 'English'
            ? 'enName'
            : 'arName';
        this.organizationUnits = list.sort((a, b) =>
          a[propName] < b[propName] ? -1 : 1
        );
      });
  }

  updateParticipantOrgs() {
    this.model!.participatingOrganizaionList =
      this.participantOrganizationsComponentRef.list;
  }

  loadLogs() {
    this.service.actionLogService
      .loadCaseLocation(this.model?.getCaseId())
      .pipe(takeUntil(this.destroy$))
      .subscribe((locations) => {
        this.model!.locations = locations;
      });
  }
  loadOrgUsers() {
    this.externalUserService
      .loadAsLookups()
      // .getByCriteria({ 'profile-id': this.employeeService.getProfile()?.id! })
      .pipe(
        map((users) =>
          users.filter(
            (user) => user.profileId === this.employeeService.getProfile()?.id!
          )
        )
      )
      .pipe(
        map((records) => {
          const list: OrganizationOfficer[] = [];
          records.forEach((record) => {
            list.push(
              new OrganizationOfficer().clone({
                identificationNumber: record.generalUserId?.toString(),
                fullName: record.getName(),
                email: record.email,
                phone: record.phoneNumber,
                extraPhone: record.phoneExtension,
              })
            );
          });
          return list;
        })
      )
      .subscribe((list) => {
        this.service.setOrgUsers = list.sort((a, b) =>
          a.fullName < b.fullName ? -1 : 1
        );
      });
  }

  isEditAllowed(): boolean {
    return (
      !this.model?.id ||
      (!!this.model?.id && this.model.canCommit()) ||
      (this.employeeService.isLicensingUser() && !this.isInitialApproved)
    );
  }

  openDateMenu(ref: any) {
    if (this.isEditAllowed()) {
      ref.toggleCalendar();
    }
  }

  onDateChange(
    event: IMyInputFieldChanged,
    fromFieldName: string,
    toFieldName: string
  ): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: this.datepickerControlsMap,
    });
  }

  openParticipantOrgPopup(orgId: number) {
    const model = this.filterModelByOrgId(orgId);
    this.service.openParticipantOrganizationspopup(orgId, model!);
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
  filterModelByOrgId(
    orgId: number,
    updatedModel: CoordinationWithOrganizationsRequest | null = null
  ) {
    const model = updatedModel
      ? updatedModel
      : new CoordinationWithOrganizationsRequest().clone(this.model);

    model!.temporaryOrganizaionOfficerList! =
      model!.temporaryOrganizaionOfficerList.filter(
        (x) => x.organizationId === orgId
      );
    model!.temporaryBuildingAbilitiesList! =
      model!.temporaryBuildingAbilitiesList.filter(
        (x) => x.organizationId === orgId
      );
    model!.temporaryEffectiveCoordinationCapabilities! =
      model!.temporaryEffectiveCoordinationCapabilities.filter(
        (x) => x.organizationId === orgId
      );
    model!.temporaryResearchAndStudies! =
      model!.temporaryResearchAndStudies.filter(
        (x) => x.organizationId === orgId
      );
    model!.temporaryTemplateList! = model!.temporaryTemplateList.filter(
      (x) => x.profileId === orgId
    );
    model!.organizaionOfficerList! = model!.organizaionOfficerList.filter(
      (x) => x.organizationId === orgId
    );
    model!.buildingAbilitiesList! = model!.buildingAbilitiesList.filter(
      (x) => x.organizationId === orgId
    );
    model!.effectiveCoordinationCapabilities! =
      model!.effectiveCoordinationCapabilities.filter(
        (x) => x.organizationId === orgId
      );
    model!.researchAndStudies! = model!.researchAndStudies.filter(
      (x) => x.organizationId === orgId
    );
    model!.templateList! = model!.templateList.filter(
      (x) => x.profileId === orgId
    );
    return model;
  }

  prepareMainModel(
    orgId: number,
    updatedModel: CoordinationWithOrganizationsRequest | null = null
  ) {
    if (!updatedModel) {
      return new CoordinationWithOrganizationsRequest();
    }
    const model = new CoordinationWithOrganizationsRequest().clone(
      updatedModel
    );

    model!.temporaryOrganizaionOfficerList! =
      model!.temporaryOrganizaionOfficerList.filter(
        (x) => x.organizationId !== orgId
      );
    model!.temporaryBuildingAbilitiesList! =
      model!.temporaryBuildingAbilitiesList.filter(
        (x) => x.organizationId !== orgId
      );
    model!.temporaryEffectiveCoordinationCapabilities! =
      model!.temporaryEffectiveCoordinationCapabilities.filter(
        (x) => x.organizationId !== orgId
      );
    model!.temporaryResearchAndStudies! =
      model!.temporaryResearchAndStudies.filter(
        (x) => x.organizationId !== orgId
      );
    model!.temporaryTemplateList! = model!.temporaryTemplateList.filter(
      (x) => x.profileId !== orgId
    );

    return model;
  }

  enableListsUpdate() {
    if (this.organizationOfficersComponentRef) {
      this.organizationOfficersComponentRef.allowListUpdate = true;
    }
    if (this.buildingAbilityComponentRef) {
      this.buildingAbilityComponentRef.allowListUpdate = true;
    }
    if (this.effectiveCoordinationCapabilitiesComponentRef) {
      this.effectiveCoordinationCapabilitiesComponentRef.allowListUpdate = true;
    }
    if (this.ResearchAndStudiesComponentRef) {
      this.ResearchAndStudiesComponentRef.allowListUpdate = true;
    }
    if (this.DynamicTemplatesComponentRef) {
      this.DynamicTemplatesComponentRef.allowListUpdate = true;
    }
  }

  disableListsUpdate() {
    if (this.organizationOfficersComponentRef) {
      this.organizationOfficersComponentRef.allowListUpdate = false;
    }
    if (this.buildingAbilityComponentRef) {
      this.buildingAbilityComponentRef.allowListUpdate = false;
    }
    if (this.effectiveCoordinationCapabilitiesComponentRef) {
      this.effectiveCoordinationCapabilitiesComponentRef.allowListUpdate =
        false;
    }
    if (this.ResearchAndStudiesComponentRef) {
      this.ResearchAndStudiesComponentRef.allowListUpdate = false;
    }
    if (this.DynamicTemplatesComponentRef) {
      this.DynamicTemplatesComponentRef.allowListUpdate = false;
    }
  }

  isAttachmentReadonly(): boolean {
    if (!this.model?.id) {
      return false;
    }
    let isAllowed = true;
    let caseStatus = this.model.getCaseStatus();
    isAllowed =
      caseStatus !== CommonCaseStatus.CANCELLED &&
      caseStatus !== CommonCaseStatus.FINAL_APPROVE &&
      caseStatus !== CommonCaseStatus.FINAL_REJECTION;

    return !isAllowed;
  }

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }
  allowedExtensions: string[] = [FileExtensionsEnum.PDF];
  loadedAttachments: Record<number, FileNetDocument> = {};

  uploadAttachment(uploader: HTMLInputElement): void {
    if (!this.model!.id) {
      this.dialog.info(
        this.lang.map.this_action_cannot_be_performed_before_saving_the_request
      );
      return;
    }
    uploader.click();
  }

  viewFile(): void {
    if (!this.model!.coordinationReportId) {
      return;
    }
    const file =new FileNetDocument().clone({
      documentTitle: this.lang.map.lbl_final_report,
      description: this.lang.map.lbl_final_report,
    });
    this.service.documentService
      .downloadDocument(this.model!.coordinationReportId)
      .pipe(
        take(1),
        map((model) => this.service.documentService.viewDocument(model, file)),
        catchError(_=>{
          this.model!.coordinationReportId = undefined;
          return this.model!.save();
        })
      )
      .subscribe();
  }
  uploaderFileChange($event: Event): void {
    const input = ($event.target as HTMLInputElement);
    const file = input.files?.item(0);
    const validFile = file ? (this.allowedExtensions.includes(file.name.getExtension())) : true;
    !validFile ? input.value = '' : null;
    if (!validFile) {
      this.dialog.error(this.lang.map.msg_only_those_files_allowed_to_upload.change({files: this.allowedExtensions.join(', ')}));
      input.value = '';
      return;
    }
    const validFileSize = file ? (file.size <= this.allowedFileMaxSize * 1000 * 1024) : true;
    !validFileSize ? input.value = '' : null;
    if (!validFileSize) {
      this.dialog.error(this.lang.map.msg_only_this_file_size_or_less_allowed_to_upload.change({size: this.allowedFileMaxSize}));
      input.value = '';
      return;
    }
    of(null)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(_ => {
          if (this.model && this.model.coordinationReportId && this.model.coordinationReportVSId) {
            return this._updateAttachmentFile(input.files!);
          } else {
            return this._createAttachmentFile(input.files!);
          }
        })
      ).subscribe((attachment) => {
      input.value = '';
      this._afterSaveAttachmentFile(attachment, 'update');
    });


    // const input = $event.target as HTMLInputElement;
    // const file = input.files?.item(0);
    // const validFile = file ? file.type === 'application/pdf' : true;
    // !validFile ? (input.value = '') : null;
    // if (!validFile) {
    //   this.dialog.error(
    //     this.lang.map.msg_only_those_files_allowed_to_upload.change({
    //       files: this.allowedExtensions.join(','),
    //     })
    //   );
    //   input.value = '';
    //   return;
    // }
    // const deleteFirst$ = this.model?.coordinationReportId
    //   ? this.service.documentService.deleteDocument(
    //       this.model.coordinationReportId
    //     ).pipe(
    //       take(1),
    //       catchError(_=>of(null))
    //     )
    //   : of(null);
    // of(null)
    //   .pipe(switchMap((_) => deleteFirst$))
    //   .pipe(
    //     take(1),
    //     switchMap((_) => {
    //       return this.service.documentService.addSingleDocument(
    //         this.model!.id,
    //         new FileNetDocument().clone({
    //           documentTitle: this.lang.map.lbl_final_report,
    //           description: this.lang.map.lbl_final_report,
    //           attachmentTypeId: -1,
    //           required: false,
    //           files: input.files!,
    //           isPublished: false,
    //         })
    //       );
    //     }),
    //     concatMap((attachment) => {
    //       this.model!.coordinationReportId = attachment.id;
    //       this.model!.coordinationReportVSId = attachment.vsId;
    //       return this.model!.save()
    //       .pipe(tap((model)=>{
    //         this.model!.participatingOrganizaionList = model.participatingOrganizaionList;
    //       }))

    //     }),

    //   )
    //   .subscribe(_ => {
    //     input.value = '';
    //     this.toast.success(this.lang.map.files_have_been_uploaded_successfully);

    //   });
  }
  private _createAttachmentFile(filesList: FileList | undefined): Observable<FileNetDocument> {
    return this.service.documentService
      .addSingleDocument(this.model!.getCaseId(), (new FileNetDocument()).clone({
        documentTitle: this.lang.map.lbl_final_report,
        description: this.lang.map.lbl_final_report,
        attachmentTypeId: -1,
        required: false,
        isPublished: false,
        files: filesList
    }));
  }
  private _updateAttachmentFile(filesList: FileList | undefined): Observable<FileNetDocument> {
    const newData = (new FileNetDocument()).clone({
      id: this.model!.coordinationReportId!,
      vsId: this.model!.coordinationReportVSId,
      documentTitle: this.lang.map.lbl_final_report,
      description: this.lang.map.lbl_final_report,
      attachmentTypeId: -1,
      required: false,
      isPublished: false,
      files: filesList,
    })

    return this.service.documentService.updateSingleDocument(this.model!.getCaseId()!, newData);
  }
  private _afterSaveAttachmentFile(attachment: FileNetDocument, attachmentOperation: 'add' | 'update') {
    this.model!.coordinationReportId = attachment.id;
    this.model!.coordinationReportVSId = attachment.vsId;
          return this.model!.save()
          .pipe(tap((model)=>{
            this.model!.participatingOrganizaionList = model.participatingOrganizaionList;
          })).subscribe(()=>{
            this.toast.success(this.lang.map.files_have_been_uploaded_successfully);

          })

  }

  private _buildDatepickerControlsMap(): void {
    this.datepickerControlsMap = {
      licenseStartDate: this.licenseStartDate,
      licenseEndDate: this.licenseEndDate,
    };
  }

  get isOtherDomain() {
    return this.domainField.value == CoordinationTypes.Other;
  }
  get domainField() {
    return this.form.get('domain') as UntypedFormControl;
  }
  get templateField() {
    return this.form.get('processId') as UntypedFormControl;
  }

  get organizationOfficersList(): OrganizationOfficer[] | [] {
    if (this.isInternalUser) return this.model?.organizaionOfficerList ?? [];
    return this.model?.temporaryOrganizaionOfficerList ?? [];
  }

  get buildingAbilitiesList(): BuildingAbility[] | [] {
    if (this.isInternalUser) return this.model?.buildingAbilitiesList ?? [];
    return this.model?.temporaryBuildingAbilitiesList ?? [];
  }
  get effectiveCoordinationCapabilitiesList():
    | EffectiveCoordinationCapabilities[]
    | [] {
    if (this.isInternalUser)
      return this.model?.effectiveCoordinationCapabilities ?? [];
    return this.model?.temporaryEffectiveCoordinationCapabilities ?? [];
  }
  get researchAndStudiesList(): ResearchAndStudies[] | [] {
    if (this.isInternalUser) return this.model?.researchAndStudies ?? [];
    return this.model?.temporaryResearchAndStudies ?? [];
  }
  get dynamicTemplatesList(): CoordinationWithOrganizationTemplate[] | [] {
    if (this.isInternalUser) return this.model?.templateList ?? [];
    return this.model?.temporaryTemplateList ?? [];
  }
}
