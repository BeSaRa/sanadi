import { Component, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { Country } from '@app/models/country';
import { ExecutiveManagement } from '@app/models/executive-management';
import { Lookup } from '@app/models/lookup';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'executive-management-popup',
  templateUrl: './executive-management-popup.component.html',
  styleUrls: ['./executive-management-popup.component.scss']
})
export class ExecutiveManagementPopupComponent {
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: ExecutiveManagement;
  pageTitleKey: keyof ILanguageKeys;
  countriesList: Country[];
  nationalities: Lookup[];
  hidePassport: boolean;
  viewOnly: boolean;


  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: ExecutiveManagement,
    pageTitleKey: keyof ILanguageKeys;
    countriesList: Country[];
    nationalities: Lookup[];
    hidePassport: boolean;
    viewOnly: boolean;
  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.pageTitleKey = data.pageTitleKey;
    this.countriesList = data.countriesList;
    this.nationalities = data.nationalities;
    this.hidePassport = data.hidePassport;
    this.viewOnly = data.viewOnly
  }

  mapFormTo(form: any): ExecutiveManagement {
    const model: ExecutiveManagement = new ExecutiveManagement().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
