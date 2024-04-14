import {AdminResult} from '@models/admin-result';
import {Profile} from '@models/profile';
import {ProfileService} from '@app/services/profile.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {switchMap, takeUntil} from 'rxjs/operators';
import {NpoBankAccount} from '@models/npo-bank-account';
import {NpoContactOfficer} from '@app/models/npo-contact-officer';
import {FounderMembers} from '@app/models/founder-members';
import {RealBeneficiary} from '@app/models/real-beneficiary';
import {NpoData} from '@models/npo-data';
import {NpoDataService} from '@services/npo-data.service';
import {NpoManagement} from '@models/npo-management';
import {CommonUtils} from '@helpers/common-utils';
import {CustomValidators} from '@app/validators/custom-validators';
import {TabComponent} from '@app/shared/components/tab/tab.component';
import {
  RealBeneficiariesComponent
} from '@modules/services/shared-services/components/real-beneficiaries/real-beneficiaries.component';
import {NpoBankAccountComponent} from './npo-bank-account/npo-bank-account.component';
import {FounderMembersComponent} from './founder-members/founder-members.component';
import {NpoContactOfficerComponent} from './npo-contact-officer/npo-contact-officer.component';
import {IMyInputFieldChanged} from 'angular-mydatepicker';
import {DateUtils} from '@helpers/date-utils';
import {DatepickerOptionsMap, ReadinessStatus} from '@app/types/types';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {IKeyValue} from '@contracts/i-key-value';
import {AdminLookup} from '@models/admin-lookup';
import {Lookup} from '@models/lookup';
import {LookupService} from '@services/lookup.service';
import {NPORequestType, ServiceRequestTypes} from '@app/enums/service-request-types';
import {OpenFrom} from '@app/enums/open-from.enum';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {ToastService} from '@services/toast.service';
import {DialogService} from '@services/dialog.service';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {NpoManagementService} from '@services/npo-management.service';
import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {LangService} from '@app/services/lang.service';
import {Observable, of} from 'rxjs';
import {EmployeeService} from '@app/services/employee.service';
import {AdminLookupService} from '@app/services/admin-lookup.service';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {ProfileTypes} from '@app/enums/profile-types.enum';

@Component({
  selector: 'app-npo-management',
  templateUrl: './npo-management.component.html',
  styleUrls: ['./npo-management.component.scss']
})
export class NpoManagementComponent extends EServicesGenericComponent<NpoManagement, NpoManagementService> {
  NPORequestTypes = NPORequestType;
  NPORequestTypesList: Lookup[] = this.lookupService.listByCategory.NPORequestType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  activityTypesList: AdminLookup[] = [];
  NpoList: NpoData[] = [];
  NPODecisionsList: Lookup[] = this.lookupService.listByCategory.NPODecisions;
  registrationAuthoritiesList: Profile[] = []
  form!: UntypedFormGroup;
  npoIdField: UntypedFormControl = new UntypedFormControl();
  bankDetailsTabStatus: ReadinessStatus = 'READY';
  realBeneficiaryTabStatus: ReadinessStatus = 'READY';
  @ViewChild('bankAccountsTab') bankAccountComponentRef!: NpoBankAccountComponent;
  @ViewChild('contactOfficersTab') contactOfficerComponentRef!: NpoContactOfficerComponent;
  @ViewChild('founderMemberTab') founderMemberComponentRef!: FounderMembersComponent;
  @ViewChild('realBeneficiaryTab') RealBeneficiariesComponentRef!: RealBeneficiariesComponent;

  tabsData: IKeyValue = {
    basicInfo: {
      name: "basicInfoTab",
      langKey: "lbl_basic_info" as keyof ILanguageKeys,
      validStatus: () => this.basicInfo.valid,
    },
    contactInfo: {
      name: "contactInfoTab",
      langKey: "lbl_contact_info" as keyof ILanguageKeys,
      validStatus: () => this.contactInfo.valid && (!this.contactOfficerComponentRef || this.contactOfficerComponentRef.list.length > 0),
    },
    founderMember: {
      name: "founderMemberTab",
      langKey: "lbl_founder_members" as keyof ILanguageKeys,
      validStatus: () => {
        return !this.founderMemberComponentRef || this.founderMemberComponentRef.list.length > 0;
      }
    },
    bankAccount: {
      name: "bankAccountTab",
      langKey: "bank_accounts" as keyof ILanguageKeys,
      validStatus: () => {
        return !this.bankAccountComponentRef || this.bankAccountComponentRef.list.length > 0;
      }
    },
    realBeneficiary: {
      name: "realBeneficiaryTab",
      langKey: "lbl_real_beneficiary" as keyof ILanguageKeys,
      validStatus: () => {
        return !this.RealBeneficiariesComponentRef || (this.realBeneficiaryTabStatus === 'READY' && this.RealBeneficiariesComponentRef.list.length > 0);
      }
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
  };
  loadAttachments: boolean = false;
  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'future'
    }),
    disbandmentDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    clearanceDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    registrationDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'future'
    }),
  };

  constructor(public service: NpoManagementService,
              private lookupService: LookupService,
              public fb: UntypedFormBuilder,
              private toast: ToastService,
              private adminLookupService: AdminLookupService,
              private cd: ChangeDetectorRef,
              private npoDataService: NpoDataService,
              private dialog: DialogService,
              private employeeService: EmployeeService,
              private profileService: ProfileService,
              public lang: LangService) {
    super();
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
      if (this.employeeService.isExternalUser() && this.model.isReturned()) {
        this.readonly = false;
      }

    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isExternalUser() && this.model.isReturned()) {
          this.readonly = false;
        }

      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
   
    }
  }
  // handleReadonly(): void {
  //   // if record is new, no readonly (don't change as default is readonly = false)
  //   if (!this.model?.id) {
  //     return;
  //   }

  //   let caseStatus = this.model.getCaseStatus();
  //   if (caseStatus == CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION) {
  //     this.readonly = true;
  //     return;
  //   }
  //   if (this.openFrom === OpenFrom.USER_INBOX) {
  //     if (this.employeeService.isCharityManager()) {
  //       this.readonly = false;
  //     } else if (this.employeeService.isCharityUser()) {
  //       this.readonly = !this.model.isReturned();
  //     } else if (this.employeeService.isLicensingUser() && this.employeeService.getCurrentUser().generalUserId == this.model.creatorInfo.id) {
  //       this.readonly = !this.model.isReturned();
  //     }
  //   } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
  //     // after claim, consider it same as user inbox and use same condition
  //     if (this.model.taskDetails.isClaimed()) {
  //       if (this.employeeService.isCharityManager()) {
  //         this.readonly = false;
  //       } else if (this.employeeService.isCharityUser()) {
  //         this.readonly = !this.model.isReturned();
  //       }
  //     }
  //   } else if (this.openFrom === OpenFrom.SEARCH) {
  //     // if saved as draft, then no readonly
  //     if (this.model?.canCommit()) {
  //       this.readonly = false;
  //     }
  //   }
  // }

  _getNewInstance(): NpoManagement {
    return new NpoManagement();
  }

  _initComponent(): void {
    this._buildForm();
    this.handleReadonly();
    this.profileService.getByRegistrationAuthorities().subscribe((data: any) => {
      this.registrationAuthoritiesList = data
    })
    this.npoDataService.loadActiveAsLookup().subscribe(data => {
      this.NpoList = data.filter(npo => !this.isRegistrationAuthority || npo.profileInfo.registrationAuthority == this.employeeService.getProfile()?.id)
    })
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.ACTIVITY_TYPE).subscribe((data: never[] | AdminLookup[]) => {
      this.activityTypesList = data;
    })
    if (this.nonProfitOrg)
      this.npoIdField.setValue(
        this.employeeService.getProfile()?.profileDetails.entityId
      );
  }

  _buildForm(): void {
    const model = new NpoManagement().buildForm(true);
    this.form = new UntypedFormGroup({
      basicInfo: this.fb.group(model.basicInfo),
      contactInfo: this.fb.group(model.contactInfo),
    });
  }

  _afterBuildForm(): void {
    this.handleReadonly();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    const invalidTabs = this._getInvalidTabs();
    if (invalidTabs.length > 0) {
      const listHtml = CommonUtils.generateHtmlList(this.lang.map.msg_following_tabs_valid, invalidTabs);
      this.dialog.error(listHtml.outerHTML);
      return false;
    }
    return true;
  }

  private _getInvalidTabs(): any {
    let failedList: string[] = [];
    for (const key in this.tabsData) {
      // if (!(this.tabsData[key].formStatus() && this.tabsData[key].listStatus())) {
      if (!(this.tabsData[key].validStatus())) {
        // @ts-ignore
        failedList.push(this.lang.map[this.tabsData[key].langKey]);
      }
    }
    return failedList;
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): NpoManagement | Observable<NpoManagement> {
    const value = new NpoManagement().clone({
      ...this.model,
      ...this.basicInfo.value,
      ...this.contactInfo.value,
      profileId: this.model?.profileId
    })
    value.bankAccountList = this.bankAccountComponentRef.list;
    value.contactOfficerList = this.contactOfficerComponentRef.list;
    value.founderMemberList = this.founderMemberComponentRef.list;
    value.realBeneficiaryList = this.RealBeneficiariesComponentRef.list;
    return value;
  }

  private _updateModelAfterSave(model: NpoManagement): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }

  _afterSave(model: NpoManagement, saveType: SaveTypes, operation: OperationTypes): void {
    this._updateModelAfterSave(model);
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {
    console.log('problem in save');
  }

  _launchFail(error: any): void {
    console.log('problem in launch');
  }

  _updateForm(model: NpoManagement | undefined): void {
    if (!model) {
      this.cd.detectChanges();
      return;
    }
    this.model = model;

    const formModel = model.buildForm();
    this.form.patchValue({
      basicInfo: formModel.basicInfo,
      contactInfo: formModel.contactInfo
    });

    this.cd.detectChanges();
    this.handleRequestTypeChange(model.requestType, false);
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this.setFieldsValidation();
          this._resetForm();
          this.requestTypeField.setValue(requestTypeValue);
          this.handleReadonly();
          if (this.isNew) {
            if (this.nonProfitOrg) {
              this.loadOrganizationData();
            } else if (this.isRegistrationAuthority) {
              this.registrationAuthorityField.setValue(this.employeeService.getProfile()?.id);
            }
          } else if (this.requestTypeField.value && this.npoIdField.value) {
            this.loadOrganizationData()
          }
        }
        this.requestType$.next(requestTypeValue);
      } else {
        this.requestTypeField.setValue(this.requestType$.value);
      }
    });
  }

  _setDefaultValues(): void {
    this.requestTypeField.setValue(ServiceRequestTypes.NEW);
    this.handleRequestTypeChange(ServiceRequestTypes.NEW, false);
    if (!this.nonProfitOrg)
      this.npoIdField.reset();
  }

  _resetForm(): void {
    this.form.reset();
    this.model = this._getNewInstance();
    this.operation = this.operationTypes.CREATE;
    this._setDefaultValues();
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

  loadOrganizationData() {
    this.npoDataService.loadCompositeById(this.npoIdField.value)
      .subscribe((data: any) => {
        if (this.nonProfitOrg && this.isNew)
          this.registrationAuthorityField.setValue(data.profileInfo?.registrationAuthority);
        else
          this.setSelectedLicense(data)
      })
  }

  get criticalOnTask() {
    return !!this.model?.id;
  }

  private setSelectedLicense(details: NpoData) {
    if (details) {
      let value: NpoManagement = new NpoManagement();
      value.requestType = this.requestTypeField.value;
      value.objectDBId = details.id;
      value.arabicName = details.arName;
      value.englishName = details.enName;
      value.unifiedEconomicRecord = details.unifiedEconomicRecord;
      value.activityType = details.activityType;
      value.establishmentDate = details.establishmentDate;
      value.registrationAuthority = details.profileInfo?.registrationAuthority;
      value.registrationDate = details.registrationDate;
      value.registrationNumber = details.registrationNumber;
      value.disbandmentType = details.disbandmentType;
      value.disbandmentDate = details.disbandmentDate;
      value.clearanceDate = details.clearanceDate;
      value.clearanceType = details.clearanceType;
      value.clearanceName = details.clearanceName;
      value.phone = details.phone;
      value.email = details.email;
      value.fax = details.fax;
      value.hotline = details.hotline;
      value.website = details.website;
      value.zoneNumber = details.zoneNumber;
      value.streetNumber = details.streetNumber;
      value.buildingNumber = details.buildingNumber;
      value.address = details.address;
      value.facebook = details.facebook;
      value.twitter = details.twitter;
      value.instagram = details.instagram;
      value.snapChat = details.snapChat;
      value.youTube = details.youTube;
      value.profileId = details.profileId;

      value.bankAccountList = details.bankAccountList.map((ba: any) => {
        const ob = new NpoBankAccount().clone({
          objectDBId: ba.id,
          iban: ba.iBAN,
          currency: ba.currency,
          accountNumber: ba.accountNumber,
          bankId: ba.bankId,
          bankInfo: (ba.bankInfo && (ba.bankInfo = AdminResult.createInstance(ba.bankInfo)))
        });
        return ob;
      });
      value.contactOfficerList = details.contactOfficerList.map((co: any) => {
        const ob = new NpoContactOfficer().clone({
          officerId: co.id,
          identificationNumber: co.qid,
          fullName: co.fullName,
          email: co.email,
          phone: co.phone,
          extraPhone: co.extraPhone,
          jobTitle: co.jobTitle,
        });
        return ob;
      });
      value.founderMemberList = details.founderList.map((f: any) => {
        const ob = new FounderMembers().clone({
          objectDBId: f.id,
          identificationNumber: f.qid,
          fullName: f.fullName,
          jobTitle: f.jobTitle,
          email: f.email,
          phone: f.phone,
          extraPhone: f.extraPhone,
          nationality: f.nationality,
        });
        return ob;
      });
      value.realBeneficiaryList = details.beneficiaryList.map((rb: any) => {
        const ob = new RealBeneficiary().clone({
          objectDBId: rb.id,
          arabicName: rb.arName,
          englishName: rb.enName,
          identificationNumber: rb.qid,
          birthDate: rb.birthDate,
          birthLocation: rb.birthLocation,
          nationality: rb.nationality,
          zoneNumber: rb.zoneNumber,
          streetNumber: rb.streetNumber,
          buildingNumber: rb.buildingNumber,
          address: rb.address,
          passportNumber: rb.passportNumber,
          idDate: rb.idDate,
          passportDate: rb.passportDate,
          idExpiryDate: rb.idExpiryDate,
          passportExpiryDate: rb.passportExpiryDate,
          startDate: rb.startDate,
          lastUpdateDate: rb.lastUpdateDate,
          birthDateString: rb.birthDate ? DateUtils.getDateStringFromDate(rb.birthDate, 'DEFAULT_DATE_FORMAT') : ''
        });
        return ob;
      });

      this.setFieldsValidation();
      this._updateForm(value);
      this.handleReadonly();
    }
  }

  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }

  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }

  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }

  _destroyComponent(): void {
  }

  onDateChange(event: IMyInputFieldChanged): void {
    DateUtils.setRelatedMinDate({
      fromFieldName: 'establishmentDate',
      toFieldName: 'clearanceDate',
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        licenseStartDate: this.establishmentDateField,
        licenseEndDate: this.clearanceDateField
      }
    });
    DateUtils.setRelatedMinDate({
      fromFieldName: 'establishmentDate',
      toFieldName: 'disbandmentDate',
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        licenseStartDate: this.establishmentDateField,
        licenseEndDate: this.disbandmentDateField
      }
    });
  }

  setFieldsValidation() {
    this.disbandmentTypeField?.setValidators([]);
    this.disbandmentDateField?.setValidators([]);
    this.clearanceTypeField?.setValidators([]);
    this.clearanceNameField?.setValidators([]);
    this.clearanceDateField?.setValidators([]);

    this.registrationAuthorityField?.setValidators([]);
    const registrationAuthority = this.registrationAuthorityField.value;

    this.registrationDateField?.setValidators([]);
    const registrationDate = this.registrationDateField.value;

    this.registrationNumberField?.setValidators([]);
    const registrationNumber = this.registrationNumberField.value;

    this.establishmentDateField?.setValidators([]);
    const establishmentDate = this.establishmentDateField.value;

    if (this.isClearance) {
      this.clearanceTypeField.setValidators([Validators.required])
      this.clearanceNameField.setValidators([CustomValidators.required, Validators.maxLength(150),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)])
      this.clearanceDateField.setValidators([CustomValidators.required])
    }
    if (this.isDisbandment) {
      this.disbandmentTypeField.setValidators([CustomValidators.required])
      this.disbandmentDateField.setValidators([CustomValidators.required])
    }
    if (this.isNew) {
      this.registrationAuthorityField.setValidators([CustomValidators.required])
      this.registrationDateField.setValidators([CustomValidators.required])
      this.registrationNumberField.setValidators([
        CustomValidators.required, Validators.maxLength(150),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ])
      this.establishmentDateField.setValidators([CustomValidators.required])
    }
    this.disbandmentTypeField.reset()
    this.disbandmentDateField.reset()
    this.clearanceTypeField.reset()
    this.clearanceNameField.reset()
    this.clearanceDateField.reset()
    this.registrationAuthorityField.reset()
    this.registrationAuthorityField.setValue(registrationAuthority)
    this.registrationDateField.reset()
    this.registrationDateField.setValue(registrationDate)
    this.registrationNumberField.reset()
    this.registrationNumberField.setValue(registrationNumber)
    this.establishmentDateField.reset()
    this.establishmentDateField.setValue(establishmentDate);
  }

  get userProfile() {
    return this.employeeService.getProfile()
  }

  get nonProfitOrg() {
    return this.employeeService.getProfile()?.profileType == ProfileTypes.NON_PROFIT_ORGANIZATIONS
  }

  get isRegistrationAuthority() {
    return this.employeeService.getProfile()?.profileType == ProfileTypes.REGISTERED_ENTITIES
  }

  get isViewOnly() {
    return this.isClearance || this.isDisbandment || this.isCancel
  }

  get isNew() {
    return this.requestTypeField.value == NPORequestType.NEW
  }

  get isCancel() {
    return this.requestTypeField.value == NPORequestType.CANCEL
  }

  get isClearance() {
    return this.requestTypeField.value == NPORequestType.CLEARANCE
  }

  get isDisbandment() {
    return this.requestTypeField.value == NPORequestType.DISBANDMENT
  }

  get isLicensingUser() {
    return this.employeeService.isLicensingUser()
  }

  get basicInfo() {
    return this.form.get('basicInfo') as UntypedFormGroup;
  }

  get contactInfo() {
    return this.form.get('contactInfo') as UntypedFormGroup;
  }

  get requestTypeField(): UntypedFormControl {
    return this.basicInfo.get('requestType') as UntypedFormControl;
  }

  get establishmentDateField() {
    return this.basicInfo.get('establishmentDate') as UntypedFormControl;
  }

  get registrationAuthorityField() {
    return this.basicInfo.get('registrationAuthority') as UntypedFormControl;
  }

  get registrationDateField() {
    return this.basicInfo.get('registrationDate') as UntypedFormControl;
  }

  get disbandmentTypeField() {
    return this.basicInfo.get('disbandmentType') as UntypedFormControl;
  }

  get disbandmentDateField() {
    return this.basicInfo.get('disbandmentDate') as UntypedFormControl;
  }

  get clearanceTypeField() {
    return this.basicInfo.get('clearanceType') as UntypedFormControl;
  }

  get clearanceNameField() {
    return this.basicInfo.get('clearanceName') as UntypedFormControl;
  }

  get clearanceDateField() {
    return this.basicInfo.get('clearanceDate') as UntypedFormControl;
  }

  get registrationNumberField() {
    return this.basicInfo.get('registrationNumber') as UntypedFormControl;
  }

}
