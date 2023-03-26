import { ILanguageKeys } from './../../../../../../interfaces/i-language-keys';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { OrganizationOfficer } from '@app/models/organization-officer';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-organization-officer-popup',
  templateUrl: './organization-officer-popup.component.html',
  styleUrls: ['./organization-officer-popup.component.scss']
})
export class OrganizationOfficerPopupComponent implements OnInit {
  officerForm!: UntypedFormGroup;
  readonly: boolean = false;
  selectedOfficer!: OrganizationOfficer;
  label!: keyof ILanguageKeys;
  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    selectedOfficer: OrganizationOfficer,
    label: string
  },
    public lang: LangService,
    private dialogRef: DialogRef
  ) {
    this.officerForm = data.form;
    this.readonly = data.readonly;
    this.selectedOfficer = data.selectedOfficer;
    this.label = data.label as keyof ILanguageKeys;
  }

  ngOnInit() {
  }
  cancel() {
    this.dialogRef.close(null)
  }
  saveOfficer() {
    this.dialogRef.close(true)
  }
}
