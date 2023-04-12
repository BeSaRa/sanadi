import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Lookup } from '@app/models/lookup';
import { TransferFundsExecutiveManagement } from '@app/models/transfer-funds-executive-management';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-TIFA-executive-management-popup',
  templateUrl: './TIFA-executive-management-popup.component.html',
  styleUrls: ['./TIFA-executive-management-popup.component.scss']
})
export class TIFAExecutiveManagementPopupComponent implements OnInit {

  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: TransferFundsExecutiveManagement;
  nationalities: Lookup[] = [];
  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: TransferFundsExecutiveManagement,
    nationalities: Lookup[]
  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.nationalities = data.nationalities;
  }

  ngOnInit() {
    const row = { ...this.model };
    this.form.patchValue(row);
  }

  mapFormTo(form: any): TransferFundsExecutiveManagement {
    const model: TransferFundsExecutiveManagement = new TransferFundsExecutiveManagement().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
