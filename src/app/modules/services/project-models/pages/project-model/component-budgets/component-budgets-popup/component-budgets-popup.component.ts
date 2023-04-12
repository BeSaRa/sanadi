import { Component, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { ProjectModel } from '@app/models/project-model';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'component-budgets-popup',
  templateUrl: './component-budgets-popup.component.html',
  styleUrls: ['./component-budgets-popup.component.scss']
})
export class ComponentBudgetsPopupComponent {
  form: UntypedFormGroup;
  readonly: boolean;
  editIndex: number;
  model: ProjectModel;
  componentBudgetArray: UntypedFormArray;
  constructor(@Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      editIndex: number,
      model: ProjectModel,
      componentBudgetArray: UntypedFormArray,
    },
    public lang: LangService,
    private dialogRef: DialogRef) {
      this.form = data.form;
      this.readonly = data.readonly;
      this.editIndex = data.editIndex;
      this.model = data.model;
      this.componentBudgetArray = data.componentBudgetArray
    }
  mapFormTo(form: any): ProjectModel {
    const model: ProjectModel = new ProjectModel().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
