import {Component, Input} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {AdminLookupTypeEnum} from '@enums/admin-lookup-type-enum';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {DateUtils} from '@helpers/date-utils';
import {ControlWrapper} from '@contracts/i-control-wrapper';
import {AdminLookup} from '@models/admin-lookup';
import {AdminResult} from '@models/admin-result';
import {Bylaw} from '@models/bylaw';
import {AdminLookupService} from '@services/admin-lookup.service';
import {LangService} from '@services/lang.service';
import {DatepickerOptionsMap} from '@app/types/types';
import {share} from 'rxjs/operators';
import { ComponentType } from '@angular/cdk/portal';

@Component({

  selector: 'bylaws',
  templateUrl: './bylaws.component.html',
  styleUrls: ['./bylaws.component.scss']
})
export class BylawsComponent extends ListModelComponent<Bylaw> {
  protected _getPopupComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
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
    firstReleaseDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
    lastUpdateDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'})
  };

  constructor(private fb: UntypedFormBuilder, public lang: LangService, private adminLookupService: AdminLookupService) {
    super(Bylaw);
  }

  protected _initComponent(): void {
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.BYLAWS_CLASSIFICATION)
      .pipe(share())
      .subscribe(result => {
        this.classifications = result;
        this.controls = [
          {
            controlName: 'fullName',
            label: this.lang.map.bylaw_name,
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
            load: result,
            dropdownValue: 'id',
            dropdownOptionDisabled: (optionItem: AdminLookup) => {
              return !optionItem.isActive();
            }
          }

        ];
      });
    this.form = this.fb.group(this.model.buildForm());
  }

  _beforeAdd(model: Bylaw): Bylaw | null {
    model.lastUpdateDate = DateUtils.getDateStringFromDate(model.lastUpdateDate);
    model.firstReleaseDate = DateUtils.getDateStringFromDate(model.firstReleaseDate);
    model.categoryInfo = AdminResult.createInstance(({
      ...this.classifications.find(e => e.id === model.category)
    }));
    return model;
  }

  _selectOne(row: Bylaw): void {
    const _row = {...row};
    _row.firstReleaseDate = DateUtils.changeDateToDatepicker(_row.firstReleaseDate);

    _row.lastUpdateDate = DateUtils.changeDateToDatepicker(_row.lastUpdateDate);
    this.form.patchValue(_row);
  }
}
