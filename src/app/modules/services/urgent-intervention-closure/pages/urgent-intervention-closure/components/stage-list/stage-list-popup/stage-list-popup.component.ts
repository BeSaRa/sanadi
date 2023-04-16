import { Component, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Stage } from '@app/models/stage';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'stage-list-popup',
  templateUrl: './stage-list-popup.component.html',
  styleUrls: ['./stage-list-popup.component.scss']
})
export class StageListPopupComponent {
  form: UntypedFormGroup;
  readonly: boolean;
  viewOnly: boolean;
  editItem: boolean;
  
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  customValidators = CustomValidators
  constructor(@Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      viewOnly: boolean,
      editItem: boolean,

    },
    public lang: LangService,
    private dialogRef: DialogRef) {
      this.form = data.form;
      this.readonly = data.readonly;
      this.viewOnly = data.viewOnly;
      this.editItem = data.editItem;

  }
  mapFormTo(form: any): Stage {
    const model: Stage = new Stage().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
