import {ValidatorFn, Validators} from '@angular/forms';

export interface TransferFundsReceiverOrganizationValidations {
  organizationArabicName: ValidatorFn | ValidatorFn[] | null;
  organizationEnglishName: ValidatorFn | ValidatorFn[] | null;
  headQuarterType: ValidatorFn | ValidatorFn[] | null;
  establishmentDate: ValidatorFn | ValidatorFn[] | null;
  country: ValidatorFn | ValidatorFn[] | null;
  region: ValidatorFn | ValidatorFn[] | null;
  city: ValidatorFn | ValidatorFn[] | null;
  detailsAddress: ValidatorFn | ValidatorFn[] | null;
  postalCode: ValidatorFn | ValidatorFn[] | null;
  website: ValidatorFn | ValidatorFn[] | null;
  organizationEmail: ValidatorFn | ValidatorFn[] | null;
  firstSocialMedia: ValidatorFn | ValidatorFn[] | null;
  secondSocialMedia: ValidatorFn | ValidatorFn[] | null;
  thirdSocialMedia: ValidatorFn | ValidatorFn[] | null;
}
