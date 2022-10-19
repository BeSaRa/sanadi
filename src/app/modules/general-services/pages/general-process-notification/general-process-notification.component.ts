import { UserClickOn } from '@app/enums/user-click-on.enum';
import { takeUntil, switchMap } from 'rxjs/operators';
import { NpoManagement } from './../../../../models/npo-management';
import { EmployeeService } from '@app/services/employee.service';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { OpenFrom } from '@app/enums/open-from.enum';
import { ToastService } from '@app/services/toast.service';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DialogService } from './../../../../services/dialog.service';
import { CommonUtils } from '@app/helpers/common-utils';
import { GeneralProcessNotificationService } from './../../../../services/general-process-notification.service';
import { GeneralProcessNotification } from '@app/models/general-process-notification';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { Component, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-general-process-notification',
  templateUrl: './general-process-notification.component.html',
  styleUrls: ['./general-process-notification.component.scss']
})
export class GeneralProcessNotificationComponent extends EServicesGenericComponent<
GeneralProcessNotification,
GeneralProcessNotificationService
> {
  form!: UntypedFormGroup;

  tabsData: IKeyValue = {
    basicInfo: {
      name: "basicInfoTab",
      langKey: "lbl_basic_info" as keyof ILanguageKeys,
      validStatus: () => this.form.valid,
    },
    attachments: {
      name: 'attachmentsTab',
      langKey: 'attachments',
      validStatus: () => true
    },
  };
  constructor(
    public lang: LangService,
    private dialog: DialogService,
    private cd: ChangeDetectorRef,
    private toast: ToastService,
    public fb: UntypedFormBuilder,
    public service: GeneralProcessNotificationService,
    private employeeService: EmployeeService,
  ) {
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

  _getNewInstance(): GeneralProcessNotification {
    return new GeneralProcessNotification()
  }
  _initComponent(): void {
    this._buildForm();
    this.handleReadonly();
  }
  _buildForm(): void {
    this.form = this.fb.group({})
  }
  _afterBuildForm(): void {
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
  _prepareModel(): GeneralProcessNotification | Observable<GeneralProcessNotification> {
    const value = new GeneralProcessNotification().clone({
      ...this.model
    })
    return value;
  }
  private _updateModelAfterSave(model: GeneralProcessNotification): void {
    if ((this.openFrom === OpenFrom.USER_INBOX || this.openFrom === OpenFrom.TEAM_INBOX) && this.model?.taskDetails && this.model.taskDetails.tkiid) {
      this.service.getTask(this.model.taskDetails.tkiid)
        .subscribe((model) => {
          this.model = model;
        });
    } else {
      this.model = model;
    }
  }
  _afterSave(model: GeneralProcessNotification, saveType: SaveTypes, operation: OperationTypes): void {
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
  _updateForm(model: GeneralProcessNotification | undefined): void {
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
  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false) {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {

          this.resetForm$.next();
          this.requestTypeField.setValue(requestTypeValue);
          this.model!.requestType = requestTypeValue;
        }
        this.requestType$.next(requestTypeValue);
      } else {
        this.requestTypeField.setValue(this.requestType$.value);
      }
    });
  }
  _destroyComponent(): void {
  }
  _resetForm(): void {
    this.form.reset();
    this.operation = OperationTypes.CREATE;
  }
  get requestTypeField(): UntypedFormControl {
    return this.form.get("requestType") as UntypedFormControl;
  }
}
