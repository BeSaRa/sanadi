import { BankService } from '@services/bank.service';
import { NpoBankAccountComponent } from './npo-bank-account/npo-bank-account.component';
import { RealBeneficiaryComponent } from './real-beneficiary/real-beneficiary.component';
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
import { tap, filter } from 'rxjs/operators';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { NpoManagementService } from './../../../../services/npo-management.service';
import { NpoManagement } from './../../../../models/npo-management';
import { Component, ChangeDetectorRef, ViewChild, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable, of } from 'rxjs';
import { EmployeeService } from '@app/services/employee.service';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { NPORequestType } from '@app/enums/npo-requestType.enum';

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
  bankList: Lookup[]= [];
  // Clearance Type & Disbandment Type
  NPODecisionsList: Lookup[] = this.lookupService.listByCategory.NPODecisions;
  // TODO! fill this list after done from admin
  registrationAuthoritiesList = []
  form!: UntypedFormGroup;
  bankDetailsTabStatus: ReadinessStatus = 'READY';
  contactOfficersTabStatus: ReadinessStatus = 'READY';
  founderMemberTabStatus: ReadinessStatus = 'READY';
  realBeneficiaryTabStatus: ReadinessStatus = 'READY';

  @ViewChild('bankAccountsTab') bankAccountComponentRef!: NpoBankAccountComponent;
  @ViewChild('contactOfficersTab') contactOfficerComponentRef!: NpoContactOfficerComponent;
  @ViewChild('founderMemberTab') founderMemberComponentRef!: FounderMembersComponent;
  @ViewChild('realBeneficiaryTab') realBeneficiaryComponentRef!: RealBeneficiaryComponent;

  tabsData: IKeyValue = {
    basicInfo: {
      name: "basicInfoTab",
      langKey: "lbl_basic_info" as keyof ILanguageKeys,
      validStatus: () => this.form.valid,
    },
    contectInfo: {
      name: "contectInfoTab",
      langKey: "lbl_contact_info" as keyof ILanguageKeys,
      validStatus: () => this.form.valid,
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
        return !this.realBeneficiaryComponentRef || (this.realBeneficiaryTabStatus === 'READY' && this.realBeneficiaryComponentRef.list.length > 0);
      }
    },
  };
  datepickerOptionsMap: DatepickerOptionsMap = {
    establishmentDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    disbandmentDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    clearanceDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
    registrationDate: DateUtils.getDatepickerOptions({
      disablePeriod: "none",
    }),
  };
  constructor(
    public service: NpoManagementService,
    private lookupService: LookupService,
    public fb: UntypedFormBuilder,
    private toast: ToastService,
    private adminLookupService: AdminLookupService,
    private cd: ChangeDetectorRef,
    private bankService: BankService,
    private dialog: DialogService,
    private employeeService: EmployeeService,
    public lang: LangService) {
    super();
  }
  handleReadonly(): void {
    if (this.requestTypeField.value == NPORequestType.Cancel || this.requestTypeField.value == NPORequestType.Clearance || this.requestTypeField.value == NPORequestType.Disbandment) {
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
    this.bankService.getBankLookup().subscribe((data) => {
      this.bankList = data;
    })
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.ACTIVITY_TYPE).subscribe((data: never[] | AdminLookup[]) => {
      this.activityTypesList = data;
    })
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
    return of(this.form.valid)
      .pipe(tap((valid) => !valid && this.invalidFormMessage()))
      .pipe(filter((valid) => valid))
  }
  _beforeLaunch(): boolean | Observable<boolean> {
    return !!this.model && this.form.valid && this.model.canStart();
  }
  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }
  _prepareModel(): NpoManagement | Observable<NpoManagement> {
    const value = new NpoManagement().clone({
      ...this.model,
    })
    value.bankAccountList = this.bankAccountComponentRef.list;
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
    this.model = model;
    if (!model) {
      this.cd.detectChanges();
      return;
    }
    // patch the form here
    this.form.patchValue({
    });

    this.handleRequestTypeChange(model.requestType, false);
    this.cd.detectChanges();
  }
  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this._resetForm();
      this.requestTypeField.setValue(requestTypeValue);
    }
    this.handleReadonly();
  }
  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }
  get requestTypeField(): UntypedFormControl {
    return this.basicInfo.get('requestType') as UntypedFormControl;
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
  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }
  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }
  _destroyComponent(): void {
  }
  onDateChange(event: IMyInputFieldChanged, fromFieldName: string, toFieldName: string): void {
    DateUtils.setRelatedMinMaxDate({
      fromFieldName,
      toFieldName,
      controlOptionsMap: this.datepickerOptionsMap,
      controlsMap: {
        // licenseStartDate: this.licenseStartDate,
        // licenseEndDate: this.licenseEndDate
      }
    });
  }
  get isRegistrationAuthority() {
    return false
  }
  get isNew() {
    return this.requestTypeField.value == NPORequestType.New
  }
  get isClearance() {
    return this.requestTypeField.value == NPORequestType.Clearance
  }
  get isDisbandment() {
    return this.requestTypeField.value == NPORequestType.Disbandment
  }
  get basicInfo() {
    return this.form.get('basicInfo') as UntypedFormGroup;
  }
  get contectInfo() {
    return this.form.get('contectInfo') as UntypedFormGroup;
  }
}
