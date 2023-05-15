import { UserPreferencesInterceptor } from '@model-interceptors/user-preferences-interceptor';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { DateUtils } from '@app/helpers/date-utils';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ISetVacationData } from '@app/interfaces/i-set-vacation-data';
import { ExternalUser } from '@app/models/external-user';
import { InternalUser } from '@app/models/internal-user';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerOptionsMap } from '@app/types/types';
import { UserPreferences } from '@models/user-preferences';

@Component({
    selector: 'set-vacation-popup',
    templateUrl: 'set-vacation-popup.component.html',
    styleUrls: ['set-vacation-popup.component.scss']
})
export class SetVacationPopupComponent implements OnInit {

  constructor(
    private fb : FormBuilder,
    @Inject(DIALOG_DATA_TOKEN) data: IDialogData<ISetVacationData>,
    public lang:LangService,
    private toast: ToastService,
    public dialogRef: DialogRef,
    ) {
      this.model = data.model.userPreferences;
      this.canEditPreferences = data.model.canEditPreferences;
      this.user = data.model.user;

  }
  ngOnInit(): void {
    this.buildForm();
  }
  form!: UntypedFormGroup;
  model: UserPreferences;
  canEditPreferences: boolean = false;
  user: InternalUser | ExternalUser;
  datepickerOptionsMap: DatepickerOptionsMap = {
    vacationFrom: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
    vacationTo: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
  };
  get vacationFrom(): UntypedFormGroup {
    return this.form.get('vacationFrom') as UntypedFormGroup;
  }
  get vacationTo(): UntypedFormGroup {
    return this.form.get('vacationTo') as UntypedFormGroup;
  }
  isVacationTapValid():boolean{
    if(!this.vacationFrom.value && !this.vacationTo.value){
      return true;
    }
    if(!this.vacationFrom.value ){
      return false;
    }
    if(!this.vacationTo.value ){
      return false;
    }
    return  DateUtils.getTimeStampFromDate(this.vacationFrom.value)! < DateUtils.getTimeStampFromDate(this.vacationTo.value)!;
  }
  validateFieldsVisible = true;
  buildForm(): void {
    this.form = this.fb.group(this.model.buildVacationForm(true));
    this.vacationFrom.setValue(DateUtils.changeDateToDatepicker(this.model.vacationFrom));
    this.vacationTo.setValue(DateUtils.changeDateToDatepicker(this.model.vacationTo));
    this.vacationFrom.updateValueAndValidity();
    this.vacationTo.updateValueAndValidity();
  }
  save() {
    if (!this.canEditPreferences ) {
      return;
    }

    let updatedModel = new UserPreferences().clone({
      ...this.model,
      ...this.form.value,
    });
    updatedModel.updateUserVacation(this.user.generalUserId).subscribe(model => {
      if(!model){
        // this.toast.error(this.lang.map.err_invalid_date);
        this.dialogRef.close()
        return;
      }
      this.toast.success(this.lang.map.msg_save_success);
      const {receive} =new UserPreferencesInterceptor()
      this.model= receive(updatedModel);
      this.dialogRef.close(this.model);
    });
  }
}
