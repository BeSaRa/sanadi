import { Component, Inject } from '@angular/core';
import { UntypedFormArray, UntypedFormGroup } from '@angular/forms';
import { BankBranch } from '@app/models/bank-branch';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerOptionsMap } from '@app/types/types';

@Component({
  selector: 'bank-branch-popup',
  templateUrl: './bank-branch-popup.component.html',
  styleUrls: ['./bank-branch-popup.component.scss']
})
export class BankBranchPopupComponent {
  form: UntypedFormGroup;
  readonly: boolean;
  editIndex: number;
  model: BankBranch;
  branchesFormArray:UntypedFormArray;
  viewOnly:boolean;
  datepickerOptionsMap: DatepickerOptionsMap
  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editIndex: number,
    model: BankBranch,
    branchesFormArray: UntypedFormArray,
    viewOnly: boolean,
    datepickerOptionsMap: DatepickerOptionsMap,

  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editIndex = data.editIndex;
    this.model = data.model;
    this.branchesFormArray = data.branchesFormArray;
    this.viewOnly = data.viewOnly;
    this.datepickerOptionsMap = data.datepickerOptionsMap;

  }

  mapFormTo(form: any): BankBranch {
    const model: BankBranch = new BankBranch().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
