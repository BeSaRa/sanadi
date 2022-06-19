import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Followup } from '@app/models/followup';
import { Team } from '@app/models/team';
import { LookupService } from '@app/services/lookup.service';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { Observable } from 'rxjs';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { FollowupService } from '@app/services/followup.service';
import { LangService } from '@app/services/lang.service';
import { IAngularMyDpOptions } from 'angular-mydatepicker';
import { DateUtils } from '@app/helpers/date-utils';
import { FollowupConfiguration } from "@app/models/followup-configuration";
import { CaseModel } from "@app/models/case-model";
import { EmployeeService } from "@services/employee.service";

@Component({
  selector: 'followup-popup',
  templateUrl: './followup-popup.component.html',
  styleUrls: ['./followup-popup.component.scss']
})
export class FollowupPopupComponent extends AdminGenericDialog<Followup> {
  @Input()
  followupConfigurations: FollowupConfiguration[] = []

  selectedConfig?: FollowupConfiguration

  @Input()
  case?: CaseModel<any, any>;

  form: FormGroup = new FormGroup({});
  followup!: Followup;
  teams!: Team[];
  model: Followup = new Followup();
  saveVisible = true;
  operation!: OperationTypes;
  @Output() hideForm: EventEmitter<any> = new EventEmitter<any>();
  dateOptions: IAngularMyDpOptions = DateUtils.getDatepickerOptions({
    disablePeriod: 'past'
  });

  constructor(public fb: FormBuilder,
              private lookupService: LookupService,
              private employeeService: EmployeeService,
              public dialogRef: DialogRef,
              public service: FollowupService,
              public lang: LangService,) {
    super();
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(model: Followup, dialogRef: DialogRef): void {
    this.hideForm.emit();
  }

  beforeSave(model: Followup, form: FormGroup): Observable<boolean> | boolean {
    return true;
  }

  destroyPopup(): void {
  }

  initPopup(): void {
    this.listenToSelectedConfiguration()
  }

  prepareModel(model: Followup, form: FormGroup): Observable<Followup> | Followup {
    const newModel = new Followup().clone({
      ...this.form.getRawValue(),
      custom: true,
      concernedTeamId: this.selectedConfig?.concernedTeamId,
      responsibleTeamId: this.selectedConfig?.responsibleTeamId,
      followUpType: this.selectedConfig?.followUpType,
      followUpConfigrationId: this.selectedConfig?.id,
      serviceId: this.selectedConfig?.serviceId,
      orgId: this.employeeService.isExternalUser() ? this.employeeService.getOrgUnit()?.id : -1,
      fullSerial: this.case?.fullSerial
    });
    newModel.caseId = this.case!.id;
    return newModel;
  }

  saveFail(error: Error): void {
  }

  cancel() {
    this.hideForm.emit();
  }

  get followUpConfigId(): AbstractControl {
    return this.form.get('followUpConfigrationId')!
  }

  listenToSelectedConfiguration(): void {
    this.followUpConfigId
      .valueChanges
      .subscribe((value: number) => {
        this.selectedConfig = this.followupConfigurations.find(item => item.id === value)
      })
  }
}
