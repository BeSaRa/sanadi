import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ContactOfficer } from '@app/models/contact-officer';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-contact-officer-popup',
  templateUrl: './contact-officer-popup.component.html',
  styleUrls: ['./contact-officer-popup.component.scss']
})
export class ContactOfficerPopupComponent implements OnInit {
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: ContactOfficer;
  viewOnly: boolean;

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: ContactOfficer,
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
  mapFormTo(form: any): ContactOfficer {
    const model: ContactOfficer = new ContactOfficer().clone({ ...this.model, ...form });

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

}
