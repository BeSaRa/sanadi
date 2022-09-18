import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
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
  @Input() readonly!: boolean;
  form!: UntypedFormGroup;
  controls: ControlWrapper[] = [
    {
      controlName: 'arabicName',
      label: this.lang.map.arabic_name,
      type: 'text'
    },
    {
      controlName: 'englishName',
      label: this.lang.map.english_name,
      type: 'text'
    },
    {
      controlName: 'country',
      load$: this.countryService.loadAsLookups(),
      dropdownValue: 'id',
      label: this.lang.map.country,
      type: 'dropdown',
    }
  ];
  columns = ['arabicName', 'englishName', 'country', 'actions'];
  constructor(private countryService: CountryService, private fb: UntypedFormBuilder, public lang: LangService) {
    super(WorkArea);
  }
  protected _initComponent(): void {
    this.form = this.fb.group(this.model.buildForm());
  }


}
