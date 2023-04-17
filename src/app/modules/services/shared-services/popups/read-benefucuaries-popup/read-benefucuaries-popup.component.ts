import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Nationalities } from '@app/enums/nationalities.enum';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { Lookup } from '@app/models/lookup';
import { RealBeneficiary } from '@app/models/real-beneficiary';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DatepickerOptionsMap } from '@app/types/types';

@Component({
  selector: 'app-read-benefucuaries-popup',
  templateUrl: './read-benefucuaries-popup.component.html',
  styleUrls: ['./read-benefucuaries-popup.component.scss']
})
export class ReadBenefucuariesPopupComponent implements OnInit {
  model!: RealBeneficiary;
  form: UntypedFormGroup;
  readonly: boolean;
  hideSave: boolean;
  editRecordIndex: number;

  idColumns = ['identificationNumber', 'iDDate', 'iDExpiryDate'];
  passportColumns = ['passportNumber', 'passportDate', 'passportExpiryDate'];

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
  datepickerOptionsMap: DatepickerOptionsMap = {
    birthDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    iDDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    passportExpiryDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
    iDExpiryDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
    passportDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    startDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    lastUpdateDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' }),
  };
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
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      hideSave: boolean,
      editRecordIndex: number,
      model: RealBeneficiary
    },
    public lang: LangService,
    private dialogRef: DialogRef,
    private lookupService: LookupService
  ) {
    this.form = data.form;
    this.hideSave = data.hideSave;
    this.readonly = data.readonly;
    this.editRecordIndex = data.editRecordIndex;
    this.model = data.model;
  }

  ngOnInit(): void {
    const row = { ...this.model };
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
    this._handleChangeNationality(row.nationality)
    this.form.patchValue(row);
  }

  mapForm(form: any): RealBeneficiary {
    const beneficiary: RealBeneficiary = new RealBeneficiary().clone(form);

    beneficiary.birthDate = DateUtils.getDateStringFromDate(form.birthDate);
    beneficiary.birthDateString = form.birthDate ? DateUtils.getDateStringFromDate(form.birthDate, 'DEFAULT_DATE_FORMAT') : '';
    beneficiary.startDate = DateUtils.getDateStringFromDate(form.startDate);
    beneficiary.iDDate = DateUtils.getDateStringFromDate(form.iDDate);
    beneficiary.iDExpiryDate = DateUtils.getDateStringFromDate(form.iDExpiryDate);
    beneficiary.passportExpiryDate = DateUtils.getDateStringFromDate(form.passportExpiryDate);
    beneficiary.passportDate = DateUtils.getDateStringFromDate(form.passportDate);
    beneficiary.lastUpdateDate = DateUtils.getDateStringFromDate(form.lastUpdateDate);

    return beneficiary;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapForm(this.form.getRawValue()))
  }
}
