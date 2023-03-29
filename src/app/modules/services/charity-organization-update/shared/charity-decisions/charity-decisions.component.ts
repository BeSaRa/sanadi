import {Component, Input} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {AdminLookupTypeEnum} from '@enums/admin-lookup-type-enum';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {DateUtils} from '@helpers/date-utils';
import {ControlWrapper} from '@contracts/i-control-wrapper';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {CharityDecision} from '@models/charity-decision';
import {AdminLookupService} from '@services/admin-lookup.service';
import {LangService} from '@services/lang.service';
import {DatepickerOptionsMap} from '@app/types/types';
import {AdminLookup} from '@models/admin-lookup';
import { ComponentType } from '@angular/cdk/portal';

@Component({
  selector: 'charity-decisions',
  templateUrl: './charity-decisions.component.html',
  styleUrls: ['./charity-decisions.component.scss'],
})
export class CharityDecisionsComponent extends ListModelComponent<CharityDecision> {
  protected _getPopupComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  get list() {
    return this._list;
  }
  @Input() set list(_list: CharityDecision[]) {
    this._list = _list;
  }
  @Input() readonly!: boolean;
  @Input() pageTitle!: keyof ILanguageKeys;
  @Input() inside = false;
  form!: UntypedFormGroup;
  datepickerOptionsMap: DatepickerOptionsMap = {
    generalDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' })
  };

  controls: ControlWrapper[] = [];
  columns = ['referenceNumber', 'generalDate', 'subject', 'actions'];
  constructor(
    private adminLookupService: AdminLookupService,
    private fb: UntypedFormBuilder,
    public lang: LangService
  ) {
    super(CharityDecision);
  }

  protected _initComponent(): void {
    this.controls = [
      {
        controlName: 'referenceNumber',
        label: this.lang.map.decision_reference_number,
        type: 'text',
      },
      {
        controlName: 'generalDate',
        label: this.lang.map.date,
        type: 'date',
      },
      {
        controlName: 'subject',
        label: this.lang.map.subject,
        type: 'text',
      },
      {
        controlName: 'category',
        label: this.lang.map.decision_category,
        type: 'dropdown',
        dropdownValue: 'id',
        load$: this.inside
          ? this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.PENALTIES_DECISION)
          : this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.RESOLUTIONS_ISSUED),
        dropdownOptionDisabled: (optionItem: AdminLookup) => {
          return !optionItem.isActive();
        }
      },
    ];
    if (!this.inside) {
      this.controls.push({
        controlName: 'organization',
        label: this.lang.map.issuer,
        type: 'text'
      });
    }
    this.form = this.fb.group(this.model.buildForm(true, !this.inside));
  }
  _beforeAdd(model: CharityDecision): CharityDecision {
    model.generalDate = DateUtils.getDateStringFromDate(model.generalDate!)!;
    return model;
  }
  _selectOne(row: CharityDecision): void {
    this.form.patchValue({
      ...row,
      generalDate: DateUtils.changeDateToDatepicker(row.generalDate),
    });
  }
}
