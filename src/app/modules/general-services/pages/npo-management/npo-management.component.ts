import { UserClickOn } from './../../../../enums/user-click-on.enum';
import { takeUntil, switchMap } from 'rxjs/operators';
import { NpoBankAccount } from './../../../../models/npo-bank-account';
import { NpoContactOfficer } from '@app/models/npo-contact-officer';
import { FounderMembers } from '@app/models/founder-members';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { NpoData } from './../../../../models/npo-data';
import { NpoDataService } from './../../../../services/npo-data.service';
import { NpoManagement } from './../../../../models/npo-management';
import { CommonUtils } from './../../../../helpers/common-utils';
import { CustomValidators } from './../../../../validators/custom-validators';
import { TabComponent } from './../../../../shared/components/tab/tab.component';
import { RealBeneficiariesComponent } from './../../shared/real-beneficiaries/real-beneficiaries.component';
import { BankService } from '@services/bank.service';
import { NpoBankAccountComponent } from './npo-bank-account/npo-bank-account.component';
import { FounderMembersComponent } from './founder-members/founder-members.component';
import { NpoContactOfficerComponent } from './npo-contact-officer/npo-contact-officer.component';
import { IMyInputFieldChanged } from 'angular-mydatepicker';
import { DateUtils } from './../../../../helpers/date-utils';
import { ReadinessStatus, DatepickerOptionsMap } from './../../../../types/types';
import { ILanguageKeys } from './../../../../interfaces/i-language-keys';
import { IKeyValue } from './../../../../interfaces/i-key-value';
import { AdminLookup } from './../../../../models/admin-lookup';
import { Lookup } from './../../../../models/lookup';
import { LookupService } from './../../../../services/lookup.service';
import { ServiceRequestTypes } from './../../../../enums/service-request-types';
import { OpenFrom } from './../../../../enums/open-from.enum';
import { CommonCaseStatus } from './../../../../enums/common-case-status.enum';
import { ToastService } from './../../../../services/toast.service';
import { DialogService } from './../../../../services/dialog.service';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { NpoManagementService } from './../../../../services/npo-management.service';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable, of } from 'rxjs';
import { EmployeeService } from '@app/services/employee.service';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { NPORequestType } from '@app/enums/npo-requestType.enum';
import { Bank } from '@app/models/bank';

@Component({
  selector: 'app-npo-management',
  templateUrl: './npo-management.component.html',
  styleUrls: ['./npo-management.component.scss']
})
export class NpoManagementComponent extends EServicesGenericComponent<
NpoManagement,
NpoManagementService
> {
  NPORequestTypesList: Lookup[] = this.lookupService.listByCategory.NPORequestType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  activityTypesList: AdminLookup[] = [];
  bankList: Bank[] = [];
  NpoList: NpoData[] = [];
  // Clearance Type & Disbandment Type
  NPODecisionsList: Lookup[] = this.lookupService.listByCategory.NPODecisions;
  // TODO! fill this list after done from admin
  registrationAuthoritiesList = []
  form!: UntypedFormGroup;
  npoIdField: UntypedFormControl = new UntypedFormControl();
  bankDetailsTabStatus: ReadinessStatus = 'READY';
  contactOfficersTabStatus: ReadinessStatus = 'READY';
  founderMemberTabStatus: ReadinessStatus = 'READY';
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
    contectInfo: {
      name: "contectInfoTab",
      langKey: "lbl_contact_info" as keyof ILanguageKeys,
      validStatus: () => this.contectInfo.valid,
    },
    founderMember: {
      name: "founderMemberTab",
      langKey: "lbl_founder_members" as keyof ILanguageKeys,
      validStatus: () => {
        return !this.founderMemberComponentRef || (this.founderMemberTabStatus === 'READY' && this.founderMemberComponentRef.list.length > 0);
      }
    },
    contactOfficer: {
      name: "contactOfficerTab",
      langKey: "contact_officers" as keyof ILanguageKeys,
      validStatus: () => {
        return !this.contactOfficerComponentRef || (this.contactOfficersTabStatus === 'READY' && this.contactOfficerComponentRef.list.length > 0);
      }
    },
    bankAccount: {
      name: "bankAccountTab",
      langKey: "bank_accounts" as keyof ILanguageKeys,
      validStatus: () => {
        return !this.bankAccountComponentRef || (this.bankDetailsTabStatus === 'READY' && this.bankAccountComponentRef.list.length > 0);
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
  constructor(
    public service: NpoManagementService,
    private lookupService: LookupService,
    public fb: UntypedFormBuilder,
    private toast: ToastService,
    private adminLookupService: AdminLookupService,
    private cd: ChangeDetectorRef,
    private npoDataService: NpoDataService,
    private bankService: BankService,
    private dialog: DialogService,
    private employeeService: EmployeeService,
    public lang: LangService) {
    super();
  }
  handleReadonly(): void {
    if (this.requestTypeField.value == NPORequestType.CANCEL || this.requestTypeField.value == NPORequestType.CLEARANCE || this.requestTypeField.value == NPORequestType.DISBANDMENT) {
      this.readonly = true;
    } else {
      this.readonly = false;
    }
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
  _getNewInstance(): NpoManagement {
    return new NpoManagement();
  }
  _initComponent(): void {
    this._buildForm();
    this.npoDataService.loadAsLookups().subscribe(data => {
      this.NpoList = data
    })
    this.bankService.loadAsLookups().subscribe((data) => {
      this.bankList = data;
    })
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.ACTIVITY_TYPE).subscribe((data: never[] | AdminLookup[]) => {
      this.activityTypesList = data;
    })
    if (this.isRegistrationAuthority) {
      this.npoIdField.setValue(
        8 // TODO!: set regestered user id
      )
    }
  }
  _buildForm(): void {
    const model = new NpoManagement().buildForm(true);
    this.form = new UntypedFormGroup({
      basicInfo: this.fb.group(model.basicInfo),
      contectInfo: this.fb.group(model.contectInfo),
    });
  }
  _afterBuildForm(): void {
    console.log('_afterBuildForm')
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
      ...this.contectInfo.value,
      // TODO!: fix this when finising the related admin page
      registrationAuthority: 0
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
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({ serial: model.fullSerial }));
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
      contectInfo: formModel.contectInfo
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
          this.requestTypeField.setValue(requestTypeValue);
          this.handleReadonly();
          if (this.isNew) {
            this._resetForm();
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
        this.setSelectedLicense(data)
      })
  }

  private setSelectedLicense(details: NpoData) {
    if (details) {
      let value: any = new NpoManagement();
      value.requestType = this.requestTypeField.value;
      value.objectDBId = details.id;
      value.arabicName = details.arName;
      value.englishName = details.enName;
      value.unifiedEconomicRecord = details.unifiedEconomicRecord;
      value.activityType = details.activityType;
      value.establishmentDate = details.establishmentDate;
      value.registrationAuthority = details.registrationAuthority;
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

      value.bankAccountList = details.bankAccountList.map((ba: any) => {
        const ob = new NpoBankAccount().clone({
          objectDBId: ba.id,
          iban: ba.iBAN,
          currency: ba.currency,
          accountNumber: ba.accountNumber,
          bankId: ba.bankId
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
          jobTitleId: co.jobTitleId,
        });
        return ob;
      });
      value.founderMemberList = details.founderList.map((f: any) => {
        const ob = new FounderMembers().clone({
          objectDBId: f.id,
          identificationNumber: f.qid,
          fullName: f.fullName,
          jobTitleId: f.jobTitleId,
          email: f.email,
          phone: f.phone,
          extraPhone: f.extraPhone,
          joinDate: f.joinDate,
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
          iDDate: rb.iDDate,
          passportDate: rb.passportDate,
          iDExpiryDate: rb.iDExpiryDate,
          passportExpiryDate: rb.passportExpiryDate,
          startDate: rb.startDate,
          lastUpdateDate: rb.lastUpdateDate,
          iddate: rb.iddate,
          idexpiryDate: rb.idexpiryDate,
        });
        return ob;
      });

      this._updateForm(value);
      this.setFieldsValidation();
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
    this.disbandmentTypeField.reset()
    this.disbandmentDateField?.setValidators([]);
    this.disbandmentDateField.reset()
    this.clearanceTypeField?.setValidators([]);
    this.clearanceTypeField.reset()
    this.clearanceNameField?.setValidators([]);
    this.clearanceNameField.reset()
    this.clearanceDateField?.setValidators([]);
    this.clearanceDateField.reset()

    this.registrationAuthorityField?.setValidators([]);
    const registrationAuthority = this.registrationAuthorityField.value;
    this.registrationAuthorityField.reset()
    this.registrationAuthorityField.setValue(registrationAuthority)

    this.registrationDateField?.setValidators([]);
    const registrationDate = this.registrationDateField.value;
    this.registrationDateField.reset()
    this.registrationDateField.setValue(registrationDate)

    this.registrationNumberField?.setValidators([]);
    const registrationNumber = this.registrationNumberField.value;
    this.registrationNumberField.reset()
    this.registrationNumberField.setValue(registrationNumber)

    this.establishmentDateField?.setValidators([]);
    const establishmentDate = this.establishmentDateField.value;
    this.establishmentDateField.reset()
    this.establishmentDateField.setValue(establishmentDate);
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
      // this.registrationAuthorityField.setValidators([])
      this.registrationDateField.setValidators([CustomValidators.required])
      this.registrationNumberField.setValidators([
        CustomValidators.required, Validators.maxLength(150),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH)
      ])
      this.establishmentDateField.setValidators([CustomValidators.required])
    }
  }
  get isRegistrationAuthority() {
    return true
  }
  get isNew() {
    return this.requestTypeField.value == NPORequestType.NEW
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
  get contectInfo() {
    return this.form.get('contectInfo') as UntypedFormGroup;
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
