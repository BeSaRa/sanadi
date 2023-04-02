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
import { WorkAreasPopupComponent } from './work-areas-popup/work-areas-popup.component';

@Component({
  selector: 'work-areas',
  templateUrl: './work-areas.component.html',
  styleUrls: ['./work-areas.component.scss']
})
export class WorkAreasComponent extends ListModelComponent<WorkArea> {
  protected _getPopupComponent(): ComponentType<any> {
    return WorkAreasPopupComponent;
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
    this.form = this.fb.group(this.model.buildForm());
    this.customData = {
      countries: this.countries
    }
  }
  forceClearComponent() {
    this.cancel();
    this.list = [];
  }
}
