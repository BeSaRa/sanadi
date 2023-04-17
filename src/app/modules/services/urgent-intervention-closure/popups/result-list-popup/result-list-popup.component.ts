import { Component, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Result } from '@app/models/result';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'result-list-popup',
  templateUrl: './result-list-popup.component.html',
  styleUrls: ['./result-list-popup.component.scss']
})
export class ResultListPopupComponent {
  form: UntypedFormGroup;
  readonly: boolean;
  viewOnly: boolean;
  editItem: boolean;
  model: Result;
  customValidators =CustomValidators

  constructor(@Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      viewOnly: boolean,
      editItem: boolean,
      model: Result,
      
    },
    public lang: LangService,
    private dialogRef: DialogRef) {
      this.form = data.form;
      this.readonly = data.readonly;
      this.viewOnly = data.viewOnly;
      this.editItem = data.editItem;
      this.model = data.model;
  }
  mapFormTo(form: any): Result {
    const model: Result = new Result().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
