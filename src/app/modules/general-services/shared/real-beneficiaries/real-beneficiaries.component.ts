import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { DatepickerOptionsMap } from '@app/types/types';

@Component({
  selector: 'real-beneficiaries',
  templateUrl: './real-beneficiaries.component.html',
  styleUrls: ['./real-beneficiaries.component.scss'],
})
export class RealBeneficiariesComponent extends ListModelComponent<RealBeneficiary> {
  @Input() readonly!: boolean;
  @Input() set list(_list: RealBeneficiary[]) {
    this._list = _list;
  }
  get list() {
    return this._list;

  }
  constructor(public lang: LangService, private fb: UntypedFormBuilder, private lookupService: LookupService) {
    super(RealBeneficiary);
  }
  datepickerOptionsMap: DatepickerOptionsMap = {
    birthDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    iDDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    passportExpiryDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
    iDExpiryDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
    passportDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    startDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
    lastUpdateDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
  };
  controls: ControlWrapper[] = [
    { controlName: 'arabicName', label: this.lang.map.arabic_name, type: 'text' },
    { controlName: 'englishName', label: this.lang.map.english_name, type: 'text' },
    {
      controlName: 'birthDate',
      label: this.lang.map.date_of_birth,
      type: 'date',
    },
    {
      controlName: 'birthLocation',
      label: this.lang.map.birth_location,
      type: 'text',
    },
    {
      controlName: 'nationality',
      label: this.lang.map.lbl_nationality,
      type: 'dropdown',
      load: this.lookupService.listByCategory.Nationality,
    },
    { controlName: 'address', label: this.lang.map.lbl_address, type: 'text' },
    {
      controlName: 'streetNumber',
      label: this.lang.map.lbl_street,
      type: 'text',
    },
    { controlName: 'zoneNumber', label: this.lang.map.lbl_zone, type: 'text' },
    {
      controlName: 'buildingNumber',
      label: this.lang.map.building_number,
      type: 'text',
    },

    {
      controlName: 'passportNumber',
      label: this.lang.map.passport_number,
      type: 'text',
    },
    { controlName: 'identificationNumber', label: this.lang.map.lbl_qid, type: 'text' },
    { controlName: 'iDDate', label: this.lang.map.id_date, type: 'date' },

    {
      controlName: 'passportExpiryDate',
      label: this.lang.map.passport_expiry_date,
      type: 'date',
    },

    { controlName: 'iDExpiryDate', label: this.lang.map.id_expiry_date, type: 'date' },

    { controlName: 'passportDate', label: this.lang.map.passport_date, type: 'date' },

    { controlName: 'startDate', label: this.lang.map.start_date, type: 'date' },

    {
      controlName: 'lastUpdateDate',
      label: this.lang.map.date_of_last_update,
      type: 'date',
    },
  ];
  columns = ['arabicName', 'englishName', 'birthDate', 'birthLocation', 'actions']

  protected _initComponent(): void {
    this.form = this.fb.group(this.model.buildForm());
  }
  _selectOne(row: RealBeneficiary): void {
    row.birthDate = DateUtils.changeDateToDatepicker(row.birthDate);
    row.startDate = DateUtils.changeDateToDatepicker(row.startDate);
    row.iDDate = DateUtils.changeDateToDatepicker(row.iDDate);
    row.iDExpiryDate = DateUtils.changeDateToDatepicker(row.iDExpiryDate);
    row.passportExpiryDate = DateUtils.changeDateToDatepicker(row.passportExpiryDate);
    row.passportDate = DateUtils.changeDateToDatepicker(row.passportDate);
    row.lastUpdateDate = DateUtils.changeDateToDatepicker(row.lastUpdateDate);
    this.form.patchValue(row);
  }
  _beforeAdd(row: RealBeneficiary): RealBeneficiary {

    row.birthDate = DateUtils.getDateStringFromDate(row.birthDate);
    row.startDate = DateUtils.getDateStringFromDate(row.startDate);
    row.iDDate = DateUtils.getDateStringFromDate(row.iDDate);
    row.iDExpiryDate = DateUtils.getDateStringFromDate(row.iDExpiryDate);
    row.passportExpiryDate = DateUtils.getDateStringFromDate(row.passportExpiryDate);
    row.passportDate = DateUtils.getDateStringFromDate(row.passportDate);
    row.lastUpdateDate = DateUtils.getDateStringFromDate(row.lastUpdateDate);
    return row;
  }
}
