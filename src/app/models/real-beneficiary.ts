import { ValidatorFn } from '@angular/forms';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { RealBeneficiaryInterceptor } from '@app/model-interceptors/real-beneficiary-interceptors';
import { CustomValidators } from '@app/validators/custom-validators';
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';

const { receive, send } = new RealBeneficiaryInterceptor()


@InterceptModel({
  receive, send
})
export class RealBeneficiary extends SearchableCloneable<RealBeneficiary> {
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
