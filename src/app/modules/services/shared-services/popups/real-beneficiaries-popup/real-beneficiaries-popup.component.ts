import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {Nationalities} from '@app/enums/nationalities.enum';
import {DateUtils} from '@app/helpers/date-utils';
import {ControlWrapper} from '@app/interfaces/i-control-wrapper';
import {Lookup} from '@app/models/lookup';
import {RealBeneficiary} from '@app/models/real-beneficiary';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {DatepickerOptionsMap} from '@app/types/types';
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'app-real-beneficiaries-popup',
  templateUrl: './real-beneficiaries-popup.component.html',
  styleUrls: ['./real-beneficiaries-popup.component.scss']
})
export class RealBeneficiariesPopupComponent implements OnInit {
  model!: RealBeneficiary;
  form: UntypedFormGroup;
  readonly: boolean;
  hideSave: boolean;
  editRecordIndex: number;
  hideFullScreen = false;

  idColumns = ['identificationNumber', 'idDate', 'idExpiryDate'];
  passportColumns = ['passportNumber', 'passportDate', 'passportExpiryDate'];

  QATARI_NATIONALITY = Nationalities.QATARI;

  private _handleChangeNationality = (lookupKey: string | number) => {
    const nationality = this.lookupService.listByCategory.Nationality.find(e => e.lookupKey === lookupKey);
    this.controls.map(e => {
      if (this.idColumns.includes(e.controlName)) {
        e.hide = nationality?.lookupKey !== this.QATARI_NATIONALITY;
      }
      if (this.passportColumns.includes(e.controlName)) {
        e.hide = nationality?.lookupKey === this.QATARI_NATIONALITY;
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
    idDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    passportExpiryDate: DateUtils.getDatepickerOptions({
      disablePeriod: 'past',
    }),
    idExpiryDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' }),
    passportDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    startDate: DateUtils.getDatepickerOptions({ disablePeriod: 'future' }),
    lastUpdateDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' }),
  };
  controls: ControlWrapper[] = [
    {
      controlName: 'arabicName',
      langKey: 'arabic_name',
      type: 'text',
    },
    {
      controlName: 'englishName',
      langKey: 'english_name',
      type: 'text',
    },
    {
      controlName: 'birthDate',
      langKey: 'date_of_birth',
      type: 'date',
    },
    {
      controlName: 'birthLocation',
      langKey: 'birth_location',
      type: 'text',
    },
    {
      controlName: 'nationality',
      langKey: 'lbl_nationality',
      type: 'dropdown',
      load: this.lookupService.listByCategory.Nationality,
      onChange: this._handleChangeNationality,
      dropdownValue: 'lookupKey',
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
    },
    {
      controlName: 'passportNumber',
      langKey: 'passport_number',
      type: 'text',
    },
    {
      controlName: 'passportDate',
      langKey: 'passport_date',
      type: 'date',
    },
    {
      controlName: 'passportExpiryDate',
      langKey: 'passport_expiry_date',
      type: 'date',
    },
    {
      controlName: 'identificationNumber',
      langKey: 'lbl_qid',
      type: 'text',
      hide: true,
    },
    {
      controlName: 'idDate',
      langKey: 'id_date',
      type: 'date',
      hide: true,
    },
    {
      controlName: 'idExpiryDate',
      langKey: 'id_expiry_date',
      type: 'date',
      hide: true,
    },
    {
      gridClass: 'col-sm-6',
      controlName: 'startDate',
      langKey: 'date_becoming_real_benefeciary',
      type: 'date',
      hide: true,
    },
    {
      gridClass: 'col-sm-6',
      controlName: 'lastUpdateDate',
      langKey: 'date_of_last_update_real_benefeciary',
      type: 'date',
    },
    {
      controlName: '',
      gridClass: 'col-12',
      langKey: 'lbl_national_address',
      type: 'title',
    },
    {
      controlName: 'zoneNumber',
      langKey: 'lbl_zone',
      type: 'text',
    },
    {
      controlName: 'streetNumber',
      langKey: 'lbl_street',
      type: 'text',
    },
    {
      controlName: 'buildingNumber',
      langKey: 'building_number',
      type: 'text',
    },
    {
      gridClass: 'col-12',
      controlName: 'address',
      langKey: 'lbl_address',
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
    row.idDate = DateUtils.changeDateToDatepicker(row.idDate);
    row.idExpiryDate = DateUtils.changeDateToDatepicker(row.idExpiryDate);
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
    beneficiary.idDate = DateUtils.getDateStringFromDate(form.idDate);
    beneficiary.idExpiryDate = DateUtils.getDateStringFromDate(form.idExpiryDate);
    beneficiary.passportExpiryDate = DateUtils.getDateStringFromDate(form.passportExpiryDate);
    beneficiary.passportDate = DateUtils.getDateStringFromDate(form.passportDate);
    beneficiary.lastUpdateDate = DateUtils.getDateStringFromDate(form.lastUpdateDate);

    return beneficiary;
  }

  save() {
    this.dialogRef.close(this.mapForm(this.form.getRawValue()))
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity((form || this.form), element);
  }
}
