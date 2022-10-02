import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { AdminLookup } from '@app/models/admin-lookup';
import { AdminResult } from '@app/models/admin-result';
import { Bylaw } from '@app/models/bylaw';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { LangService } from '@app/services/lang.service';
import { DatepickerOptionsMap } from '@app/types/types';
import { share } from 'rxjs/operators';

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
  classifications!: AdminLookup[];
  form!: UntypedFormGroup;
  controls: ControlWrapper[] = [];
  columns = ['fullName', 'firstReleaseDate', 'lastUpdateDate', 'category', 'actions'];
  datepickerOptionsMap: DatepickerOptionsMap = {
    firstReleaseDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    lastUpdateDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' })
  }
  constructor(private fb: UntypedFormBuilder, public lang: LangService, private adminLookupService: AdminLookupService) {
    super(Bylaw);
  }

  protected _initComponent(): void {
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.BYLAWS_CLASSIFICATION).pipe(share()).subscribe(e => {
      this.classifications = e;
      this.controls = [
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
          load: e,
          dropdownValue: 'id'
        }

      ];
    })
    this.form = this.fb.group(this.model.buildForm());
  }

  _beforeAdd(model: Bylaw): Bylaw | null {
    model.lastUpdateDate = DateUtils.getDateStringFromDate(model.lastUpdateDate);
    model.firstReleaseDate = DateUtils.getDateStringFromDate(model.firstReleaseDate);
    model.categoryInfo = AdminResult.createInstance(({
      ...this.classifications.find(e => e.id === model.category)
    }))
    return model;
  }
  _selectOne(row: Bylaw): void {
    const _row = { ...row };
    _row.firstReleaseDate = DateUtils.changeDateToDatepicker(_row.firstReleaseDate);

    _row.lastUpdateDate = DateUtils.changeDateToDatepicker(_row.lastUpdateDate);
    this.form.patchValue(_row)
  }
}
