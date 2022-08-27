import {TransferFundsExecutiveManagement} from '@app/models/transfer-funds-executive-management';
import {TransferFundsCharityPurpose} from '@app/models/transfer-funds-charity-purpose';
import {UntypedFormGroup} from '@angular/forms';

export interface ITransferFundsAbroadComponent {
  form: UntypedFormGroup;
  selectedExecutives: TransferFundsExecutiveManagement[];
  selectedPurposes: TransferFundsCharityPurpose[];
}
