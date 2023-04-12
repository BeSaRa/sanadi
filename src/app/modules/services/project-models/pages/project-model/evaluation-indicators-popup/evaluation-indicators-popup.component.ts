import { Component, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { AdminLookup } from '@app/models/admin-lookup';
import { EvaluationIndicator } from '@app/models/evaluation-indicator';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'evaluation-indicators-popup',
  templateUrl: './evaluation-indicators-popup.component.html',
  styleUrls: ['./evaluation-indicators-popup.component.scss']
})
export class EvaluationIndicatorsPopupComponent {
  form: UntypedFormGroup;
  readonly: boolean;
  editIndex: number;
  model: EvaluationIndicator;
  indicators: AdminLookup[];

  constructor(@Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      editIndex: number,
      model: EvaluationIndicator,
      indicators: AdminLookup[];
    },
    public lang: LangService,
    private dialogRef: DialogRef) {
      this.form = data.form;
      this.readonly = data.readonly;
      this.indicators = data.indicators
      this.editIndex = data.editIndex;
      this.model = data.model;
  }
  mapFormTo(form: any): EvaluationIndicator {
    const model: EvaluationIndicator = new EvaluationIndicator().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
