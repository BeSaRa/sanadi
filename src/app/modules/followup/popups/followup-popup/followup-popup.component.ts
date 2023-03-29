import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
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
import { CaseModel } from "@app/models/case-model";
import { EmployeeService } from "@services/employee.service";
import { Lookup } from "@app/models/lookup";
import { TeamService } from "@services/team.service";
import { takeUntil } from "rxjs/operators";
import { FollowUpType } from "@app/enums/followUp-type.enum";
import {RequestTypeFollowupService} from '@services/request-type-followup.service';
import {ToastService} from '@services/toast.service';

@Component({
  selector: 'followup-popup',
  templateUrl: './followup-popup.component.html',
  styleUrls: ['./followup-popup.component.scss']
})
export class FollowupPopupComponent extends AdminGenericDialog<Followup> {
  @Input()
  case?: CaseModel<any, any>;

  form: UntypedFormGroup = new UntypedFormGroup({});
  followup!: Followup;
  teams!: Team[];
  model: Followup = new Followup();
  saveVisible = true;
  operation!: OperationTypes;
  @Output() hideForm: EventEmitter<any> = new EventEmitter<any>();
  dateOptions: IAngularMyDpOptions = DateUtils.getDatepickerOptions({
    disablePeriod: 'past'
  });

  requestTypes: Lookup[] =  [];
  followUpTypes: Lookup[] = this.lookupService.listByCategory.FollowUpType;

  constructor(public fb: UntypedFormBuilder,
              private lookupService: LookupService,
              private employeeService: EmployeeService,
              public dialogRef: DialogRef,
              public service: FollowupService,
              private teamService: TeamService,
              private toast: ToastService,
              private requestTypeFollowupService: RequestTypeFollowupService,
              public lang: LangService,) {
    super();
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(model: Followup, dialogRef: DialogRef): void {
    this.toast.success(this.lang.map.msg_save_success);
    this.hideForm.emit();
  }

  beforeSave(model: Followup, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  destroyPopup(): void {
  }

  initPopup(): void {
    this.requestTypes = this.requestTypeFollowupService.serviceRequestTypes[this.case!.caseType] || [this.requestTypeFollowupService.getNewRequestType()];
    this.listenToFollowupTypeChange()
    this.teamService.loadAsLookups()
      .pipe(takeUntil(this.destroy$))
      .subscribe((teams) => {
        this.teams = teams
      })
  }

  prepareModel(model: Followup, form: UntypedFormGroup): Observable<Followup> | Followup {
    const newModel = new Followup().clone({
      ...this.form.getRawValue(),
      custom: true,
      caseType: this.case?.caseType,
      fullSerial: this.case?.fullSerial,
      orgId: this.case?.organizationId
    });
    newModel.caseId = this.case!.id;
    return newModel;
  }

  saveFail(error: Error): void {
  }

  cancel() {
    this.hideForm.emit();
  }

  get followupTypeField(): AbstractControl {
    return this.form.get('followUpType')!
  }

  get responsibleTeamIdField(): AbstractControl {
    return this.form.get('responsibleTeamId')!
  }

  get concernedTeamIdField(): AbstractControl {
    return this.form.get('concernedTeamId')!
  }

  disableRightTeams(type: FollowUpType): void {
    if (type === FollowUpType.EXTERNAL) {
      this.responsibleTeamIdField.enable()
      this.concernedTeamIdField.disable()
      this.concernedTeamIdField.patchValue(null)
    } else {
      this.concernedTeamIdField.enable()
      this.responsibleTeamIdField.disable()
      this.responsibleTeamIdField.patchValue(null)
    }
  }

  listenToFollowupTypeChange(): void {
    this.followupTypeField.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: FollowUpType) => {
        this.disableRightTeams(value)
      })
  }
}
