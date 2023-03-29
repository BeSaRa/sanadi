import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { IMenuItem } from './../../../../context-menu/interfaces/i-menu-item';
import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { CommonUtils } from '@helpers/common-utils';
import { ControlWrapper } from '@contracts/i-control-wrapper';
import { SortEvent } from '@contracts/sort-event';
import { AdminResult } from '@models/admin-result';
import { Country } from '@models/country';
import { WorkArea } from '@models/work-area';
import { LangService } from '@services/lang.service';
import { ComponentType } from '@angular/cdk/portal';

@Component({
  selector: 'work-areas',
  templateUrl: './work-areas.component.html',
  styleUrls: ['./work-areas.component.scss']
})
export class WorkAreasComponent extends ListModelComponent<WorkArea> {
  protected _getPopupComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
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
  actions: IMenuItem<WorkArea>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: WorkArea) => this.selectOne(item),
      show: (_item: WorkArea) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: WorkArea) => this.removeOne(item),
      show: (_item: WorkArea) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: WorkArea) => this.selectOne(item),
    }
  ];
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
