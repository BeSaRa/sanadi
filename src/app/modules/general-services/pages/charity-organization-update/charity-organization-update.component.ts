import {
  AfterViewInit,
  ChangeDetectorRef,
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
import { CharityWorkArea } from '@app/enums/charity-work-area.enum';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { OpenFrom } from '@app/enums/open-from.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { AdminLookup } from '@app/models/admin-lookup';
import { BlobModel } from '@app/models/blob-model';
import { CharityDecision } from '@app/models/charity-decision';
import { CharityOrganization } from '@app/models/charity-organization';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';
import { CharityReport } from '@app/models/charity-report';
import { FinalExternalOfficeApprovalResult } from '@app/models/final-external-office-approval-result';
import { GeneralAssociationMeetingAttendance } from '@app/models/general-association-meeting-attendance';
import { OrgMember } from '@app/models/org-member';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { CharityDecisionService } from '@app/services/charity-decision.service';
import { CharityOrganizationUpdateService } from '@app/services/charity-organization-update.service';
import { CharityOrganizationService } from '@app/services/charity-organization.service';
import { CharityReportService } from '@app/services/charity-report.service';
import { CountryService } from '@app/services/country.service';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { FinalExternalOfficeApprovalService } from '@app/services/final-external-office-approval.service';
import { GeneralAssociationMeetingAttendanceService } from '@app/services/general-association-meeting-attendance.service';
import { GoveranceDocumentService } from '@app/services/governance-document.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { MemberRoleService } from '@app/services/member-role.service';
import { RealBeneficiaryService } from '@app/services/real-beneficiary.service';
import { ToastService } from '@app/services/toast.service';
import { DatepickerOptionsMap } from '@app/types/types';
import { IMyDateModel } from 'angular-mydatepicker';
import { Observable, of } from 'rxjs';
import { share, map, take, switchMap, takeUntil } from 'rxjs/operators';
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
    this.charityOrganizationService.loadAsLookups().pipe(
      share(),
      /* map((e) =>
        e.filter((x) =>
          this.employeeService.isCharityUser()
            ? x.id === this.employeeService.getUser()?.orgId
            : true
        )
      ) */
    );
  logoFile?: File;
  loadedLogo?: BlobModel;
  fileExtensionsEnum = FileExtensionsEnum;
  activityTypes: AdminLookup[] = [];
  RequestTypes = CharityRequestType;
  members?: { [key: string]: OrgMember[] };
  charityReports: CharityReport[] = [];
  charityDecisions: CharityDecision[] = [];
  realBenefeciaries?: RealBeneficiary[] = [];
  requestTypes = this.lookupService.listByCategory.CharityRequestType.sort((a, b) => a.lookupKey - b.lookupKey);
  contactInformationInputs: ControlWrapper[] = [
    { type: 'text', controlName: 'phone', label: this.lang.map.lbl_phone },
    { type: 'text', controlName: 'email', label: this.lang.map.lbl_email },
    { type: 'text', controlName: 'website', label: this.lang.map.website },
    { type: 'text', controlName: 'zoneNumber', label: this.lang.map.lbl_zone },
    { type: 'text', controlName: 'streetNumber', label: this.lang.map.lbl_street },
    { type: 'text', controlName: 'buildingNumber', label: this.lang.map.building_number },
    { type: 'text', controlName: 'address', label: this.lang.map.lbl_address },
    { type: 'text', controlName: 'facebook', label: this.lang.map.facebook },
    { type: 'text', controlName: 'twitter', label: this.lang.map.twitter },
    { type: 'text', controlName: 'instagram', label: this.lang.map.instagram },
    { type: 'text', controlName: 'youTube', label: this.lang.map.youtube },
    { type: 'text', controlName: 'snapChat', label: this.lang.map.snapchat },
  ];
  datepickerOptionsMap: DatepickerOptionsMap = {
    firstReleaseDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'future',
    }),
    lastUpdateDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
  };

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
  organizationMeetingsColumns = [
    'meetingDate',
    'location',
    'meetingType',
  ]
  countries$ = this.countryService.loadAsLookups();
  externalOffices$?: Observable<FinalExternalOfficeApprovalResult[]>;
  organizationMeetings$?: Observable<GeneralAssociationMeetingAttendance[]>;
  @ViewChildren('tabContent', { read: TemplateRef })
  tabsTemplates!: QueryList<TemplateRef<any>>;

  @ViewChildren('metaList')
  organizationRefs!: QueryList<any>;

  @ViewChildren('goverList')
  goverRefs!: QueryList<any>;

  @ViewChildren('adminList')
  membersRefs!: QueryList<any>;

  @ViewChildren('decisionList')
  decisionsRefs!: QueryList<any>;

  @ViewChildren('reportList')
  reportRefs!: QueryList<any>;
  charityRoles = CharityRole;
  get metaDataForm(): UntypedFormGroup {
    return this.form.get('metaData') as UntypedFormGroup;
  }
  get contactInformationForm(): UntypedFormGroup {
    return this.form.get('contactInformation') as UntypedFormGroup;
  }
  get primaryLawForm(): UntypedFormGroup {
    return this.form.get('primaryLaw') as UntypedFormGroup;
  }
  get requestTypeForm(): UntypedFormControl {
    return this.form.get('requestType') as UntypedFormControl;
  }
  get charityWorkAreaField(): UntypedFormControl {
    return this.form.get('primaryLaw.charityWorkArea')! as UntypedFormControl;
  }
  get riskCharityReport() {
    return this.charityReports.filter(
      (cp) => cp.reportType === CharityReportType.RISK
    );
  }

  get supportCharityReport() {
    return this.charityReports.filter(
      (cp) => cp.reportType === CharityReportType.SUPPORT
    );
  }

  get incomingCharityReport() {
    return this.charityReports.filter(
      (cp) => cp.reportType === CharityReportType.INCOMING
    );
  }
  get incomingCharityDecisions() {
    return this.charityDecisions.filter(
      (cd) => cd.decisionType === CharityDecisionType.INCOMING
    );
  }
  get outgoingCharityDecisions() {
    return this.charityDecisions.filter(
      (cd) => cd.decisionType === CharityDecisionType.OUTGOING
    );
  }
  listMembers(t: CharityRole): OrgMember[] {
    if (this.members && t in this.members) {
      return this.members[t];
    }
    return [];
  }

  constructor(
    private meetingService: GeneralAssociationMeetingAttendanceService,
    private dialog: DialogService,
    private toast: ToastService,
    private cd: ChangeDetectorRef,
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
    private charityDecisionService: CharityDecisionService,
    private employeeService: EmployeeService,
    private goveranceDocumentService: GoveranceDocumentService
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
          validStatus: () => this.primaryLawForm.valid,
          category: CharityRequestType.GOVERANCE_DOCUMENTS,
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
          category: CharityRequestType.COORDINATION_AND_CONTROL_REPORTS,
        },

        {
          name: 'coordinationAndSupportsTab',
          template: tabsTemplates[18],
          title: this.lang.map.coordination_and_support_reports,
          validStatus: () => true,
          category: CharityRequestType.COORDINATION_AND_CONTROL_REPORTS,
        },

        {
          name: 'organizationsReportTab',
          template: tabsTemplates[19],
          title: this.lang.map.reports_received_from_organization,
          validStatus: () => true,
          category: CharityRequestType.COORDINATION_AND_CONTROL_REPORTS,
        },
        {
          name: 'outgoingDecisionsTab',
          template: tabsTemplates[20],
          title: this.lang.map.decisions_by_organizations,
          validStatus: () => true,
          category: CharityRequestType.APPROVE_MEASURES_AND_PENALTIES,
        },
        {
          name: 'internalDecisionsTab',
          template: tabsTemplates[21],
          title: this.lang.map.internal_decisions,
          validStatus: () => true,
          category: CharityRequestType.APPROVE_MEASURES_AND_PENALTIES,
        },
        {
          name: 'generalAssocationMeetingsTab',
          template: tabsTemplates[22],
          title: this.lang.map.meeting,
          category: CharityRequestType.GOVERANCE_DOCUMENTS,
          validStatus: () => true
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
      this._updateForm(this.model);
    }, 0);
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
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }

  handleRequestTypeChange(requestType: number, userInteraction: boolean = false): void {
    of(userInteraction)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.confirmChangeRequestType(userInteraction))
      ).subscribe((clickOn: UserClickOn) => {
        if (clickOn === UserClickOn.YES) {
          if (userInteraction) {
            this.resetForm$.next();
            this.requestTypeForm.setValue(requestType);
          }
          this.requestType$.next(requestType);
          this.tabs = this._tabs.filter(
            (e) => !e?.category || e.category === requestType
          );
          if (requestType === this.RequestTypes.META_DATA) {
            this._buildMetaDataForm(requestType);
          } else if (requestType === this.RequestTypes.GOVERANCE_DOCUMENTS) {
            this._buildPrimaryLawForm(requestType);
          } else {
            this._buildForm(requestType);
          }
        }
        else {
          this.requestTypeForm.setValue(this.requestType$.value);
        }
      })


  }
  toDate(date: IMyDateModel) {
    return DateUtils.getDateStringFromDate(date);
  }
  toCharityOrganizationOrgMember(member: OrgMember): OrgMember {
    const {
      id,
      qid,
      email,
      extraPhone,
      phone,
      jobTitleId,
      joinDate,
      nationality,
      fullName,
    } = member;
    return new OrgMember().clone({
      objectDBId: id,
      identificationNumber: qid,
      fullName,
      jobTitleId,
      email,
      phone,
      joinDate,
      nationality,
      extraPhone,
    });
  }
  toCharityOrganizationRealBenficiary(
    realBenefeciary: RealBeneficiary
  ): RealBeneficiary {
    const {
      address,
      arName,
      enName,
      birthDate,
      birthLocation,
      buildingNumber,
      iDDate,
      iDExpiryDate,
      id,
      iddate,
      idexpiryDate,
      lastUpdateDate,
      nationality,
      passportDate,
      passportExpiryDate,
      passportNumber,
      qid,
      startDate,
      streetNumber,
      zoneNumber,
    } = realBenefeciary;
    return new RealBeneficiary().clone({
      address,
      arabicName: arName,
      englishName: enName,
      birthDate,
      birthLocation,
      buildingNumber,
      iddate,
      iDDate,
      idexpiryDate,
      iDExpiryDate,
      objectDBId: id,
      lastUpdateDate,
      identificationNumber: qid,
      nationality,
      passportDate,
      passportExpiryDate,
      startDate,
      streetNumber,
      zoneNumber,
      passportNumber,
    });
  }

  handleSelectCharityOrganization(id: number): void {
    if (!id) {
      return;
    }

    const requestType = this.requestTypeForm.value;
    if (requestType === this.RequestTypes.META_DATA) {
      const model = this.charityOrganizationService.getById(id);
      model.subscribe((m) => {
        this._updateForm(m.toCharityOrganizationUpdate());
        this.charityOrganizationService.getLogoBy({ charityId: id }).subscribe(logo => {
          if (logo.blob.size === 0) {
            this.loadedLogo = undefined;
            return;
          }
          this.loadedLogo = logo;
        });
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
            [key]: value.map((x) =>
              this.toCharityOrganizationOrgMember(x.orgMember)
            ),
          };
        }, {});
        this.realBeneficiaryService
          .getRealBenficiaryOfCharity(id)
          .subscribe((e) => {
            this.realBenefeciaries = e.map(
              this.toCharityOrganizationRealBenficiary
            );
            this.model = new CharityOrganizationUpdate().clone({
              boardMemberList: this.listMembers(CharityRole.BOARD_MEMBERS),
              founderMemberList: this.listMembers(CharityRole.FOUNDER_MEMBERS),
              generalAssemblyMemberList: this.listMembers(CharityRole.GENERAL_ASSEMBLY_MEMBERS),
              authorizedSignatoryMemberList: this.listMembers(CharityRole.AUTHORIZED_MEMBERS),
              currentExecutiveManagementList: this.listMembers(CharityRole.CURRENT_EXECUTIVE_MANAGEMENT),
              realBeneficiaryList: this.realBenefeciaries
            })
          });
      });

    } else if (requestType === this.RequestTypes.GOVERANCE_DOCUMENTS) {
      this.charityWorkAreaField!.patchValue(CharityWorkArea.INSIDE);
      this.goveranceDocumentService.getByCharityId(id).subscribe(m => {
        this._updateForm(m[0].toCharityOrgnizationUpdate());
      });
      this.organizationMeetings$ = this.meetingService.search({ organizationId: id });
    } else if (
      requestType === this.RequestTypes.COORDINATION_AND_CONTROL_REPORTS
    ) {
      this.charityReportService.getByCharityId(id).subscribe((m) => {
        this.charityReports = m.map(e => new CharityReport().clone({ ...e }).toCharityOrganizationUpdate());
        this.model = new CharityOrganizationUpdate().clone({
          riskReportList: this.riskCharityReport,
          incomingReportList: this.incomingCharityReport,
          coordinationSupportReport: this.supportCharityReport
        })
      });
    } else if (
      requestType === this.RequestTypes.APPROVE_MEASURES_AND_PENALTIES
    ) {
      this.charityDecisionService.getByCharityId(id).subscribe((m) => {
        this.charityDecisions = m.map(e => new CharityDecision().clone({ ...e }).toCharityOrganizationUpdate());
        this.model = new CharityOrganizationUpdate().clone({
          incomingDecisionList: this.incomingCharityDecisions,
          outgoingDecisionList: this.outgoingCharityDecisions
        });
      });
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
  _buildForm(requestType?: number): void {
    const model = this._getNewInstance().clone({
      requestType,
    });
    this.form = this.fb.group({
      ...model.getFirstPageForm(),
    });
  }
  _buildMetaDataForm(requestType: number): void {
    const model = this._getNewInstance().clone({
      requestType,
    });
    this.form = this.fb.group({
      metaData: this.fb.group(model.buildMetaDataForm()),
      contactInformation: this.fb.group(model.buildContactInformationForm()),
      ...model.getFirstPageForm(),
    });
  }
  _buildPrimaryLawForm(requestType: number) {
    const model = this._getNewInstance().clone({
      requestType,
    });
    this.form = this.fb.group({
      ...model.getFirstPageForm(),
      primaryLaw: this.fb.group(model.buildPrimaryLawForm()),
    });
  }
  _afterBuildForm(): void {
    this.handleReadonly();
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return this.form.valid;
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    return true
  }
  _afterLaunch(): void {

    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }
  _prepareModel():
    | CharityOrganizationUpdate
    | Observable<CharityOrganizationUpdate> {
    let charityOfficers = [];
    let complianceOfficers = [];
    let branchList = [];
    let founderMemberList = [];
    let generalAssemblyMemberList = [];
    let boardMemberList = [];
    let currentExecutiveManagementList = [];
    let authorizedSignatoryMemberList = [];
    let realBeneficiaryList = [];
    let metaDataValue = {};
    let primaryLawValue = {};
    let wFClassificationList = [];
    let workAreaObjectList = [];
    let byLawList = [];
    let riskReportList = [];
    let coordinationSupportReport = [];
    let incomingReportList = [];
    let outgoingDecisionList = [];
    let incomingDecisionList = [];
    if (this.requestTypeForm.value === this.RequestTypes.META_DATA) {
      const arr = this.organizationRefs.toArray();
      charityOfficers = arr[1].list || [];
      complianceOfficers = arr[0].list || [];
      branchList = arr[2].list || [];
      metaDataValue = {
        ...this.contactInformationForm.value,
        ...this.metaDataForm.value,
      };
    } else if (
      this.requestTypeForm.value === this.RequestTypes.ADMINISTRATIVE_DATA
    ) {
      const arr = this.membersRefs.toArray();
      founderMemberList = arr[0].list || [];
      generalAssemblyMemberList = arr[1].list || [];
      boardMemberList = arr[2].list || [];
      currentExecutiveManagementList = arr[3].list || [];
      authorizedSignatoryMemberList = arr[4].list || [];
      realBeneficiaryList = arr[5].list || [];
    }
    else if (this.requestTypeForm.value === this.RequestTypes.GOVERANCE_DOCUMENTS) {
      const arr = this.goverRefs.toArray();
      primaryLawValue = { ...this.primaryLawForm.value };
      wFClassificationList = arr[0].list || [];
      workAreaObjectList = arr[1].list || [];
      byLawList = arr[2].list || [];
    }
    else if (this.requestTypeForm.value === this.RequestTypes.COORDINATION_AND_CONTROL_REPORTS) {
      const arr = this.reportRefs.toArray();
      riskReportList = arr[0].list || [];
      coordinationSupportReport = arr[1].list || [];
      incomingReportList = arr[2].list || [];
    }
    else if (this.requestTypeForm.value === this.RequestTypes.APPROVE_MEASURES_AND_PENALTIES) {
      const arr = this.decisionsRefs.toArray();
      outgoingDecisionList = arr[0].list || [];
      incomingDecisionList = arr[1].list || [];
    }
    return new CharityOrganizationUpdate().clone({
      ...metaDataValue,
      requestType: this.requestTypeForm.value,
      charityId: this.form.get('charityId')!.value,
      charityContactOfficerList: charityOfficers,
      complianceOfficerList: complianceOfficers,
      charityBranchList: branchList,
      founderMemberList,
      generalAssemblyMemberList,
      boardMemberList,
      currentExecutiveManagementList,
      authorizedSignatoryMemberList,
      realBeneficiaryList,
      ...primaryLawValue,
      wFClassificationList,
      workAreaObjectList,
      byLawList,
      riskReportList,
      coordinationSupportReport,
      incomingReportList,
      incomingDecisionList,
      outgoingDecisionList
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
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
    if (this.logoFile) {
      this.charityOrganizationService.saveLogo(this.model.charityId, this.logoFile!).subscribe(id => {
        console.log(id);
        this.model!.logoId = id;
        this.model?.save().subscribe();
      });
    }
  }
  _saveFail(error: any): void { }
  _launchFail(error: any): void {
  }
  _destroyComponent(): void {
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
    if (this.model.requestType) {
      this.requestTypeForm.patchValue(this.model.requestType);
      this.handleRequestTypeChange(this.model.requestType);
    }
    if (this.model.charityId) {
      this.form.get('charityId')?.patchValue(this.model.charityId);
      this.externalOffices$ = this.finalOfficeApproval.licenseSearch({
        organizationId: this.model.charityId,
      });
      this.organizationMeetings$ = this.meetingService.search({ organizationId: this.model.charityId });
    }
    if (this.model.logoId) {
      this.charityOrganizationService.getLogoBy({ id: this.model.logoId }).subscribe(logo => {
        if (logo.blob.size === 0) {
          this.loadedLogo = undefined;
          return;
        }
        this.loadedLogo = logo;
      });
    }
    if ((this.requestTypeForm.value || this.model.requestType) === this.RequestTypes.META_DATA) {
      this.metaDataForm.patchValue(model!.buildMetaDataForm(false));
      this.contactInformationForm.patchValue(
        model!.buildContactInformationForm(false)
      );
    }
    else if ((this.requestTypeForm.value || this.model.requestType) === this.RequestTypes.GOVERANCE_DOCUMENTS) {
      this.primaryLawForm.patchValue(model!.buildPrimaryLawForm(false));
    }
    this.cd.detectChanges();
  }

  _resetForm(): void {
    this.form.reset();
  }
}
