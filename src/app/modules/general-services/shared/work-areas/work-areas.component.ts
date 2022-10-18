import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { AdminResult } from '@app/models/admin-result';
import { Country } from '@app/models/country';
import { WorkArea } from '@app/models/work-area';
import { CountryService } from '@app/services/country.service';
import { LangService } from '@app/services/lang.service';

@Component({
  selector: 'work-areas',
  templateUrl: './work-areas.component.html',
  styleUrls: ['./work-areas.component.scss']
})
export class WorkAreasComponent extends ListModelComponent<WorkArea> {
  get list() {
    return this._list;
  }
  @Input() set list(_list: WorkArea[]) {
    this._list = _list;
  }
  @Input() countries: Country[] = [];
  @Input() readonly!: boolean;
  form!: UntypedFormGroup;
  controls: ControlWrapper[] = [];
  columns = ['country', 'actions'];
  constructor(private fb: UntypedFormBuilder, public lang: LangService) {
    super(WorkArea);

  }
  protected _initComponent(): void {
    this.controls = [

      {
        controlName: 'country',
        load: this.countries,
        dropdownValue: 'id',
        label: this.lang.map.country,
        type: 'dropdown',
      }
    ];
    this.form = this.fb.group(this.model.buildForm());
  }
  _beforeAdd(model: WorkArea): WorkArea | null {
    model.countryInfo = AdminResult.createInstance({
      ...this.countries.find(e => e.id === model.country)
    })
    return model;
  }

}
