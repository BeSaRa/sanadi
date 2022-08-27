import { Component, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, UntypedFormControl } from "@angular/forms";
import { OperationTypes } from "@app/enums/operation-types.enum";
import { SaveTypes } from "@app/enums/save-types";
import { EServicesGenericComponent } from "@app/generics/e-services-generic-component";
import { DateUtils } from "@app/helpers/date-utils";
import { IKeyValue } from "@app/interfaces/i-key-value";
import { ILanguageKeys } from "@app/interfaces/i-language-keys";
import { CoordinationWithOrganizationsRequest } from "@app/models/coordination-with-organizations-request";
import { Lookup } from "@app/models/lookup";
import { OrgUnit } from "@app/models/org-unit";
import { OrganizationOfficer } from '@app/models/organization-officer';
import { BuildingAbilityComponent } from "@app/modules/e-services-main/shared/building-ability/building-ability.component";
import { ResearchAndStudiesComponent } from "@app/modules/e-services-main/shared/research-and-studies/research-and-studies.component";
import { CoordinationWithOrganizationsRequestService } from "@app/services/coordination-with-organizations-request.service";
import { DialogService } from "@app/services/dialog.service";
import { EmployeeService } from "@app/services/employee.service";
import { LangService } from "@app/services/lang.service";
import { LookupService } from "@app/services/lookup.service";
import { OrganizationUnitService } from "@app/services/organization-unit.service";
import { ToastService } from "@app/services/toast.service";
import { DatepickerOptionsMap, ReadinessStatus } from "@app/types/types";
import { OrganizationUserService } from "@services/organization-user.service";
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { CoordinationTypes } from './../../../../enums/coordination-types-enum';
import { EffectiveCoordinationCapabilitiesComponent } from "./../../../e-services-main/shared/effective-coordination-capabilities/effective-coordination-capabilities.component";
import { OrganizaionOfficerComponent } from "./../../../e-services-main/shared/organizaion-officer/organizaion-officer.component";
import { ParticipantOrganizationComponent } from "./../../../e-services-main/shared/participant-organization/participant-organization.component";

@Component({
  selector: "app-coordination-with-organizations-request",
  templateUrl: "./coordination-with-organizations-request.component.html",
  styleUrls: ["./coordination-with-organizations-request.component.scss"],
})
export class CoordinationWithOrganizationsRequestComponent extends EServicesGenericComponent<
  CoordinationWithOrganizationsRequest,
  CoordinationWithOrganizationsRequestService
> {
  form!: FormGroup;
  domains: Lookup[] = this.lookupService.listByCategory.CoordinationType?.sort(
    (a, b) => a?.lookupKey - b?.lookupKey
  );
  trainingTypes: Lookup[] =
    this.lookupService.listByCategory.TrainingActivityType?.sort(
      (a, b) => a?.lookupKey - b?.lookupKey
    );
  trainingLanguages: Lookup[] =
    this.lookupService.listByCategory.TrainingLanguage?.sort(
      (a, b) => a?.lookupKey - b?.lookupKey
    );

  trainingWayes: Lookup[] =
    this.lookupService.listByCategory.TrainingWay?.sort(
      (a, b) => a?.lookupKey - b?.lookupKey
    );
  organizationWayes: Lookup[] =
    this.lookupService.listByCategory.OrganizationWay?.sort(
      (a, b) => a?.lookupKey - b?.lookupKey
    );
  datepickerOptionsMap: DatepickerOptionsMap = {
    licenseStartDate: DateUtils.getDatepickerOptions({ disablePeriod: "past" }),
    licenseEndDate: DateUtils.getDatepickerOptions({ disablePeriod: "past" }),
  };
  isCharityUser!: boolean;
  isLicensingUser!: boolean;
  isInitialApproved!:boolean;
  isEditLicenseEndDateDisabled(): boolean {
    return false;
  }
  isCorrectModelToDisplay(type:CoordinationTypes):boolean{
    return this.model?.domain===type;
  }
  _getNewInstance(): CoordinationWithOrganizationsRequest {
    return new CoordinationWithOrganizationsRequest();
  }
  _initComponent(): void {
    this.isCharityUser = this.employeeService.isCharityUser();
    this.isLicensingUser = this.employeeService.isInternalUser();
    this.loadOrgUnits();
    this.loadOrgUsers();
  }

  _buildForm(): void {
    this.form = this.fb.group(
      new CoordinationWithOrganizationsRequest().formBuilder(true),

    );
  }
  _afterBuildForm(): void {
    
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return of(this.form.valid);
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    return true;
  }
  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }
  _prepareModel(): CoordinationWithOrganizationsRequest| Observable<CoordinationWithOrganizationsRequest> {
    const value = new CoordinationWithOrganizationsRequest().clone({
      ...this.model,
      ...this.form.value,
    });
    value.participatingOrganizaionList =this.participantOrganizationsComponentRef?.list;
    value.organizaionOfficerList=this.organizationOfficerssComponentRef?.list;
    value.buildingAbilitiesList = this.buildingAbilityComponentRef?.list;
    value.effectiveCoordinationCapabilities =
      this.effectiveCoordinationCapabilitiesComponentRef?.list;
    value.researchAndStudies=this.ResearchAndStudiesComponentRef?.list;
    return value;
    
  }
  _afterSave(
    model: CoordinationWithOrganizationsRequest,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    this.model = model;
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
    this.model = model;
    this.isInitialApproved=this.model?.isInitialApproved()

    this.form = this.fb.group(model.formBuilder(true));
  }
  _resetForm(): void {
    this.form.reset();
    this.participantOrganizationsComponentRef?.list!=[];
    this.organizationOfficerssComponentRef?.list!=[];
    this.buildingAbilityComponentRef?.list!=[];
    this.effectiveCoordinationCapabilitiesComponentRef?.list!=[];
    this.ResearchAndStudiesComponentRef?.list!=[];
  }
  tabsData: IKeyValue = {
    basicInfo: {
      name: "basicInfoTab",
      langKey: "lbl_basic_info" as keyof ILanguageKeys,
      validStatus: () => this.form.valid,
    },
    participantOrganizations: {
      name: "participantOrganizations",
      langKey: "participant_organizations",
      validStatus: () => {
        return (
          this.participantOrganizationsTapStatus === "READY"
           &&
           this.model?.participatingOrganizaionList?.length! > 0
        );
      },
    },
    organizationOfficers: {
      name: "organizationOfficersTap",
      langKey: "organization_officers",
      validStatus: () => {
        return(
          this.organizationOfficersTabStatus === "READY"
           &&
          this.model?.organizaionOfficerList?.length!> 0
          );
      },
    },
    buildingAbilities: {
      name: "buildingAbilitiesTap",
      langKey: "building_abilities",
      validStatus: () => {
        return (
          this.organizationOfficersTabStatus === "READY"
           &&
          this.model?.buildingAbilitiesList?.length!> 0
          );
      },
    },
    effectiveCoordinationCapabilities: {
      name: "effectiveCoordinationCapabilitiesTap",
      langKey: "effective_coordination_capabilities",
      validStatus: () => {
        return (
          this.organizationOfficersTabStatus === "READY"
           &&
          this.model?.effectiveCoordinationCapabilities?.length!> 0
          );

      },
    },
    researchAndStudies: {
      name: "researchAndStudiesTap",
      langKey: "research_and_studies",
      validStatus: () => {
        return (
          this.organizationOfficersTabStatus === "READY"
           &&
          this.model?.researchAndStudies?.length!> 0
          );

      },
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
    specialExplanation: {
      name: 'specialExplanationTab',
      langKey: 'special_explanations',
      validStatus: () => true
    },
  };

  constructor(
    public lang: LangService,
    private lookupService: LookupService,
    private dialog: DialogService,
    private toast: ToastService,
    private employeeService: EmployeeService,
    private orgUnitService: OrganizationUnitService,
    private orgUserService: OrganizationUserService,
    public service: CoordinationWithOrganizationsRequestService,
    public fb: FormBuilder
  ) {
    super();
    this._buildForm();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }
  // Particpating  Orginzations
  @ViewChild("participantOrganizations")
  participantOrganizationsComponentRef!: ParticipantOrganizationComponent;
  participantOrganizationsTapStatus: ReadinessStatus = "READY";

  organizationUnits: OrgUnit[] = [];
  loadOrgUnits() {
    this.orgUnitService.loadComposite().subscribe((list) => {
      const propName =
        this.lang.getCurrentLanguage().name === "English" ? "enName" : "arName";
      this.organizationUnits = list.sort((a, b) =>
        a[propName] < b[propName] ? -1 : 1
      );
    });
  }

  // Organization Officers
  organizationOfficersTabStatus: ReadinessStatus = "READY";
  organizationUsers: OrganizationOfficer[] = [];
  @ViewChild("organizationOfficersTap")
  organizationOfficerssComponentRef!: OrganizaionOfficerComponent;

  loadOrgUsers() {
    this.orgUserService.getByCriteria({'org-id':this.employeeService.getOrgUnit()?.id!})
    .pipe(
      map(records=>{
        const list:OrganizationOfficer[]=[];
        records.forEach(record=>{
          list.push( new OrganizationOfficer().clone({
            identificationNumber:record.qid?.toString(),
            fullName:record.getName(),
            email:record.email,
            phone:record.officialPhoneNumber,
            extraPhone:record.phoneNumber,
            organizationId:record.orgId
          }))
        })
        return list;
      })
    )
    .subscribe((list) => {
    
      this.organizationUsers = list.sort((a, b) =>
        a.fullName < b.fullName ? -1 : 1
      );
    });
  }

  // building Abilities

  buildingAbilitiesForm!: FormGroup;
  buildingAbilityTabStatus: ReadinessStatus = "READY";
  @ViewChild("buildingAbilityTap")
  buildingAbilityComponentRef!: BuildingAbilityComponent;

  get buildingAbilities(): FormGroup {
    return this.buildingAbilities! as FormGroup;
  }

  isEditAllowed(): boolean {
    
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  // Effective Coordination Capabilities

  effectiveCoordinationCapabilitiesForm!: FormGroup;
  effectiveCoordinationCapabilitiesTabStatus: ReadinessStatus = "READY";
  @ViewChild("effectiveCoordinationCapabilitiesTap")
  effectiveCoordinationCapabilitiesComponentRef!: EffectiveCoordinationCapabilitiesComponent;

  get effectiveCoordinationCapabilities(): FormGroup {
    return this.effectiveCoordinationCapabilities! as FormGroup;
  }

  // Research And Studies

  ResearchAndStudiesForm!: FormGroup;
  ResearchAndStudiesTabStatus: ReadinessStatus = "READY";
  @ViewChild("researchAndStudiesTap")
  ResearchAndStudiesComponentRef!: ResearchAndStudiesComponent;

  get ResearchAndStudies(): FormGroup {
    return this.ResearchAndStudies! as FormGroup;
  }

  openDateMenu(ref: any) {
    if(this.isEditAllowed()) ref.toggleCalendar();
  }

  get licenseStartDate() {
    return this.form.controls      .licenseStartDate as UntypedFormControl;
  }
  get licenseEndDate() {
    return this.form.controls      .licenseEndDate as UntypedFormControl;
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
      controlsMap: {
        licenseStartDate: this.licenseStartDate,
        licenseEndDate: this.licenseEndDate,
      },
    });
  }
}
