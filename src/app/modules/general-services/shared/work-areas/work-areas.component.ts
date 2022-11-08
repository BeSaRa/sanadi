import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { CommonUtils } from '@app/helpers/common-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { SortEvent } from '@app/interfaces/sort-event';
import { AdminResult } from '@app/models/admin-result';
import { Country } from '@app/models/country';
import { WorkArea } from '@app/models/work-area';
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
  filterControl: UntypedFormControl = new UntypedFormControl('');

  controls: ControlWrapper[] = [];
  columns = ['country', 'region','actions'];
  sortingCallbacks = {
    country: (a: WorkArea, b: WorkArea, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.countryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.countryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  }
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
    this.form = this.fb.group(this.model.buildForm());
  }
  _beforeAdd(model: WorkArea): WorkArea | null {
    model.countryInfo = AdminResult.createInstance({
      ...this.countries.find(e => e.id === model.country)
    })
    return model;
  }
  forceClearComponent() {
    this.cancel();
    this.list = [];
  }
  // view(record: WorkArea, $event?: MouseEvent) {
  //   $event?.preventDefault();
  //   this.editItem = record;
  //   this.viewOnly = true;
  //   this.recordChanged$.next(record);
  // }
}
