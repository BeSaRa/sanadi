import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ApprovalReason } from '@app/models/approval-reason';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-approval-reason-popup',
  templateUrl: './approval-reason-popup.component.html',
  styleUrls: ['./approval-reason-popup.component.scss']
})
export class ApprovalReasonPopupComponent implements OnInit {
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: ApprovalReason;
  viewOnly: boolean;

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: ApprovalReason,
    viewOnly: boolean,
  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.viewOnly = data.viewOnly;
  }
  ngOnInit() {
    this.form.patchValue(this.model);
  }
  mapFormTo(form: any): ApprovalReason {
    const model: ApprovalReason = new ApprovalReason().clone({ ...this.model, ...form });

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

}
