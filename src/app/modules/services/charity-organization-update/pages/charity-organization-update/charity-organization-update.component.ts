import { CharityOrganizationUpdateInterceptor } from '@app/model-interceptors/charity-organization-update-interceptor';
import { AfterViewInit, ChangeDetectorRef, Component, QueryList, TemplateRef, ViewChildren, } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, } from '@angular/forms';
import { AdminLookupTypeEnum } from '@enums/admin-lookup-type-enum';
import { CharityDecisionType } from '@enums/charity-decision-type.enum';
import { CharityReportType } from '@enums/charity-report-type.enum';
import { CharityUpdateSection } from '@enums/charity-update-section.enum';
import { CharityRole } from '@enums/charity-role.enum';
import { CommonCaseStatus } from '@enums/common-case-status.enum';
import { FileExtensionsEnum } from '@enums/file-extension-mime-types-icons.enum';
import { OpenFrom } from '@enums/open-from.enum';
import { OperationTypes } from '@enums/operation-types.enum';
import { SaveTypes } from '@enums/save-types';
import { UserClickOn } from '@enums/user-click-on.enum';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { CommonUtils } from '@helpers/common-utils';
import { DateUtils } from '@helpers/date-utils';
import { ControlWrapper } from '@contracts/i-control-wrapper';
import { IKeyValue } from '@contracts/i-key-value';
import { AdminLookup } from '@models/admin-lookup';
import { BlobModel } from '@models/blob-model';
import { CharityDecision } from '@models/charity-decision';
import { CharityOrganization } from '@models/charity-organization';
import { CharityOrganizationUpdate } from '@models/charity-organization-update';
import { CharityReport } from '@models/charity-report';
import { Country } from '@models/country';
import { FinalExternalOfficeApprovalResult } from '@models/final-external-office-approval-result';
import { GeneralAssociationMeetingAttendance } from '@models/general-association-meeting-attendance';
import { NpoEmployee } from '@models/npo-employee';
import { OrgMember } from '@models/org-member';
import { RealBeneficiary } from '@models/real-beneficiary';
import { AdminLookupService } from '@services/admin-lookup.service';
import { CharityDecisionService } from '@services/charity-decision.service';
import { CharityOrganizationUpdateService } from '@services/charity-organization-update.service';
import { CharityOrganizationService } from '@services/charity-organization.service';
import { CharityReportService } from '@services/charity-report.service';
import { CountryService } from '@services/country.service';
import { DialogService } from '@services/dialog.service';
import { EmployeeService } from '@services/employee.service';
import { FinalExternalOfficeApprovalService } from '@services/final-external-office-approval.service';
import { GeneralAssociationMeetingAttendanceService } from '@services/general-association-meeting-attendance.service';
import { GoveranceDocumentService } from '@services/governance-document.service';
import { LangService } from '@services/lang.service';
import { LookupService } from '@services/lookup.service';
import { MemberRoleService } from '@services/member-role.service';
import { NpoEmployeeService } from '@services/npo-employee.service';
import { RealBeneficiaryService } from '@services/real-beneficiary.service';
import { ToastService } from '@services/toast.service';
import { DatepickerOptionsMap } from '@app/types/types';
import { IMyDateModel } from 'angular-mydatepicker';
import { Observable, of } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { ITabData } from "@contracts/i-tab-data";
import { GlobalSettings } from '@app/models/global-settings';
import { GlobalSettingsService } from '@app/services/global-settings.service';
import { OrgExecutiveMember } from '@app/models/org-executive-member';

@Component({
  selector: 'charity-organization-update',
  templateUrl: './charity-organization-update.component.html',
  styleUrls: ['./charity-organization-update.component.scss'],
})
export class CharityOrganizationUpdateComponent
  extends EServicesGenericComponent<CharityOrganizationUpdate,
  CharityOrganizationUpdateService>
  implements AfterViewInit {
  form!: UntypedFormGroup;
  tabs: ITabData[] = [];
  _tabs: ITabData[] = [];
  charityOrganizations: CharityOrganization[] = [];
  logoFile?: File;
  loadedLogo?: BlobModel;
  fileExtensionsEnum = FileExtensionsEnum;
  activityTypes: AdminLookup[] = [];
  members?: { [key: string]: OrgMember[] | OrgExecutiveMember[] };
  charityReports: CharityReport[] = [];
  charityDecisions: CharityDecision[] = [];
  realBenefeciaries?: RealBeneficiary[] = [];
  allEmployeesOfOrganization$?: Observable<NpoEmployee[]>;
  updateSections = this.lookupService.listByCategory.CharityUpdateSection.sort((a, b) => a.lookupKey - b.lookupKey);
  contactInformationInputs: ControlWrapper[] = [];
  globalSettings: GlobalSettings = this.globalSettingsService.getGlobalSettings();
  allowedFileMaxSize: number = this.globalSettings.fileSize * 1000 * 1024;

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
    'meetingCount',
  ];
  allEmployeesOfOrganizationColumns = [
    'name',
    'qId',
    'nationality',
    'jobTitle',
    'contractLocation',
    'status'
  ];
  countries!: Country[];
  externalOffices$?: Observable<FinalExternalOfficeApprovalResult[]>;
  organizationMeetings$?: Observable<GeneralAssociationMeetingAttendance[]>;
  buildingTabsDone = false;
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

  get updateSectionField(): UntypedFormControl {
    return this.form.get('updateSection') as UntypedFormControl;
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
      return this.members[t] as OrgMember[];
    }
    return [];
  }

  listExecutiveMembers(t: CharityRole): OrgExecutiveMember[] {
    if (this.members && t in this.members) {
      return this.members[t] as OrgExecutiveMember[];
    }
    return [];
  }

  private _loadCountries(): void {
    this.countryService.loadAsLookups().subscribe(e => {
      this.countries = [...e];
    });
  }

  private _setModelNames(charity: CharityOrganization) {
    this.model!.arabicName = charity!.arName;
    this.model!.englishName = charity!.enName;
  }

  private _loadCharities(): void {
    this.charityOrganizationService.loadAsLookups().pipe(
      map((charities) =>
        charities.filter((charity) =>
          this.employeeService.isExternalUser()
            ? charity.id === this.employeeService.getProfile()?.profileDetails.entityId
            : true
        )
      )
    ).subscribe(e => {
      this.charityOrganizations = e;
      this.service.charityOrganizations = e;
    });
  }

  private _filterExternalUserRequestTypes() {
    const notAllowedForExternalUser = [CharityUpdateSection.COORDINATION_AND_CONTROL_REPORTS, CharityUpdateSection.APPROVE_MEASURES_AND_PENALTIES];
    this.updateSections = this.updateSections.filter(e => !notAllowedForExternalUser.includes(e.lookupKey));
  }

  private _loadEmployees(charityId: number): void {
    this.allEmployeesOfOrganization$ = this.npoEmployeeService.getByOrganizationId(charityId);
  }

  private _buildContactInformationInputs() {
    this.contactInformationInputs = [
      { type: 'text', controlName: 'phone', langKey: 'lbl_phone' },
      { type: 'text', controlName: 'email', langKey: 'lbl_email' },
      { type: 'text', controlName: 'website', langKey: 'website' },
      { type: 'text', controlName: 'zoneNumber', langKey: 'lbl_zone' },
      { type: 'text', controlName: 'streetNumber', langKey: 'lbl_street' },
      { type: 'text', controlName: 'buildingNumber', langKey: 'building_number' },
      { type: 'text', controlName: 'address', langKey: 'lbl_address' },
      { type: 'text', controlName: 'facebook', langKey: 'facebook' },
      { type: 'text', controlName: 'twitter', langKey: 'twitter' },
      { type: 'text', controlName: 'instagram', langKey: 'instagram' },
      { type: 'text', controlName: 'youTube', langKey: 'youtube' },
      { type: 'text', controlName: 'snapChat', langKey: 'snapchat' },
    ];
  }

  private _buildTabs(tabsTemplates: TemplateRef<any>[]): void {
    this._tabs = [
      {
        name: 'requestTypeTab',
        template: tabsTemplates[0],
        title: this.lang.map.section,
        langKey: 'section',
        validStatus: () => true,
        isTouchedOrDirty: () => true,
        index: 0
      },
      {
        name: 'metaDataTab',
        template: tabsTemplates[1],
        title: this.lang.map.meta_data,
        langKey: 'meta_data',
        validStatus: () => !!this.form && this.metaDataForm.valid,
        category: CharityUpdateSection.META_DATA,
        isTouchedOrDirty: () => true,
        index: 1
      },
      {
        name: 'contactInformationTab',
        template: tabsTemplates[2],
        title: this.lang.map.contact_information,
        langKey: 'contact_information',
        validStatus: () => !!this.form && this.contactInformationForm.valid,
        category: CharityUpdateSection.META_DATA,
        isTouchedOrDirty: () => true,
        index: 2
      },
      {
        name: 'complainceOfficerTab',
        template: tabsTemplates[3],
        title: this.lang.map.complaince_office_data,
        langKey: 'complaince_office_data',
        validStatus: () => true,
        category: CharityUpdateSection.META_DATA,
        isTouchedOrDirty: () => true,
        index: 3
      },
      {
        name: 'liaisonOfficerTab',
        template: tabsTemplates[4],
        title: this.lang.map.liaison_office_data,
        langKey: 'liaison_office_data',
        validStatus: () => true,
        category: CharityUpdateSection.META_DATA,
        isTouchedOrDirty: () => true,
        index: 4
      },
      {
        name: 'banchTab',
        template: tabsTemplates[5],
        title: this.lang.map.internal_branches,
        langKey: 'internal_branches',
        validStatus: () => true,
        category: CharityUpdateSection.META_DATA,
        isTouchedOrDirty: () => true,
        index: 5
      },
      {
        name: 'externalBranchTab',
        template: tabsTemplates[6],
        title: this.lang.map.external_offices,
        langKey: 'external_offices',
        validStatus: () => true,
        category: CharityUpdateSection.META_DATA,
        isTouchedOrDirty: () => true,
        index: 6
      },
      {
        name: 'foundingMembersTab',
        template: tabsTemplates[7],
        title: this.lang.map.founding_members,
        langKey: 'founding_members',
        validStatus: () => true,
        category: CharityUpdateSection.ADMINISTRATIVE_DATA,
        isTouchedOrDirty: () => true,
        index: 7
      },
      {
        name: 'generalAssemblyMembersTab',
        template: tabsTemplates[8],
        title: this.lang.map.general_assembly_members,
        langKey: 'general_assembly_members',
        validStatus: () => true,
        category: CharityUpdateSection.ADMINISTRATIVE_DATA,
        isTouchedOrDirty: () => true,
        index: 8
      },
      {
        name: 'boardMembersTab',
        template: tabsTemplates[9],
        title: this.lang.map.board_members,
        langKey: 'board_members',
        validStatus: () => true,
        category: CharityUpdateSection.ADMINISTRATIVE_DATA,
        isTouchedOrDirty: () => true,
        index: 9
      },
      {
        name: 'executiveManagmentTab',
        template: tabsTemplates[10],
        title: this.lang.map.executive_management,
        langKey: 'executive_management',
        validStatus: () => true,
        category: CharityUpdateSection.ADMINISTRATIVE_DATA,
        isTouchedOrDirty: () => true,
        index: 10
      },
      {
        name: 'authorizedMembersTab',
        template: tabsTemplates[11],
        title: this.lang.map.authrized_members,
        langKey: 'authrized_members',
        validStatus: () => true,
        category: CharityUpdateSection.ADMINISTRATIVE_DATA,
        isTouchedOrDirty: () => true,
        index: 11
      },
      {
        name: 'realBenefeciariesTab',
        template: tabsTemplates[12],
        title: this.lang.map.real_benefeciaries,
        langKey: 'real_benefeciaries',
        validStatus: () => true,
        category: CharityUpdateSection.ADMINISTRATIVE_DATA,
        isTouchedOrDirty: () => true,
        index: 12
      },
      {
        name: 'primaryLawTab',
        template: tabsTemplates[13],
        title: this.lang.map.primary_law,
        langKey: 'primary_law',
        validStatus: () => this.primaryLawForm.valid,
        category: CharityUpdateSection.GOVERNANCE_DOCUMENTS,
        order: 0,
        isTouchedOrDirty: () => true,
        index: 13
      },
      {
        name: 'classifcationOfAidTab',
        template: tabsTemplates[14],
        title: this.lang.map.classification_of_foreign_aid,
        langKey: 'classification_of_foreign_aid',
        validStatus: () => true,
        category: CharityUpdateSection.GOVERNANCE_DOCUMENTS,
        order: 3,
        isTouchedOrDirty: () => true,
        index: 14
      },
      {
        name: 'workAreasTab',
        template: tabsTemplates[15],
        title: this.lang.map.work_areas,
        langKey: 'work_areas',
        validStatus: () => true,
        category: CharityUpdateSection.GOVERNANCE_DOCUMENTS,
        order: 4,
        isTouchedOrDirty: () => true,
        index: 15

      },
      {
        name: 'byLawsTab',
        template: tabsTemplates[16],
        title: this.lang.map.bylaws,
        langKey: 'bylaws',
        validStatus: () => true,
        category: CharityUpdateSection.GOVERNANCE_DOCUMENTS,
        order: 2,
        isTouchedOrDirty: () => true,
        index: 16
      },
      {
        name: 'riskReportsTab',
        template: tabsTemplates[17],
        title: this.lang.map.risk_reports,
        langKey: 'risk_reports',
        validStatus: () => true,
        category: CharityUpdateSection.COORDINATION_AND_CONTROL_REPORTS,
        isTouchedOrDirty: () => true,
        index: 17
      },

      {
        name: 'coordinationAndSupportsTab',
        template: tabsTemplates[18],
        title: this.lang.map.coordination_and_support_reports,
        langKey: 'coordination_and_support_reports',
        validStatus: () => true,
        category: CharityUpdateSection.COORDINATION_AND_CONTROL_REPORTS,
        isTouchedOrDirty: () => true,
        index: 18
      },

      {
        name: 'organizationsReportTab',
        template: tabsTemplates[19],
        title: this.lang.map.reports_received_from_organization,
        langKey: 'reports_received_from_organization',
        validStatus: () => true,
        category: CharityUpdateSection.COORDINATION_AND_CONTROL_REPORTS,
        isTouchedOrDirty: () => true,
        index: 19
      },
      {
        name: 'outgoingDecisionsTab',
        template: tabsTemplates[20],
        title: this.lang.map.decisions_by_organizations,
        langKey: 'decisions_by_organizations',
        validStatus: () => true,
        category: CharityUpdateSection.APPROVE_MEASURES_AND_PENALTIES,
        isTouchedOrDirty: () => true,
        index: 20
      },
      {
        name: 'internalDecisionsTab',
        template: tabsTemplates[21],
        title: this.lang.map.internal_decisions,
        langKey: 'internal_decisions',
        validStatus: () => true,
        category: CharityUpdateSection.APPROVE_MEASURES_AND_PENALTIES,
        isTouchedOrDirty: () => true,
        index: 21
      },
      {
        name: 'generalAssocationMeetingsTab',
        template: tabsTemplates[22],
        title: this.lang.map.meeting,
        langKey: 'meeting',
        category: CharityUpdateSection.GOVERNANCE_DOCUMENTS,
        validStatus: () => true,
        order: 1,
        isTouchedOrDirty: () => true,
        index: 22
      },
      {

        name: 'allOfEmployeesTabs',
        template: tabsTemplates[23],
        title: this.lang.map.all_employees,
        langKey: 'all_employees',
        category: CharityUpdateSection.ADMINISTRATIVE_DATA,
        validStatus: () => true,
        isTouchedOrDirty: () => true,
        index: 23
      }
    ];
    this.tabs = [this._tabs[0]];
    if (!this.accordionView) {
      this._tabs.push({
        name: 'attachmentsTab',
        template: tabsTemplates[tabsTemplates.length - 1],
        title: this.lang.map.attachments,
        langKey: 'attachments',
        validStatus: () => true,
        hideIcon: true,
        isTouchedOrDirty: () => true,
        index: (tabsTemplates.length - 1)
      });
      this.tabs.push(this._tabs[this._tabs.length - 1]);
    }
    this.buildingTabsDone = true;
    setTimeout(() => this.componentTabsListRef.tabListService.selectTabByIndex(0))
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
    private goveranceDocumentService: GoveranceDocumentService,
    private npoEmployeeService: NpoEmployeeService,
    private globalSettingsService: GlobalSettingsService
  ) {
    super();
    if (this.employeeService.isExternalUser()) {
      this._filterExternalUserRequestTypes();
    }
  }

  ngAfterViewInit(): void {
    const tabsTemplates = this.tabsTemplates.toArray();
    setTimeout(() => {
      this._buildTabs(tabsTemplates);
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
      } else if (this.employeeService.getInternalDepartment()?.code === 'LCN' && this.employeeService.isLicensingUser()) {
        this.readonly = !this.model.isReturned();
      }
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isCharityManager()) {
          this.readonly = false;
        } else if (this.employeeService.isCharityUser()) {
          this.readonly = !this.model.isReturned();
        } else if (this.employeeService.getInternalDepartment()?.code === 'LCN') {

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

  handleRequestTypeChange(updateSection: number, userInteraction: boolean = false): void {
    of(userInteraction)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.confirmChangeRequestType(userInteraction))
      ).subscribe((clickOn: UserClickOn) => {
        if (clickOn === UserClickOn.YES) {
          if (userInteraction) {
            this.resetForm$.next();
            this.updateSectionField.setValue(updateSection);
          }
          this.requestType$.next(updateSection);
          this.tabs = this._tabs.filter(
            (e) => !e?.category || e.category === updateSection
          );
          if (updateSection === CharityUpdateSection.META_DATA) {
            this._buildMetaDataForm(updateSection);
          } else if (updateSection === CharityUpdateSection.GOVERNANCE_DOCUMENTS) {
            this._buildPrimaryLawForm(updateSection);
            this.tabs = this.tabs.filter(e => ((!e?.order) || e.order <= 2));
            this.tabs.sort((a, b) => a.order - b.order);
          } else {
            this._buildForm(updateSection);
          }
        } else {
          this.updateSectionField.setValue(this.requestType$.value);
        }

        if (this.employeeService.isExternalUser() && !this.readonly) {
          const id = this.charityOrganizations[0]?.id;
          this.form.get('charityId')?.patchValue(id);
          this.handleSelectCharityOrganization(id);
          this.form.get('charityId')?.disable();

        }
        CommonUtils.displayFormValidity(this.form, 'main-content');
      });


  }

  toDate(date: IMyDateModel) {
    return DateUtils.getDateStringFromDate(date);
  }

  handleSelectCharityOrganization(id: number): void {
    if (!id) {
      return;
    }
    const charity = this.charityOrganizations.find(e => e.id === id)!;
    const updateSection = this.updateSectionField.value;
    if (updateSection === CharityUpdateSection.META_DATA) {
      const model = this.charityOrganizationService.getByIdComposite(id);
      model.subscribe((m) => {
        this._updateForm(m.toCharityOrganizationUpdate());
        this.charityOrganizationService.getLogoBy({ charityId: charity.profileId }).subscribe(logo => {
          if (logo.blob.size === 0) {
            this.loadedLogo = undefined;
            return;
          }
          this.loadedLogo = logo;
          this.logoFile = this.loadedLogo.toFile();
        });
      });
      this.externalOffices$ = this.finalOfficeApproval.licenseSearch({
        organizationId: id,
      });
    } else if (updateSection === CharityUpdateSection.ADMINISTRATIVE_DATA) {
      this.memberRoleService.getMembersOfCharity(id).subscribe((m) => {
        this.members = Object.entries(m).reduce((prev, [key, value]) => {
          if (!Array.isArray(value)) {
            return prev;
          }
          if (key == CharityRole.CURRENT_EXECUTIVE_MANAGEMENT.toString()) {
            return {
              ...prev,
              [key]: value.map((member) => new OrgExecutiveMember().clone({ ...member as OrgExecutiveMember }).toCharityOrganizationOrgMember()
              ),
            };
          } else {
            return {
              ...prev,
              [key]: value.map((member) => new OrgMember().clone({ ...member as OrgMember }).toCharityOrganizationOrgMember()
              ),
            };
          }
        }, {});
        this._loadEmployees(charity.profileId);
        this.realBeneficiaryService
          .getRealBenficiaryOfCharity(id)
          .subscribe((realBenefeciaries) => {
            this.realBenefeciaries = realBenefeciaries.map(realBenefeciary => realBenefeciary.toCharityOrganizationRealBenficiary());
            this.model = new CharityOrganizationUpdate().clone({
              ...this.model,
              boardMemberList: this.listMembers(CharityRole.BOARD_MEMBERS),
              founderMemberList: this.listMembers(CharityRole.FOUNDER_MEMBERS),
              generalAssemblyMemberList: this.listMembers(CharityRole.GENERAL_ASSEMBLY_MEMBERS),
              authorizedSignatoryMemberList: this.listMembers(CharityRole.AUTHORIZED_MEMBERS),
              currentExecutiveManagementList: this.listExecutiveMembers(CharityRole.CURRENT_EXECUTIVE_MANAGEMENT),
              realBeneficiaryList: this.realBenefeciaries,
            });
          });
      });

    } else if (updateSection === CharityUpdateSection.GOVERNANCE_DOCUMENTS) {
      this.goveranceDocumentService.getByCharityId(id).subscribe(m => {
        if (m.length > 0) {
          const model = m[0].toCharityOrgnizationUpdate();
          model.arabicName = charity.arName;
          model.englishName = charity.enName;
          this._updateForm(model);
        }
      });
      this.organizationMeetings$ = this.meetingService.getMeetingsByCharityId(id);
    } else if (
      updateSection === CharityUpdateSection.COORDINATION_AND_CONTROL_REPORTS
    ) {
      this.charityReportService.getByCharityId(id).subscribe((charityReports) => {
        this.charityReports = charityReports.map(charityReport => new CharityReport().clone({ ...charityReport }).toCharityOrganizationUpdate());
        this.charityOrganizationService.getByIdComposite(id).subscribe((org) => {
          this.model = new CharityOrganizationUpdate().clone({
            ...this.model,
            riskReportList: this.riskCharityReport,
            incomingReportList: this.incomingCharityReport,
            coordinationSupportReport: this.supportCharityReport,
            registrationAuthority: org.profileInfo.registrationAuthority
          });
          this.form.get('registrationAuthority')?.setValue(org.profileInfo.registrationAuthorityInfo.getName())
        });
      });
    } else if (
      updateSection === CharityUpdateSection.APPROVE_MEASURES_AND_PENALTIES
    ) {
      this.charityDecisionService.getByCharityId(id).subscribe((charityDecisions) => {
        this.charityDecisions = charityDecisions.map(charityDecision => new CharityDecision().clone({ ...charityDecision }).toCharityOrganizationUpdate());
        this.model = new CharityOrganizationUpdate().clone({
          ...this.model,
          incomingDecisionList: this.incomingCharityDecisions,
          outgoingDecisionList: this.outgoingCharityDecisions,
        });
      });
    }
    charity && this._setModelNames(charity);
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
    this._loadCountries();
    this._loadCharities();
    this._buildContactInformationInputs();
    this.loadActivityTypes();
  }

  loadActivityTypes(): void {
    this.adminLookupService
      .loadAsLookups(AdminLookupTypeEnum.ACTIVITY_TYPE)
      .subscribe((list) => {
        this.activityTypes = list;
      });
  }

  _buildForm(updateSection?: number): void {
    const model = this._getNewInstance().clone({
      updateSection,
    });
    this.form = this.fb.group({
      ...model.getFirstPageForm(),
    });
  }

  _buildMetaDataForm(updateSection: number): void {
    const model = this._getNewInstance().clone({
      updateSection,
    });
    this.form = this.fb.group({
      metaData: this.fb.group(model.buildMetaDataForm()),
      contactInformation: this.fb.group(model.buildContactInformationForm()),
      ...model.getFirstPageForm(),
    });
  }

  _buildPrimaryLawForm(updateSection: number) {
    const model = this._getNewInstance().clone({
      updateSection,
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
    if ((!this.logoFile && !this.loadedLogo) && this.updateSectionField.value === CharityUpdateSection.META_DATA) {
      this.toast.error(this.lang.map.logo_is_required);
      return false;
    }
    return this.form.valid;
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return true;
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  isCoordinationAndControlReports() {
    return this.updateSectionField.value == CharityUpdateSection.COORDINATION_AND_CONTROL_REPORTS;
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
    if (this.updateSectionField.value === CharityUpdateSection.META_DATA) {
      const arr = this.organizationRefs.toArray();
      charityOfficers = arr[1].list || [];
      complianceOfficers = arr[0].list || [];
      branchList = arr[2].list || [];
      metaDataValue = {
        ...this.contactInformationForm.value,
        ...this.metaDataForm.value,
      };
    } else if (
      this.updateSectionField.value === CharityUpdateSection.ADMINISTRATIVE_DATA
    ) {
      const arr = this.membersRefs.toArray();
      founderMemberList = arr[0].list || [];
      generalAssemblyMemberList = arr[1].list || [];
      boardMemberList = arr[2].list || [];
      currentExecutiveManagementList = arr[3].list || [];
      authorizedSignatoryMemberList = arr[4].list || [];
      realBeneficiaryList = arr[5].list || [];
    } else if (this.updateSectionField.value === CharityUpdateSection.GOVERNANCE_DOCUMENTS) {
      const arr = this.goverRefs.toArray();
      primaryLawValue = { ...this.primaryLawForm.value };
      wFClassificationList = arr[0].list || [];
      workAreaObjectList = arr[1].list || [];
      byLawList = arr[2].list || [];
    } else if (this.updateSectionField.value === CharityUpdateSection.COORDINATION_AND_CONTROL_REPORTS) {
      const arr = this.reportRefs.toArray();
      riskReportList = arr[0].list || [];
      coordinationSupportReport = arr[1].list || [];
      incomingReportList = arr[2].list || [];
    } else if (this.updateSectionField.value === CharityUpdateSection.APPROVE_MEASURES_AND_PENALTIES) {
      const arr = this.decisionsRefs.toArray();
      outgoingDecisionList = arr[0].list || [];
      incomingDecisionList = arr[1].list || [];
    }

    return new CharityOrganizationUpdate().clone({
      ...this.model,
      ...metaDataValue,
      updateSection: this.updateSectionField.value,
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

  _afterSaveMessage(model: CharityOrganizationUpdate,
    saveType: SaveTypes,
    operation: OperationTypes) {
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  private loadCaseById(): Observable<CharityOrganizationUpdate | undefined> {
    if (!this.model?.id) {
      return of(undefined);
    }
    return this.service.getById(this.model?.id);
  }

  _afterSave(
    model: CharityOrganizationUpdate,
    saveType: SaveTypes,
    operation: OperationTypes
  ): void {
    this.model = model;

    if (this.logoFile) {
      this.service.saveLogo(this.model.id, this.logoFile!)
        .pipe(
          switchMap(() => this.loadCaseById()),
          map((data) => this.model = data)
        ).subscribe(id => {
          this._afterSaveMessage(model, saveType, operation);
        });
    } else {
      this._afterSaveMessage(model, saveType, operation);
    }

  }

  _saveFail(error: any): void {
  }

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
    if (!model) {
      return;
    }
    this.model = model;
    if(this.operation == this.operationTypes.CREATE) {
      const interceptor = new CharityOrganizationUpdateInterceptor();
      this.model.initialVersion = JSON.stringify(interceptor.send(this.model));
    }
    if (!this.buildingTabsDone) {
      return;
    }
    if (this.model.updateSection) {
      this.updateSectionField.patchValue(this.model.updateSection);
      this.handleRequestTypeChange(this.model.updateSection);
    }
    if (this.model.charityId) {
      this.form.get('charityId')?.patchValue(this.model.charityId);
      if (!this.externalOffices$) {
        this.externalOffices$ = this.finalOfficeApproval.licenseSearch({
          organizationId: this.model.charityId,
        });
      }
      this.organizationMeetings$ = this.meetingService.getMeetingsByCharityId(this.model.charityId);

      this._loadEmployees(this.model.charityId);
    }
    if (this.model?.id) {
      this.service.loadLogoByCaseId(this.model?.id).subscribe(logo => {
        if (logo.blob.size === 0) {
          this.loadedLogo = undefined;
          return;
        }
        this.loadedLogo = logo;
      });
    }
    if ((this.updateSectionField.value === CharityUpdateSection.META_DATA) || (this.model.updateSection === CharityUpdateSection.META_DATA)) {
      this.metaDataForm?.patchValue(model!.buildMetaDataForm(false));
      this.contactInformationForm?.patchValue(
        model!.buildContactInformationForm(false)
      );
      ((model?.registrationAuthorityInfo) && (this.metaDataForm.get('registrationAuthority')?.patchValue(model?.registrationAuthorityInfo?.getName())));

    } else if ((this.updateSectionField.value === CharityUpdateSection.GOVERNANCE_DOCUMENTS) || (this.model.updateSection === CharityUpdateSection.GOVERNANCE_DOCUMENTS)) {
      this.primaryLawForm.patchValue(model!.buildPrimaryLawForm(false));
    } else if (this.updateSectionField.value === CharityUpdateSection.COORDINATION_AND_CONTROL_REPORTS) {
      this.charityOrganizationService.getByIdComposite(this.model.charityId).subscribe((org) => {
        this.model = new CharityOrganizationUpdate().clone({
          ...this.model,
          riskReportList: this.model?.riskReportList,
          incomingReportList: this.model?.incomingReportList,
          coordinationSupportReport: this.model?.coordinationSupportReport,
          registrationAuthority: org.profileInfo.registrationAuthority
        });
        this.form.get('registrationAuthority')?.setValue(org.profileInfo.registrationAuthorityInfo.getName())
      });
    }

    this.cd.detectChanges();
  }


  _resetForm(): void {
    this.tabs = this._tabs.filter(tab => !tab.category);
    //this.handleRequestTypeChange(undefined!);
    this.form.reset();
  }

}
