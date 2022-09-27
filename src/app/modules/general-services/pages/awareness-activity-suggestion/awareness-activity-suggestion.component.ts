import { DatepickerOptionsMap } from './../../../../types/types';
import { DateUtils } from './../../../../helpers/date-utils';
import { EmployeeService } from './../../../../services/employee.service';
import { TabComponent } from './../../../../shared/components/tab/tab.component';
import { CommonCaseStatus } from './../../../../enums/common-case-status.enum';
import { ServiceRequestTypes } from './../../../../enums/service-request-types';
import { UserClickOn } from './../../../../enums/user-click-on.enum';
import { takeUntil, switchMap } from 'rxjs/operators';
import { OpenFrom } from './../../../../enums/open-from.enum';
import { IKeyValue } from './../../../../interfaces/i-key-value';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { CommonUtils } from './../../../../helpers/common-utils';
import { ToastService } from './../../../../services/toast.service';
import { DialogService } from './../../../../services/dialog.service';
import { LookupService } from './../../../../services/lookup.service';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { AwarenessActivitySuggestion } from './../../../../models/awareness-activity-suggestion';
import { AwarenessActivitySuggestionService } from './../../../../services/awareness-activity-suggestion.service';
import { Component, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-awareness-activity-suggestion',
  templateUrl: './awareness-activity-suggestion.component.html',
  styleUrls: ['./awareness-activity-suggestion.component.scss']
})
export class AwarenessActivitySuggestionComponent extends EServicesGenericComponent<
AwarenessActivitySuggestion,
AwarenessActivitySuggestionService
> {

  form!: UntypedFormGroup;

  tabsData: IKeyValue = {
    basicInfo: {
      name: "basicInfoTab",
      langKey: "lbl_basic_info" as keyof ILanguageKeys,
      validStatus: () => this.requestTypeField && this.requestTypeField.valid && this.activity.valid,
    },
    dataOfApplicant: {
      name: "dataOfApplicantTab",
      langKey: "lbl_data_of_applicant" as keyof ILanguageKeys,
      validStatus: () => this.dataOfApplicant.valid,
    },
    contactOfficer: {
      name: "contactOfficerTab",
      langKey: "contact_officer" as keyof ILanguageKeys,
      validStatus: () => this.contactOfficer.valid,
    },
    specialExplanations: {
      name: 'specialExplanationsTab',
      langKey: 'special_explanations',
      index: 3,
      validStatus: () => this.specialExplanationsField && this.specialExplanationsField.valid
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
  };
  loadAttachments: boolean = false;
  datepickerOptionsMap: DatepickerOptionsMap = {
    expectedDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'past'
    })
  };
  constructor(
    public lang: LangService,
    public fb: UntypedFormBuilder,
    public service: AwarenessActivitySuggestionService,
    private lookupService: LookupService,
    private toast: ToastService,
    private cd: ChangeDetectorRef,
    private dialog: DialogService,
    private employeeService: EmployeeService
  ) {
    super()
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
      // if saved as draft, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }
  _getNewInstance(): AwarenessActivitySuggestion {
    return new AwarenessActivitySuggestion();
  }
  _initComponent(): void {
  }
  _buildForm(): void {
    const model = new AwarenessActivitySuggestion().formBuilder(true)
    this.form = this.fb.group({
      requestType: model.requestType,
      description: model.description,
      dataOfApplicant: this.fb.group(model.dataOfApplicant),
      contactOfficer: this.fb.group(model.contactOfficer),
      activity: this.fb.group(model.activity),
    })
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
  _prepareModel(): AwarenessActivitySuggestion | Observable<AwarenessActivitySuggestion> {
    const value = new AwarenessActivitySuggestion().clone({
      ...this.model,
    })
    return value;
  }
  private _updateModelAfterSave(model: AwarenessActivitySuggestion): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }
  _afterSave(model: AwarenessActivitySuggestion, saveType: SaveTypes, operation: OperationTypes): void {
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
  _updateForm(model: AwarenessActivitySuggestion | undefined): void {
    if (!model) {
      this.cd.detectChanges();
      return;
    }
    this.model = model;
    const formModel = model.formBuilder();
    this.form.patchValue({
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
          this.requestTypeField.setValue(requestTypeValue);
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
  onTabChange($event: TabComponent) {
    this.loadAttachments = $event.name === this.tabsData.attachments.name;
  }
  getTabInvalidStatus(tabName: string): boolean {
    return !this.tabsData[tabName].validStatus();
  }
  _destroyComponent(): void {
  }

  openDateMenu(ref: any) {
    ref.toggleCalendar();
  }

  get dataOfApplicant(): UntypedFormGroup {
    return this.form.get('dataOfApplicant') as UntypedFormGroup;
  }
  get contactOfficer(): UntypedFormGroup {
    return this.form.get('contactOfficer') as UntypedFormGroup;
  }
  get activity(): UntypedFormGroup {
    return this.form.get('activity') as UntypedFormGroup;
  }

  get requestTypeField(): UntypedFormControl {
    return this.form.get('requestType') as UntypedFormControl;
  }
  get specialExplanationsField(): UntypedFormControl {
    return this.form.get('description') as UntypedFormControl;
  }
}
