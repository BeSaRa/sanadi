import { Component, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AdminResult } from '@app/models/admin-result';
import { BestPractices } from '@app/models/best-practices';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'best-practices-popup',
  templateUrl: './best-practices-popup.component.html',
  styleUrls: ['./best-practices-popup.component.scss']
})
export class BestPracticesPopupComponent {
  form: UntypedFormGroup;
  readonly: boolean;
  viewOnly: boolean;
  editItem: boolean;
  model: BestPractices;
  bestPracticesList: AdminResult[];
  customValidators = CustomValidators
  constructor(@Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      viewOnly: boolean,
      editItem: boolean,
      model: BestPractices,
      bestPracticesList: AdminResult[];
    },
    public lang: LangService,
    private dialogRef: DialogRef) {
      this.form = data.form;
      this.readonly = data.readonly;
      this.viewOnly = data.viewOnly;
      this.editItem = data.editItem;
      this.model = data.model;
      this.bestPracticesList = data.bestPracticesList;
  }
  mapFormTo(form: any): BestPractices {
    const model: BestPractices = new BestPractices().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
  searchNgSelect(term: string, item: AdminResult): boolean {
    return item.ngSelectSearch(term);
  }
}
