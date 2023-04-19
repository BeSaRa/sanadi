import { UntypedFormGroup } from '@angular/forms';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray } from '@angular/forms';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { NpoContactOfficer } from '@app/models/npo-contact-officer';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { JobTitle } from '@app/models/job-title';
import { JobTitleService } from '@app/services/job-title.service';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'app-npo-contact-officer-popup',
  templateUrl: './npo-contact-officer-popup.component.html',
  styleUrls: ['./npo-contact-officer-popup.component.scss']
})
export class NpoContactOfficerPopupComponent implements OnInit {
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: NpoContactOfficer;
  model: NpoContactOfficer;
  jobTitleAdminLookup: JobTitle[] = [];
  contactOfficersFormArray: UntypedFormArray;
  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: NpoContactOfficer,
    model: NpoContactOfficer,
    contactOfficersFormArray: UntypedFormArray;
    jobTitleAdminLookup: JobTitle[]
  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.contactOfficersFormArray = data.contactOfficersFormArray;
    this.jobTitleAdminLookup = data.jobTitleAdminLookup;
  }

  ngOnInit() {
  }
  mapFormTo(form: any): NpoContactOfficer {
    const model: NpoContactOfficer = new NpoContactOfficer().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
