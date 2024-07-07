import { Component, Inject, OnInit } from '@angular/core';
import { LangService } from "@services/lang.service";
import { DIALOG_DATA_TOKEN } from "@app/shared/tokens/tokens";
import { Followup } from "@app/models/followup";
import { IAngularMyDpOptions } from "@nodro7/angular-mydatepicker";
import { DateUtils } from "@helpers/date-utils";
import { UntypedFormControl } from "@angular/forms";
import { UserClickOn } from "@app/enums/user-click-on.enum";
import { DialogRef } from "@app/shared/models/dialog-ref";
import { ToastService } from "@services/toast.service";

@Component({
  selector: 'due-date-update-popup',
  templateUrl: './due-date-update-popup.component.html',
  styleUrls: ['./due-date-update-popup.component.scss']
})
export class DueDateUpdatePopupComponent implements OnInit {
  control: UntypedFormControl = new UntypedFormControl()
  private action: UserClickOn = UserClickOn.CANCEL

  dateOptions: IAngularMyDpOptions = DateUtils.getDatepickerOptions({
    disablePeriod: 'past',
    appendToBody: true
  });

  constructor(public lang: LangService,
              private dialogRef: DialogRef,
              private toast: ToastService,
              @Inject(DIALOG_DATA_TOKEN) private model: Followup) { }

  ngOnInit(): void {
    this.control.patchValue(DateUtils.changeDateToDatepicker(this.model.dueDate))
  }

  closeDialog(): void {
    this.dialogRef.close(this.action)
  }

  updateDate(): void {
    this.model.dueDate = DateUtils.changeDateFromDatepicker(this.control.value)!.toISOString();
    this.model.update()
      .subscribe(() => {
        this.action = UserClickOn.YES
        this.toast.success(this.lang.map.msg_update_x_success.change({ x: this.lang.map.due_date }))
        this.closeDialog()
      })
  }
}
