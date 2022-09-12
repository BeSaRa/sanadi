import {
  AfterViewInit,
  Component,
  QueryList,
  TemplateRef,
  ViewChildren,
} from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
} from '@angular/forms';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { CharityDecisionType } from '@app/enums/charity-decision-type.enum';
import { CharityReportType } from '@app/enums/charity-report-type.enum';
import { CharityRequestType } from '@app/enums/charity-request-type.enum';
import { CharityRole } from '@app/enums/charity-role.enum';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { DateUtils } from '@app/helpers/date-utils';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { AdminLookup } from '@app/models/admin-lookup';
import { CharityDecision } from '@app/models/charity-decision';
import { CharityOrganization } from '@app/models/charity-organization';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';
import { CharityReport } from '@app/models/charity-report';
import { FinalExternalOfficeApprovalResult } from '@app/models/final-external-office-approval-result';
import { OrgMember } from '@app/models/org-member';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { CharityDecisionService } from '@app/services/charity-decision.service';
import { CharityOrganizationUpdateService } from '@app/services/charity-organization-update.service';
import { CharityOrganizationService } from '@app/services/charity-organization.service';
import { CharityReportService } from '@app/services/charity-report.service';
import { CountryService } from '@app/services/country.service';
import { FinalExternalOfficeApprovalService } from '@app/services/final-external-office-approval.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { MemberRoleService } from '@app/services/member-role.service';
import { RealBeneficiaryService } from '@app/services/real-beneficiary.service';
import { DatepickerOptionsMap } from '@app/types/types';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { OrganizationOfficersComponent } from '../../shared/organization-officers/organization-officers.component';

@Component({
  selector: 'charity-organization-update',
  templateUrl: './charity-organization-update.component.html',
  styleUrls: ['./charity-organization-update.component.scss'],
})
export class CharityOrganizationUpdateComponent
  extends EServicesGenericComponent<
    CharityOrganizationUpdate,
    CharityOrganizationUpdateService
  >
  implements AfterViewInit {
  form!: UntypedFormGroup;
  tabs: IKeyValue[] = [];
  _tabs: IKeyValue[] = [];
  charityOrganizations$: Observable<CharityOrganization[]> =
    this.charityOrganizationService.loadAsLookups().pipe(share());
  logoFile?: File;
  fileExtensionsEnum = FileExtensionsEnum;
  activityTypes: AdminLookup[] = [];
  RequestTypes = CharityRequestType;
  members?: { [key: string]: OrgMember[] };
  charityReports: CharityReport[] = [];
  charityDecisions: CharityDecision[] = [];
  realBenefeciaries?: RealBeneficiary[] = [];
  requestTypes = this.lookupService.listByCategory.CharityRequestType;
  contactInformationInputs: IKeyValue[] = [
    { controlName: 'phone', label: this.lang.map.lbl_phone },
    { controlName: 'email', label: this.lang.map.lbl_email },
    { controlName: 'website', label: this.lang.map.website },
    { controlName: 'zoneNumber', label: this.lang.map.lbl_zone },
    { controlName: 'streetNumber', label: this.lang.map.lbl_street },
    { controlName: 'buildingNumber', label: this.lang.map.building_number },
    { controlName: 'address', label: this.lang.map.lbl_address },
    { controlName: 'facebook', label: this.lang.map.facebook },
    { controlName: 'twitter', label: this.lang.map.twitter },
    { controlName: 'instagram', label: this.lang.map.instagram },
    { controlName: 'youTube', label: this.lang.map.youtube },
    { controlName: 'snapChat', label: this.lang.map.snapchat },
  ];
  datepickerOptionsMap: DatepickerOptionsMap = {
    firstReleaseDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    lastUpdateDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' })
  }

  internalBranches: IKeyValue[] = [
    {
      controlName: '',
    },
  ];
  externalOfficesColumns = [
    'externalOfficeName',
    'country',
    'region',
    'establishmentDate',
    'actions',
  ];
  countries$ = this.countryService.loadAsLookups()
  externalOffices$?: Observable<FinalExternalOfficeApprovalResult[]>;
  @ViewChildren('tabContent', { read: TemplateRef })
  tabsTemplates!: QueryList<TemplateRef<any>>;

  @ViewChildren('officer')
  organizationRefs!: QueryList<OrganizationOfficersComponent>;
  charityRoles = CharityRole;
  get metaDataForm(): UntypedFormGroup {
    return this.form.get('metaData') as UntypedFormGroup;
  }
  get contactInformationForm(): UntypedFormGroup {
    return this.form.get('contactInformation') as UntypedFormGroup;
  }
  get requestTypeForm(): UntypedFormControl {
    return this.form.get('requestType') as UntypedFormControl;
  }
  get riskCharityReport() {
    return this.charityReports.filter(cp => cp.reportType === CharityReportType.RISK)
  }

  get supportCharityReport() {
    return this.charityReports.filter(cp => cp.reportType === CharityReportType.SUPPORT)
  }

  get incomingCharityReport() {
    return this.charityReports.filter(cp => cp.reportType === CharityReportType.INCOMING)
  }
  get incomingCharityDecisions() {
    return this.charityDecisions.filter(cd => cd.decisionType === CharityDecisionType.INCOMING)
  }
  get outgoingCharityDecisions() {
    return this.charityDecisions.filter(cd => cd.decisionType === CharityDecisionType.OUTGOING)
  }
  constructor(
    public lang: LangService,
    public fb: UntypedFormBuilder,
    public service: CharityOrganizationUpdateService,
    private adminLookupService: AdminLookupService,
    public lookupService: LookupService,
    private charityOrganizationService: CharityOrganizationService,
    private memberRoleService: MemberRoleService,
    private finalOfficeApproval: FinalExternalOfficeApprovalService,
    private realBeneficiaryService: RealBeneficiaryService,
    private countryService: CountryService,
    private charityReportService: CharityReportService,
    private charityDecisionService: CharityDecisionService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    const tabsTemplates = this.tabsTemplates.toArray();
    setTimeout(() => {
      this._tabs = [
        {
          name: 'requestTypeTab',
          template: tabsTemplates[0],
          title: this.lang.map.request_type,
          validStatus: () => true,
        },
        {
          name: 'metaDataTab',
          template: tabsTemplates[1],
          title: this.lang.map.meta_data,
          validStatus: () => !!this.form && this.metaDataForm.valid,
          category: CharityRequestType.META_DATA,
        },
        {
          name: 'contactInformationTab',
          template: tabsTemplates[2],
          title: this.lang.map.contact_information,
          validStatus: () => !!this.form && this.contactInformationForm.valid,
          category: CharityRequestType.META_DATA,
        },
        {
          name: 'complainceOfficerTab',
          template: tabsTemplates[3],
          title: this.lang.map.complaince_office_data,
          validStatus: () => true,
          category: CharityRequestType.META_DATA,
        },
        {
          name: 'liaisonOfficerTab',
          template: tabsTemplates[4],
          title: this.lang.map.liaison_office_data,
          validStatus: () => true,
          category: CharityRequestType.META_DATA,
        },
        {
          name: 'banchTab',
          template: tabsTemplates[5],
          title: this.lang.map.lbl_branch,
          validStatus: () => true,
          category: CharityRequestType.META_DATA,
        },
        {
          name: 'externalBranchTab',
          template: tabsTemplates[6],
          title: this.lang.map.external_offices,
          validStatus: () => true,
          category: CharityRequestType.META_DATA,
        },
        {
          name: 'foundingMembersTab',
          template: tabsTemplates[7],
          title: this.lang.map.founding_members,
          validStatus: () => true,
          category: CharityRequestType.ADMINISTRATIVE_DATA,
        },
        {
          name: 'generalAssemblyMembersTab',
          template: tabsTemplates[8],
          title: this.lang.map.general_assembly_members,
          validStatus: () => true,
          category: CharityRequestType.ADMINISTRATIVE_DATA,
        },
        {
          name: 'boardMembersTab',
          template: tabsTemplates[9],
          title: this.lang.map.board_members,
          validStatus: () => true,
          category: CharityRequestType.ADMINISTRATIVE_DATA,
        },
        {
          name: 'executiveManagmentTab',
          template: tabsTemplates[10],
          title: this.lang.map.executive_management,
          validStatus: () => true,
          category: CharityRequestType.ADMINISTRATIVE_DATA,
        },
        {
          name: 'authorizedMembersTab',
          template: tabsTemplates[11],
          title: this.lang.map.board_members,
          validStatus: () => true,
          category: CharityRequestType.ADMINISTRATIVE_DATA,
        },
        {
          name: 'realBenefeciariesTab',
          template: tabsTemplates[12],
          title: this.lang.map.real_benefeciaries,
          validStatus: () => true,
          category: CharityRequestType.ADMINISTRATIVE_DATA,
        },
        {
          name: 'primaryLawTab',
          template: tabsTemplates[13],
          title: this.lang.map.primary_law,
          validStatus: () => true,
          category: CharityRequestType.GOVERANCE_DOCUMENTS
        },
        {
          name: 'classifcationOfAidTab',
          template: tabsTemplates[14],
          title: this.lang.map.classification_of_foreign_aid,
          validStatus: () => true,
          category: CharityRequestType.GOVERANCE_DOCUMENTS,
        },
        {
          name: 'workAreasTab',
          template: tabsTemplates[15],
          title: this.lang.map.work_areas,
          validStatus: () => true,
          category: CharityRequestType.GOVERANCE_DOCUMENTS,
        },
        {
          name: 'byLawsTab',
          template: tabsTemplates[16],
          title: this.lang.map.bylaws,
          validStatus: () => true,
          category: CharityRequestType.GOVERANCE_DOCUMENTS,
        },
        {
          name: 'riskReportsTab',
          template: tabsTemplates[17],
          title: this.lang.map.risk_reports,
          validStatus: () => true,
          category: CharityRequestType.COORDINATION_AND_CONTROL_REPORTS
        },

        {
          name: 'coordinationAndSupportsTab',
          template: tabsTemplates[18],
          title: this.lang.map.coordination_and_support_reports,
          validStatus: () => true,
          category: CharityRequestType.COORDINATION_AND_CONTROL_REPORTS
        },

        {
          name: 'organizationsReportTab',
          template: tabsTemplates[19],
          title: this.lang.map.reports_received_from_organization,
          validStatus: () => true,
          category: CharityRequestType.COORDINATION_AND_CONTROL_REPORTS
        },
        {
          name: 'outgoingDecisionsTab',
          template: tabsTemplates[20],
          title: this.lang.map.decisions_by_organizations,
          validStatus: () => true,
          category: CharityRequestType.APPROVE_MEASURES_AND_PENALTIES
        },
        {
          name: 'internalDecisionsTab',
          template: tabsTemplates[21],
          title: this.lang.map.internal_decisions,
          validStatus: () => true,
          category: CharityRequestType.APPROVE_MEASURES_AND_PENALTIES
        }
      ];
      this.tabs = [this._tabs[0]];
      if (!this.accordionView) {
        this._tabs.push({
          name: 'attachmentsTab',
          template: tabsTemplates[tabsTemplates.length - 1],
          title: this.lang.map.attachments,
          validStatus: () => true,
        });
        this.tabs.push(this._tabs[this._tabs.length - 1]);
      }
    }, 0);
  }

  handleRequestTypeChange(requestType: number): void {
    this.tabs = this._tabs.filter(
      (e) => !e?.category || e.category === requestType
    );
  }
  handleSelectCharityOrganization(id: number) {
    const requestType = this.requestTypeForm.value;
    if (requestType === this.RequestTypes.META_DATA) {
      const model = this.charityOrganizationService.getById(id);
      model.subscribe((model) => {
        this._updateForm(model.toCharityOrganizationUpdate());
      });
      this.externalOffices$ = this.finalOfficeApproval.licenseSearch({
        organizationId: id,
      });
    } else if (requestType === this.RequestTypes.ADMINISTRATIVE_DATA) {
      this.memberRoleService.getMembersOfCharity(id).subscribe((m) => {
        this.members = Object.entries(m).reduce((prev, [key, value]) => {
          if (!Array.isArray(value)) {
            return prev;
          }
          return {
            ...prev,
            [key]: value.map((x) => x.orgMember),
          };
        }, {});
        this.realBeneficiaryService.getRealBenficiaryOfCharity(id).subscribe(e => {
          this.realBenefeciaries = e;
        })
      });
    }
    else if (requestType === this.RequestTypes.GOVERANCE_DOCUMENTS) {
      this.form.get('primaryLaw.charityWorkArea')!.patchValue(1);
      console.log({ x: this.form.get('primaryLaw.charityWorkArea') })
    }
    else if (requestType === this.RequestTypes.COORDINATION_AND_CONTROL_REPORTS) {
      this.charityReportService.getByCharityId(id).subscribe(m => {
        this.charityReports = m;
      });
    }
    else if (requestType === this.RequestTypes.APPROVE_MEASURES_AND_PENALTIES) {
      this.charityDecisionService.getByCharityId(id).subscribe(m => {
        this.charityDecisions = m;
      })
    }
  }
  getTabInvalidStatus(i: number): boolean {
    if (i >= 0 && i < this.tabs.length) {
      return !this.tabs[i].validStatus();
    }
    return true;
  }

  setLogoFile(file: File | File[] | undefined): void {
    if (!file || file instanceof File) {
      this.logoFile = file;
    } else {
      this.logoFile = file[0];
    }
  }
  _getNewInstance(): CharityOrganizationUpdate {
    return new CharityOrganizationUpdate();
  }
  _initComponent(): void {
    this.loadActivityTypes();
  }
  loadActivityTypes(): void {
    this.adminLookupService
      .loadAsLookups(AdminLookupTypeEnum.ACTIVITY_TYPE)
      .subscribe((list) => {
        this.activityTypes = list;
      });
  }
  _buildForm(): void {
    const model = this._getNewInstance();
    this.form = this.fb.group({
      metaData: this.fb.group(model.buildMetaDataForm()),
      contactInformation: this.fb.group(model.buildContactInformationForm()),
/*       primaryLaw: this.fb.group(model.buildPrimaryLawForm()),
 */      ...model.getFirstPageForm(),
    });
  }

  _afterBuildForm(): void { }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return true;
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }
  _afterLaunch(): void {
    throw new Error('Method not implemented.');
  }
  _prepareModel():
    | CharityOrganizationUpdate
    | Observable<CharityOrganizationUpdate> {
    const arr = this.organizationRefs.toArray();
    const charityOfficers = arr[1].list;
    const complianceOfficers = arr[0].list;

    return new CharityOrganizationUpdate().clone({
      ...this.contactInformationForm.value,
      ...this.metaDataForm.value,
      requestType: this.requestTypeForm.value,
      charityId: this.form.get('charityId')!.value,
      charityBranchList: charityOfficers,
      complianceOfficerList: complianceOfficers
    });
  }
  selectExternalOffice(event: any, row: FinalExternalOfficeApprovalResult) {
    this.service.openExternalOfficePopup(row);
  }
  _afterSave(
    model: CharityOrganizationUpdate,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    throw new Error('Method not implemented.');
  }
  _saveFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }
  _destroyComponent(): void {
    throw new Error('Method not implemented.');
  }
  patchFrom(model: CharityOrganizationUpdate) {
    this.model = model;
    this.metaDataForm.patchValue(model!.buildMetaDataForm());
    this.contactInformationForm.patchValue(
      model!.buildContactInformationForm()
    );
  }
  _updateForm(model: CharityOrganizationUpdate | undefined): void {
    if (!model) return;
    this.model = model;
    console.log(this.model.charityBranchList);
    this.metaDataForm.patchValue(model!.buildMetaDataForm(false));
    this.contactInformationForm.patchValue(
      model!.buildContactInformationForm(false)
    );
  }
  _resetForm(): void {
    throw new Error('Method not implemented.');
  }
}
