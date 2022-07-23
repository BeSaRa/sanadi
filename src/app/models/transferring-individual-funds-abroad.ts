import {CaseModel} from '@app/models/case-model';
import {TransferringIndividualFundsAbroadService} from '@services/transferring-individual-funds-abroad.service';
import {TransferringIndividualFundsAbroadInterceptor} from '@app/model-interceptors/transferring-individual-funds-abroad-interceptor';
import {InterceptModel} from '@decorators/intercept-model';

const interceptor = new TransferringIndividualFundsAbroadInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})

export class TransferringIndividualFundsAbroad extends CaseModel<TransferringIndividualFundsAbroadService, TransferringIndividualFundsAbroad> {
    service!: TransferringIndividualFundsAbroadService;
}
