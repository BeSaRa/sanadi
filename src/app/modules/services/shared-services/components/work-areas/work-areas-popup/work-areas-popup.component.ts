import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { AdminResult } from '@app/models/admin-result';
import { Country } from '@app/models/country';
import { WorkArea } from '@app/models/work-area';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-work-areas-popup',
  templateUrl: './work-areas-popup.component.html',
  styleUrls: ['./work-areas-popup.component.scss']
})
export class WorkAreasPopupComponent implements OnInit {
  model!: WorkArea;
  form: UntypedFormGroup;
  readonly: boolean;
  hideSave: boolean;
  editRecordIndex: number;
  countries: Country[] = [];
  controls: ControlWrapper[] = [];
  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    hideSave: boolean,
    editRecordIndex: number,
    model: WorkArea,
    customData: any
  },
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.hideSave = data.hideSave;
    this.readonly = data.readonly;
    this.editRecordIndex = data.editRecordIndex;
    this.model = data.model;
    this.countries = data.customData.countries
  }

  ngOnInit() {
    this.controls = [
      {
        controlName: 'country',
        load: this.countries,
        dropdownValue: 'id',
        label: this.lang.map.country,
        type: 'dropdown',
        dropdownOptionDisabled: (optionItem: Country) => {
          return !optionItem.isActive();
        }
      },
      {
        controlName: 'region',
        label: this.lang.map.region,
        type: 'text'
      },
    ];
  }

  mapForm(form: any): WorkArea {
    const entity: WorkArea = new WorkArea().clone(form);

    entity.countryInfo = AdminResult.createInstance({
      ...this.countries.find(e => e.id === entity.country)
    })
    return entity;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapForm(this.form.getRawValue()))
  }
}
