import { ServiceRequestTypes } from './../../../../enums/service-request-types';
import { OpenFrom } from './../../../../enums/open-from.enum';
import { CommonCaseStatus } from './../../../../enums/common-case-status.enum';
import { ToastService } from './../../../../services/toast.service';
import { DialogService } from './../../../../services/dialog.service';
import { tap, filter } from 'rxjs/operators';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { NpoManagementService } from './../../../../services/npo-management.service';
import { NpoManagement } from './../../../../models/npo-management';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { LangService } from '@app/services/lang.service';
import { Observable, of } from 'rxjs';
import { EmployeeService } from '@app/services/employee.service';

@Component({
  selector: 'app-npo-management',
  templateUrl: './npo-management.component.html',
  styleUrls: ['./npo-management.component.scss']
})
export class NpoManagementComponent extends EServicesGenericComponent<
NpoManagement,
NpoManagementService
> {
  form!: UntypedFormGroup;
  constructor(
    public service: NpoManagementService,
    public fb: UntypedFormBuilder,
    private toast: ToastService,
    private cd: ChangeDetectorRef,
    private dialog: DialogService,
    private employeeService: EmployeeService,
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
  }
  _buildForm(): void {
    const model = new NpoManagement();
    this.form = new UntypedFormGroup({
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
    return new NpoManagement().clone({
      ...this.model,
    })
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
  }
  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }
  get requestTypeField(): UntypedFormControl {
    return this.form.get('requestType') as UntypedFormControl;
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
  _destroyComponent(): void {
  }
}
