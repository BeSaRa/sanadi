import {Component, Input} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {Nationalities} from '@enums/nationalities.enum';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {DateUtils} from '@helpers/date-utils';
import {ControlWrapper} from '@contracts/i-control-wrapper';
import {RealBeneficiary} from '@models/real-beneficiary';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {ToastService} from '@services/toast.service';
import {DatepickerOptionsMap} from '@app/types/types';
import {Lookup} from '@models/lookup';
import { ComponentType } from '@angular/cdk/portal';

@Component({
  selector: 'real-beneficiaries',
  templateUrl: './real-beneficiaries.component.html',
  styleUrls: ['./real-beneficiaries.component.scss'],
})
export class RealBeneficiariesComponent extends ListModelComponent<RealBeneficiary> {
  protected _getPopupComponent(): ComponentType<any> {
    throw new Error('Method not implemented.');
  }
  QATARI_NATIONALITY = Nationalities.QATARI;
  private _handleChangeNationality = (lookupKey: string | number) => {
    const nationality = this.lookupService.listByCategory.Nationality.find(e => e.lookupKey === lookupKey);
    this.controls.map(e => {
      if (this.idColumns.includes(e.controlName)) {
        e.isDisplayed = nationality?.lookupKey === this.QATARI_NATIONALITY;
      }
      if (this.passportColumns.includes(e.controlName)) {
        e.isDisplayed = nationality?.lookupKey !== this.QATARI_NATIONALITY;
      }
      return e;
    });
    if (this.QATARI_NATIONALITY === nationality?.lookupKey) {
      this.idColumns.forEach((controlName, idx) => {
        this.form.get(controlName)?.addValidators(this.model.getPassportValidation()[idx]);
        this.form.get(controlName)?.updateValueAndValidity();
      });

      this.passportColumns.forEach((controlName, idx) => {
        this.form.get(controlName)?.removeValidators(this.model.getIdValidation()[idx]);
        this.form.get(controlName)?.updateValueAndValidity();
        this.form.get(controlName)?.reset();
      });
    } else {
      this.idColumns.forEach((controlName, idx) => {
        this.form.get(controlName)?.removeValidators(this.model.getIdValidation()[idx]);
        this.form.get(controlName)?.updateValueAndValidity();
        this.form.get(controlName)?.reset();
      });

      this.passportColumns.forEach((controlName, idx) => {
        this.form.get(controlName)?.addValidators(this.model.getPassportValidation()[idx]);
        this.form.get(controlName)?.updateValueAndValidity();
      });
    }
  };
  @Input() readonly!: boolean;

  @Input() set list(_list: RealBeneficiary[]) {
    this._list = _list;
  }

  get list() {
    return this._list;
  }

  constructor(
    public lang: LangService,
    private fb: UntypedFormBuilder,
    private lookupService: LookupService,
    private toast: ToastService
  ) {
    super(RealBeneficiary);
  }

  datepickerOptionsMap: DatepickerOptionsMap = {
    birthDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
    iDDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
    passportExpiryDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
    iDExpiryDate: DateUtils.getDatepickerOptions({disablePeriod: 'past'}),
    passportDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
    startDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
    lastUpdateDate: DateUtils.getDatepickerOptions({disablePeriod: 'none'}),
  };
  idColumns = ['identificationNumber', 'iDDate', 'iDExpiryDate'];
  passportColumns = ['passportNumber', 'passportDate', 'passportExpiryDate'];
  controls: (ControlWrapper & { isDisplayed?: boolean })[] = [
    {
      gridClass: 'col-sm-6',
      controlName: 'arabicName',
      label: this.lang.map.arabic_name,
      type: 'text',
      isDisplayed: true,
    },
    {
      gridClass: 'col-sm-6',
      controlName: 'englishName',
      label: this.lang.map.english_name,
      type: 'text',
      isDisplayed: true,
    },
    {
      isDisplayed: true,
      controlName: 'birthDate',
      label: this.lang.map.date_of_birth,
      type: 'date',
    },
    {
      isDisplayed: true,
      controlName: 'birthLocation',
      label: this.lang.map.birth_location,
      type: 'text',
    },
    {
      isDisplayed: true,
      controlName: 'nationality',
      label: this.lang.map.lbl_nationality,
      type: 'dropdown',
      load: this.lookupService.listByCategory.Nationality,
      onChange: this._handleChangeNationality,
      dropdownValue: 'lookupKey',
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
    },

    {
      isDisplayed: true,
      controlName: 'passportNumber',
      label: this.lang.map.passport_number,
      type: 'text',
    },

    {
      isDisplayed: true,
      controlName: 'passportDate',
      label: this.lang.map.passport_date,
      type: 'date',
    },
    {
      isDisplayed: true,
      controlName: 'passportExpiryDate',
      label: this.lang.map.passport_expiry_date,
      type: 'date',
    },
    {
      isDisplayed: false,
      controlName: 'identificationNumber',
      label: this.lang.map.lbl_qid,
      type: 'text',
    },
    {
      isDisplayed: false,
      controlName: 'iDDate',
      label: this.lang.map.id_date,
      type: 'date',
    },
    {
      isDisplayed: false,
      controlName: 'iDExpiryDate',
      label: this.lang.map.id_expiry_date,
      type: 'date',
    },
    {
      gridClass: 'col-sm-6',
      isDisplayed: true,
      controlName: 'startDate',
      label: this.lang.map.date_becoming_real_benefeciary,
      type: 'date',
    },
    {
      gridClass: 'col-sm-6',
      isDisplayed: true,
      controlName: 'lastUpdateDate',
      label: this.lang.map.date_of_last_update_real_benefeciary,
      type: 'date',
    },
    {
      isDisplayed: true,
      controlName: '',
      gridClass: 'col-12',
      label: this.lang.map.lbl_national_address,
      type: 'title',
    },
    {
      isDisplayed: true,
      controlName: 'zoneNumber',
      label: this.lang.map.lbl_zone,
      type: 'text',
    },
    {
      isDisplayed: true,
      controlName: 'streetNumber',
      label: this.lang.map.lbl_street,
      type: 'text',
    },

    {
      isDisplayed: true,
      controlName: 'buildingNumber',
      label: this.lang.map.building_number,
      type: 'text',
    },
    {
      gridClass: 'col-12',
      isDisplayed: true,
      controlName: 'address',
      label: this.lang.map.lbl_address,
      type: 'textarea',
    },
  ];
  columns = [
    'arabicName',
    'englishName',
    'birthDate',
    'birthLocation',
    'actions',
  ];

  protected _initComponent(): void {
    this.form = this.fb.group(this.model.buildForm());
    this.form.get('lastUpdateDate')?.disable();
  }

  _selectOne(_row: RealBeneficiary): void {
    const row = {..._row};
    row.birthDate = DateUtils.changeDateToDatepicker(row.birthDate);
    row.birthDateString = row.birthDate ? DateUtils.getDateStringFromDate(row.birthDate, 'DEFAULT_DATE_FORMAT') : '';
    row.startDate = DateUtils.changeDateToDatepicker(row.startDate);
    row.iDDate = DateUtils.changeDateToDatepicker(row.iDDate);
    row.iDExpiryDate = DateUtils.changeDateToDatepicker(row.iDExpiryDate);
    row.passportExpiryDate = DateUtils.changeDateToDatepicker(
      row.passportExpiryDate
    );
    row.passportDate = DateUtils.changeDateToDatepicker(row.passportDate);
    row.lastUpdateDate = DateUtils.changeDateToDatepicker(row.lastUpdateDate);
    this._handleChangeNationality(row.nationality);
    this.form.patchValue(row);
  }

  _beforeAdd(row: RealBeneficiary): RealBeneficiary | null {
    const natinoality = this.lookupService.listByCategory.Nationality.find(e => e.lookupKey === row.nationality);
    const field = (natinoality?.lookupKey === this.QATARI_NATIONALITY) ? 'identificationNumber' : 'passportNumber';
    console.log({field, row, natinoality});
    if (this._list.findIndex((e) => e[field] === row[field]) !== -1 && (this.editRecordIndex === -1)) {
      this.toast.alert(this.lang.map.msg_duplicated_item);
      return null;
    }
    row.birthDate = DateUtils.getDateStringFromDate(row.birthDate);
    row.birthDateString = row.birthDate ? DateUtils.getDateStringFromDate(row.birthDate, 'DEFAULT_DATE_FORMAT') : '';
    row.startDate = DateUtils.getDateStringFromDate(row.startDate);
    row.iDDate = DateUtils.getDateStringFromDate(row.iDDate);
    row.iDExpiryDate = DateUtils.getDateStringFromDate(row.iDExpiryDate);
    row.passportExpiryDate = DateUtils.getDateStringFromDate(
      row.passportExpiryDate
    );
    row.passportDate = DateUtils.getDateStringFromDate(row.passportDate);
    row.lastUpdateDate = DateUtils.getDateStringFromDate(row.lastUpdateDate);
    return row;
  }
}
