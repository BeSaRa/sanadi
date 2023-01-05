import { ActionLogService } from '@app/services/action-log.service';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { CoordinationTypes } from '@app/enums/coordination-types-enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { DateUtils } from '@app/helpers/date-utils';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { AdminResult } from '@app/models/admin-result';
import { BuildingAbility } from '@app/models/building-ability';
import { CoordinationWithOrganizationsRequest } from '@app/models/coordination-with-organizations-request';
import { DynamicModel } from '@app/models/dynamic-model';
import { EffectiveCoordinationCapabilities } from '@app/models/effective-coordination-capabilities';
import { Lookup } from '@app/models/lookup';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { Profile } from '@app/models/profile';
import { ResearchAndStudies } from '@app/models/research-and-studies';
import { BuildingAbilityComponent } from '@app/modules/e-services-main/shared/building-ability/building-ability.component';
import { DynamicTemplatesComponent } from '@app/modules/e-services-main/shared/dynamic-templates/dynamic-templates.component';
import { ResearchAndStudiesComponent } from '@app/modules/e-services-main/shared/research-and-studies/research-and-studies.component';
import { CoordinationWithOrganizationsRequestService } from '@app/services/coordination-with-organizations-request.service';
import { DialogService } from '@app/services/dialog.service';
import { DynamicModelService } from '@app/services/dynamic-models.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { AttachmentsComponent } from '@app/shared/components/attachments/attachments.component';
import { TabComponent } from '@app/shared/components/tab/tab.component';
import { DatepickerControlsMap, DatepickerOptionsMap, ReadinessStatus } from '@app/types/types';
import { ExternalUserService } from '@services/external-user.service';
import { ProfileService } from '@services/profile.service';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { Observable, of } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { OrganizationOfficerComponent } from '../../../e-services-main/shared/organization-officer/organization-officer.component';
import { CoordinationWithOrganizationTemplate } from './../../../../models/corrdination-with-organization-template';
import {
  EffectiveCoordinationCapabilitiesComponent
} from './../../../e-services-main/shared/effective-coordination-capabilities/effective-coordination-capabilities.component';
import {
  ParticipantOrganizationComponent
} from './../../../e-services-main/shared/participant-organization/participant-organization.component';
import { TaskAdminResult } from '@app/models/task-admin-result';
@Component({
  selector: 'app-coordination-with-organizations-request',
  templateUrl: './coordination-with-organizations-request.component.html',
  styleUrls: ['./coordination-with-organizations-request.component.scss'],
})
export class CoordinationWithOrganizationsRequestComponent extends EServicesGenericComponent<CoordinationWithOrganizationsRequest,
CoordinationWithOrganizationsRequestService> {
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
        return this.model!.temporaryEffectiveCoordinationCapabilities.length > 0;
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
  @ViewChild('buildingAbilityTap') buildingAbilityComponentRef!: BuildingAbilityComponent;
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
    if(this.model?.isApproved) return false;
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
      clone(override: Partial<any> | undefined): any {
      },
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
      search(searchText: string, searchFieldsName: string | undefined): boolean {
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
      templateList: []
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
    this.isCharityUser = this.employeeService.isCharityUser() || this.employeeService.isCharityManager();
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
    })
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
    if(!this.isInternalUser){
      if(this.organizationOfficersList.length < 1){
        this.dialog.error(this.lang.map.organization_officers_required);
        return false;
      }

      if(this.model.domain === this.coordinationTypes.BuildingAbilities &&
        this.buildingAbilitiesList.length < 1){
          this.dialog.error(this.lang.map.building_abilities_required);
          return false;
        }

     if(this.model.domain === this.coordinationTypes.EffectiveCoordinationCapabilities &&
        this.effectiveCoordinationCapabilitiesList.length < 1){
            this.dialog.error(this.lang.map.effective_coordination_required);
            return false;
        }

      if(this.model.domain === this.coordinationTypes.ResearchAndStudies &&
        this.researchAndStudiesList.length < 1){
          this.dialog.error(this.lang.map.research_and_studies_required);
          return false;
        }
      if(this.model.domain === this.coordinationTypes.Other &&
          this.dynamicTemplatesList.length < 1){
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
    this.service.mainModel = this.prepareMainModel(this.currentUserOrgId!, model);
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

  _launchFail(error: any): void {
  }

  _destroyComponent(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  _updateForm(model: CoordinationWithOrganizationsRequest | undefined): void {
    if (!model) {
      return;
    }
    if (this.currentUserOrgId) {
      this.service.mainModel = this.prepareMainModel(this.currentUserOrgId, model);
      this.model = this.filterModelByOrgId(this.currentUserOrgId, model)!;
    } else {
      this.model = model;
    }
    this.form = this.fb.group(model.formBuilder(true));

    this.isInitialApproved = this.model?.isInitialApproved();
    this.model.approved = this.isApproved();
    this.model.taskDetails.piid = model.taskDetails.piid
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
    this.profileService.loadActive()
      .pipe(
        map((list) => {
          if (reset) {
            return list;
          }
          if (this.model!.participatingOrganizaionList.length > 0) {
            return list.filter((org) => !this.model?.participatingOrganizaionList.find((ptOrg) => ptOrg.organizationId === org.id));
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

  loadLogs(){
    this.service.actionLogService
    .loadCaseLocation(this.model?.getCaseId())
    .pipe(takeUntil(this.destroy$))
    .subscribe(locations=>{
      this.model!.locations =locations;
    })

  }
  loadOrgUsers() {
    this.externalUserService.loadAsLookups()
      // .getByCriteria({ 'profile-id': this.employeeService.getProfile()?.id! })
      .pipe(map(users=>users.filter(user=>user.profileId === this.employeeService.getProfile()?.id!)))
      .pipe(
        map((records) => {
          const list: OrganizationOfficer[] = [];
          records.forEach((record) => {
            list.push(
              new OrganizationOfficer().clone({
                identificationNumber: record.generalUserId?.toString(),
                fullName: record.getName(),
                email:record.email,
                phone : record.phoneNumber,
                extraPhone: record.phoneExtension

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

  terminateOrganizationTask(tkiid:string){
    this.service.terminateTask(tkiid)
    .pipe(take(1))
    .subscribe(success=>{
      if(success){
        this.model!.locations = this.model!.locations.filter(location=>location.tkiid !== tkiid);
        this.dialog.success(this.lang.map.terminate_task_success)
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

    model!.temporaryOrganizaionOfficerList! = model!.temporaryOrganizaionOfficerList.filter(
      (x) => x.organizationId === orgId
    );
    model!.temporaryBuildingAbilitiesList! = model!.temporaryBuildingAbilitiesList.filter(
      (x) => x.organizationId === orgId
    );
    model!.temporaryEffectiveCoordinationCapabilities! =
      model!.temporaryEffectiveCoordinationCapabilities.filter(
        (x) => x.organizationId === orgId
      );
    model!.temporaryResearchAndStudies! = model!.temporaryResearchAndStudies.filter(
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

    model!.temporaryOrganizaionOfficerList! = model!.temporaryOrganizaionOfficerList.filter(
      (x) => x.organizationId !== orgId
    );
    model!.temporaryBuildingAbilitiesList! = model!.temporaryBuildingAbilitiesList.filter(
      (x) => x.organizationId !== orgId
    );
    model!.temporaryEffectiveCoordinationCapabilities! =
      model!.temporaryEffectiveCoordinationCapabilities.filter(
        (x) => x.organizationId !== orgId
      );
    model!.temporaryResearchAndStudies! = model!.temporaryResearchAndStudies.filter(
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
    isAllowed = (caseStatus !== CommonCaseStatus.CANCELLED && caseStatus !== CommonCaseStatus.FINAL_APPROVE && caseStatus !== CommonCaseStatus.FINAL_REJECTION);

    return !isAllowed;
  }

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
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
