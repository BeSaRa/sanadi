import { Component, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AdminResult } from '@app/models/admin-result';
import { OfficeEvaluation } from '@app/models/office-evaluation';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'implementation-evaluation-popup',
  templateUrl: './implementation-evaluation-popup.component.html',
  styleUrls: ['./implementation-evaluation-popup.component.scss']
})
export class ImplementationEvaluationPopupComponent {
  customValidators=CustomValidators
  form: UntypedFormGroup;
  readonly: boolean;
  viewOnly: boolean;
  editItem: number;
  model: OfficeEvaluation;
  evaluationHubList: AdminResult[];
  evaluationResultList = this.lookupService.listByCategory.EvaluationResult;
  constructor(@Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      viewOnly: boolean,
      editItem: number,
      model: OfficeEvaluation,
      evaluationHubList: AdminResult[],
    },
    public lang: LangService,
    private dialogRef: DialogRef, 
    private lookupService :LookupService) {
      this.form = data.form;
      this.readonly = data.readonly;
      this.viewOnly = data.viewOnly;
      this.editItem = data.editItem;
      this.model = data.model;
      this.evaluationHubList = data.evaluationHubList;
  }
  mapFormTo(form: any): OfficeEvaluation {
    const model: OfficeEvaluation = new OfficeEvaluation().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
