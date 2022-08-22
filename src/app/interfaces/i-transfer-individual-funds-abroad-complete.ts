import {UntypedFormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {TransferFundsExecutiveManagement} from '@app/models/transfer-funds-executive-management';
import {TransferFundsCharityPurpose} from '@app/models/transfer-funds-charity-purpose';

export interface ITransferIndividualFundsAbroadComplete {
  completeWithForm(form: UntypedFormGroup, selectedExecutives: TransferFundsExecutiveManagement[], selectedPurposes: TransferFundsCharityPurpose[]): DialogRef;
}
