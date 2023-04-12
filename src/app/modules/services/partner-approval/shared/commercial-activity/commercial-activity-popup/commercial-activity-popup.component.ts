import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { CommercialActivity } from '@app/models/commercial-activity';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'app-commercial-activity-popup',
  templateUrl: './commercial-activity-popup.component.html',
  styleUrls: ['./commercial-activity-popup.component.scss']
})
export class CommercialActivityPopupComponent implements OnInit {

  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: CommercialActivity;
  viewOnly: boolean;
  customValidators = CustomValidators;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: CommercialActivity,
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
  }

  mapFormTo(form: any): CommercialActivity {
    const model: CommercialActivity = new CommercialActivity().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
