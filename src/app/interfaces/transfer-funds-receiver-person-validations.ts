import {ValidatorFn} from '@angular/forms';

export interface TransferFundsReceiverPersonValidations {
  receiverNameLikePassport: ValidatorFn | ValidatorFn[] | null;
  receiverEnglishNameLikePassport: ValidatorFn | ValidatorFn[] | null;
  receiverJobTitle: ValidatorFn | ValidatorFn[] | null;
  receiverNationality: ValidatorFn | ValidatorFn[] | null;
  receiverIdentificationNumber: ValidatorFn | ValidatorFn[] | null;
  receiverPassportNumber: ValidatorFn | ValidatorFn[] | null;
  receiverPhone1: ValidatorFn | ValidatorFn[] | null;
  receiverPhone2: ValidatorFn | ValidatorFn[] | null;
}
