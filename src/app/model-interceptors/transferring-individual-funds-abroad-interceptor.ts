import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {TransferringIndividualFundsAbroad} from '@app/models/transferring-individual-funds-abroad';

export class TransferringIndividualFundsAbroadInterceptor implements IModelInterceptor<TransferringIndividualFundsAbroad> {
  caseInterceptor?: IModelInterceptor<TransferringIndividualFundsAbroad> | undefined;
  send(model: Partial<TransferringIndividualFundsAbroad>): Partial<TransferringIndividualFundsAbroad> {
    return model;
  }

  receive(model: TransferringIndividualFundsAbroad): TransferringIndividualFundsAbroad {
    return model;
  }
}
