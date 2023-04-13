import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Lookup } from '@app/models/lookup';
import { ManagementCouncil } from '@app/models/management-council';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-management-council-popup',
  templateUrl: './management-council-popup.component.html',
  styleUrls: ['./management-council-popup.component.scss']
})
export class ManagementCouncilPopupComponent implements OnInit {
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: ManagementCouncil;
  viewOnly: boolean;
  nationalities: Lookup[];

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: ManagementCouncil,
    viewOnly: boolean,
    nationalities: Lookup[]
  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.viewOnly = data.viewOnly;
    this.nationalities = data.nationalities;
  }
  ngOnInit() {
    this.form.patchValue(this.model);
  }

  mapFormTo(form: any): ManagementCouncil {
    const model: ManagementCouncil = new ManagementCouncil().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
