import { ValidatorFn } from '@angular/forms';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { RealBeneficiaryInterceptor } from '@app/model-interceptors/real-beneficiary-interceptors';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';
import { AuditOperationTypes } from '@enums/audit-operation-types';
import { IAuditModelProperties } from '@contracts/i-audit-model-properties';
import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlValueLabelLangKey } from '@app/types/types';

const { receive, send } = new RealBeneficiaryInterceptor()


@InterceptModel({
  receive, send
})
export class RealBeneficiary extends SearchableCloneable<RealBeneficiary> implements IAuditModelProperties<RealBeneficiary> {
  updatedBy!: number;
  clientData!: string;
  objectDBId!: number;
  orgType!: number;
  orgId!: number;
  arName!: string;
  arabicName!: string;
  englishName!: string;
  identificationNumber!: string;
  enName!: string;
  birthDate!: string | IMyDateModel;
  birthLocation!: string;
  nationality!: number;
  zoneNumber!: string;
  streetNumber!: string;
  buildingNumber!: string;
  address!: string;
  qid!: string;
  passportNumber!: string;
  iDDate!: string | IMyDateModel;
  passportDate!: string | IMyDateModel;
  iDExpiryDate!: string | IMyDateModel;
  passportExpiryDate!: string | IMyDateModel;
  startDate!: string | IMyDateModel;
  lastUpdateDate!: string | IMyDateModel;
  id!: number;
  iddate!: string | IMyDateModel;
  idexpiryDate!: string | IMyDateModel;
  nationalityInfo!: AdminResult;
  birthDateString!: string;

  birthDateStamp!: number | null
  iDDateStamp!: number | null
  idexpiryDateStamp!: number | null
  passportDateStamp!: number | null
  iDExpiryDateStamp!: number | null
  startDateStamp!: number | null
  lastUpdateDateStamp!: number | null
  passportExpiryDateStamp!: number | null

  getAdminResultByProperty(property: keyof RealBeneficiary): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'nationality':
        adminResultValue = this.nationalityInfo;
        break;
      case 'birthDate':
        const birthDateValue = DateUtils.getDateStringFromDate(this.birthDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: birthDateValue, enName: birthDateValue });
        break;
      case 'iDDate':
        const iDDateValue = DateUtils.getDateStringFromDate(this.iDDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: iDDateValue, enName: iDDateValue });
        break;
      case 'idexpiryDate':
        const idexpiryDateValue = DateUtils.getDateStringFromDate(this.idexpiryDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: idexpiryDateValue, enName: idexpiryDateValue });
        break;
      case 'passportDate':
        const passportDateValue = DateUtils.getDateStringFromDate(this.passportDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: passportDateValue, enName: passportDateValue });
        break;
      case 'iDExpiryDate':
        const iDExpiryDateValue = DateUtils.getDateStringFromDate(this.iDExpiryDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: iDExpiryDateValue, enName: iDExpiryDateValue });
        break;
      case 'startDate':
        const startDateValue = DateUtils.getDateStringFromDate(this.startDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: startDateValue, enName: startDateValue });
        break;
      case 'lastUpdateDate':
        const lastUpdateDateValue = DateUtils.getDateStringFromDate(this.lastUpdateDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: lastUpdateDateValue, enName: lastUpdateDateValue });
        break;
      case 'passportExpiryDate':
        const passportExpiryDateValue = DateUtils.getDateStringFromDate(this.passportExpiryDate, 'DATEPICKER_FORMAT');
        adminResultValue = AdminResult.createInstance({ arName: passportExpiryDateValue, enName: passportExpiryDateValue });
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      arabicName: { langKey: 'arabic_name', value: this.arabicName },
      englishName: { langKey: 'english_name', value: this.englishName },
      birthLocation: { langKey: 'birth_location', value: this.birthLocation },
      nationality: { langKey: 'lbl_nationality', value: this.nationality },
      address: { langKey: 'lbl_address', value: this.address },
      streetNumber: { langKey: 'lbl_street', value: this.streetNumber },
      zoneNumber: { langKey: 'lbl_zone', value: this.zoneNumber },
      buildingNumber: { langKey: 'building_number', value: this.buildingNumber },
      identificationNumber: { langKey: 'identification_number', value: this.identificationNumber },
      passportNumber: { langKey: 'passport_number', value: this.passportNumber },
      birthDate: { langKey: 'date_of_birth', value: this.birthDate, comparisonValue: this.birthDateStamp },
      iDDate: { langKey: 'id_date', value: this.iDDate, comparisonValue: this.iDDateStamp },
      idexpiryDate: { langKey: 'id_expiry_date', value: this.idexpiryDate, comparisonValue: this.idexpiryDateStamp },
      passportDate: { langKey: 'passport_date', value: this.passportDate, comparisonValue: this.passportDateStamp },
      iDExpiryDate: { langKey: 'id_expiry_date', value: this.iDExpiryDate, comparisonValue: this.iDExpiryDateStamp },
      startDate: { langKey: 'date_becoming_real_benefeciary', value: this.startDate, comparisonValue: this.startDateStamp },
      lastUpdateDate: { langKey: 'date_of_last_update_real_benefeciary', value: this.lastUpdateDate, comparisonValue: this.lastUpdateDateStamp },
      passportExpiryDate: { langKey: 'passport_expiry_date', value: this.passportExpiryDate, comparisonValue: this.passportExpiryDateStamp }
    };

  }

  buildForm(controls = true) {
    const {
      arabicName,
      englishName,
      birthDate,
      birthLocation,
      nationality,
      address,
      streetNumber,
      zoneNumber,
      buildingNumber,
      identificationNumber,
      passportNumber,
      iDDate,
      idexpiryDate,
      passportDate,
      iDExpiryDate,
      startDate,
      lastUpdateDate,
      passportExpiryDate
    } = this;
    return {
      arabicName: controls
        ? [
          arabicName,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ARABIC_NAME_MAX
            ),
            CustomValidators.pattern('AR_ONLY'),
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
          ],
        ]
        : arabicName,
      englishName: controls
        ? [
          englishName,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
            CustomValidators.pattern('ENG_ONLY'),
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
          ],
        ]
        : englishName,
      birthDate: controls
        ? [birthDate, [CustomValidators.required]]
        : birthDate,
      birthLocation: controls
        ? [
          birthLocation,
          [
            CustomValidators.required,
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
            CustomValidators.maxLength(50)
          ],
        ]
        : birthLocation,
      nationality: controls
        ? [nationality, [CustomValidators.required]]
        : nationality,
      address: controls
        ? [
          address,
          [
            CustomValidators.required,
            CustomValidators.minLength(
              CustomValidators.defaultLengths.MIN_LENGTH
            ),
            CustomValidators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)
          ],
        ]
        : address,
      streetNumber: controls
        ? [streetNumber, [CustomValidators.required, CustomValidators.maxLength(5)]]
        : streetNumber,
      zoneNumber: controls
        ? [zoneNumber, [CustomValidators.required, CustomValidators.maxLength(5)]]
        : zoneNumber,
      buildingNumber: controls
        ? [buildingNumber, [CustomValidators.required, CustomValidators.maxLength(5)]]
        : buildingNumber,
      identificationNumber: controls
        ? [
          identificationNumber, [CustomValidators.required, ...CustomValidators.commonValidations.qId]
        ]
        : identificationNumber,
      passportNumber: controls
        ? [passportNumber, [CustomValidators.required, , CustomValidators.maxLength(20)]]
        : passportNumber,
      iDDate: controls ? [iDDate, [CustomValidators.required]] : iDDate,
      // idexpiryDate: controls
      //   ? [idexpiryDate, [CustomValidators.required]]
      //   : idexpiryDate,
      passportDate: controls
        ? [passportDate, [CustomValidators.required]]
        : passportDate,
      iDExpiryDate: controls
        ? [iDExpiryDate, [CustomValidators.required]]
        : iDExpiryDate,
      startDate: controls
        ? [startDate, [CustomValidators.required]]
        : startDate,
      lastUpdateDate: controls
        ? [lastUpdateDate,]
        : lastUpdateDate,
      passportExpiryDate: controls ? [passportExpiryDate, [CustomValidators.required]] : passportExpiryDate
    };
  }

  getPassportValidation(): ValidatorFn[][] {
    return [
      [CustomValidators.required, CustomValidators.maxLength(20)],
      [CustomValidators.required],
      [CustomValidators.required],
    ];
  }

  getIdValidation(): ValidatorFn[][] {
    return [
      [CustomValidators.required, ...CustomValidators.commonValidations.qId],
      [CustomValidators.required],
      [CustomValidators.required],
    ]
  }

  toCharityOrganizationRealBenficiary(): RealBeneficiary {
    const {
      address,
      arName,
      enName,
      birthDate,
      birthLocation,
      buildingNumber,
      iDDate,
      iDExpiryDate,
      id,
      iddate,
      idexpiryDate,
      lastUpdateDate,
      nationality,
      passportDate,
      passportExpiryDate,
      passportNumber,
      qid,
      startDate,
      streetNumber,
      zoneNumber,
      birthDateString
    } = this;
    return new RealBeneficiary().clone({
      address,
      arabicName: arName,
      englishName: enName,
      birthDate,
      birthLocation,
      buildingNumber,
      iddate,
      iDDate,
      idexpiryDate,
      iDExpiryDate,
      objectDBId: id,
      lastUpdateDate,
      identificationNumber: qid,
      nationality,
      passportDate,
      passportExpiryDate,
      startDate,
      streetNumber,
      zoneNumber,
      passportNumber,
      birthDateString
    });
  }
}
