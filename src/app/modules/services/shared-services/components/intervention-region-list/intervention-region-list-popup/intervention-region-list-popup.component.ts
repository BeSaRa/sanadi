import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { InterventionRegion } from '@app/models/intervention-region';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { CustomValidators } from '@app/validators/custom-validators';

@Component({
  selector: 'app-intervention-region-list-popup',
  templateUrl: './intervention-region-list-popup.component.html',
  styleUrls: ['./intervention-region-list-popup.component.scss']
})
export class InterventionRegionListPopupComponent implements OnInit {
  customValidators = CustomValidators;
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: InterventionRegion;
  viewOnly: boolean;

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: InterventionRegion,
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
  mapFormTo(form: any): InterventionRegion {
    const model: InterventionRegion = new InterventionRegion().clone({ ...this.model, ...form });

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

}
