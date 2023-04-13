import { Component, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ForeignCountriesProjects } from '@app/models/foreign-countries-projects';
import { ForeignCountriesProjectsNeed } from '@app/models/foreign-countries-projects-need';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'foreign-countries-project-popup',
  templateUrl: './foreign-countries-project-popup.component.html',
  styleUrls: ['./foreign-countries-project-popup.component.scss']
})
export class ForeignCountriesProjectPopupComponent {
  form: UntypedFormGroup;
  readonly: boolean;
  editIndex: number;
  foreignCountriesProjectsNeeds: ForeignCountriesProjectsNeed[];
  constructor(@Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      editIndex: number,

      foreignCountriesProjectsNeeds: ForeignCountriesProjectsNeed[],
    },
    public lang: LangService,
    private dialogRef: DialogRef) {
      this.form = data.form;
      this.readonly = data.readonly;
      this.editIndex = data.editIndex;
      this.foreignCountriesProjectsNeeds = data.foreignCountriesProjectsNeeds
  }
  mapFormTo(form: any): ForeignCountriesProjects {
    const model: ForeignCountriesProjects = new ForeignCountriesProjects().clone(form);

    return model;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }
}
