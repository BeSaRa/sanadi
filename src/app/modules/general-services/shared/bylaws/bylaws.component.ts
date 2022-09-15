import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { Bylaw } from '@app/models/bylaw';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { LangService } from '@app/services/lang.service';
import { DatepickerOptionsMap } from '@app/types/types';

@Component({
  selector: 'bylaws',
  templateUrl: './bylaws.component.html',
  styleUrls: ['./bylaws.component.scss']
})
export class BylawsComponent extends ListModelComponent<Bylaw> {
  get list() {
    return this._list;
  }
  @Input() set list(_list: Bylaw[]) {
    this._list = _list;
  }
  @Input() readonly!: boolean;
  form!: UntypedFormGroup;
  controls: ControlWrapper[] = [
    {
      controlName: 'fullName',
      label: this.lang.map.full_name,
      type: 'text'
    },
    {
      controlName: 'firstReleaseDate',
      label: this.lang.map.first_realase_date,
      type: 'date'
    },
    {
      controlName: 'lastUpdateDate',
      label: this.lang.map.date_of_last_update,
      type: 'date'
    },
    {
      controlName: 'category',
      label: this.lang.map.classification,
      type: 'dropdown',
      load$: this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.BYLAWS_CLASSIFICATION),
      dropdownValue: 'id'
    }

  ];
  columns = ['fullName', 'firstReleaseDate', 'lastUpdateDate', 'category', 'actions'];
  datepickerOptionsMap: DatepickerOptionsMap = {
    firstReleaseDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    lastUpdateDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' })
  }
  constructor(private fb: UntypedFormBuilder, public lang: LangService, private adminLookupService: AdminLookupService) {
    super(Bylaw);
  }

  protected _initComponent(): void {
    this.form = this.fb.group(this.model.buildForm());
  }
}
