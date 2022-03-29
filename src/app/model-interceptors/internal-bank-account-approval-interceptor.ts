import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {InternalBankAccountApproval} from '@app/models/internal-bank-account-approval';

export class InternalBankAccountApprovalInterceptor implements IModelInterceptor<InternalBankAccountApproval>{
    send(model: Partial<InternalBankAccountApproval>): Partial<InternalBankAccountApproval> {
        return model;
    }
    receive(model: InternalBankAccountApproval): InternalBankAccountApproval {
        return model;
    }
}
