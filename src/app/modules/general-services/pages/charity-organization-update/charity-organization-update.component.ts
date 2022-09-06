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
import { CharityRequestType } from '@app/enums/charity-request-type.enum';
import { CharityRole } from '@app/enums/charity-role.enum';
import { FileExtensionsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { DateUtils } from '@app/helpers/date-utils';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { AdminLookup } from '@app/models/admin-lookup';
import { CharityOrganization } from '@app/models/charity-organization';
import { CharityOrganizationUpdate } from '@app/models/charity-organization-update';
import { FinalExternalOfficeApprovalResult } from '@app/models/final-external-office-approval-result';
import { OrgMember } from '@app/models/org-member';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { CharityOrganizationUpdateService } from '@app/services/charity-organization-update.service';
import { CharityOrganizationService } from '@app/services/charity-organization.service';
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
  constructor(
    public lang: LangService,
    public fb: UntypedFormBuilder,
    public service: CharityOrganizationUpdateService,
    private adminLookupService: AdminLookupService,
    public lookupService: LookupService,
    private charityOrganizationService: CharityOrganizationService,
    private memberRoleService: MemberRoleService,
    private finalOfficeApproval: FinalExternalOfficeApprovalService,
    private realBeneficiaryService: RealBeneficiaryService
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
      .loadAsLookup(AdminLookupTypeEnum.ACTIVITY_TYPE)
      .subscribe((list) => {
        this.activityTypes = list;
      });
  }
  _buildForm(): void {
    const model = this._getNewInstance();
    this.form = this.fb.group({
      metaData: this.fb.group(model.buildMetaDataForm()),
      contactInformation: this.fb.group(model.buildContactInformationForm()),
      primaryLaw: this.fb.group(model.buildPrimaryLawForm()),
      ...model.getFirstPageForm(),
    });
    console.log(this.form.get('primaryLaw.goals'))
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
