import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Goal } from '@app/models/goal';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-goal-popup',
  templateUrl: './goal-popup.component.html',
  styleUrls: ['./goal-popup.component.scss']
})
export class GoalPopupComponent implements OnInit {
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: Goal;
  viewOnly: boolean;

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: Goal,
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
  mapFormTo(form: any): Goal {
    const model: Goal = new Goal().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

}
