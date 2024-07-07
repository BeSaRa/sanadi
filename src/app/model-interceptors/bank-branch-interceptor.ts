import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {BankBranch} from '@app/models/bank-branch';
import {DateUtils} from '@app/helpers/date-utils';
import {IMyDateModel} from '@nodro7/angular-mydatepicker';

export class BankBranchInterceptor implements IModelInterceptor<BankBranch> {
  send(model: Partial<BankBranch>): Partial<BankBranch> {
    model.establishmentDate = !model.establishmentDate ? '' : DateUtils.changeDateFromDatepicker(model.establishmentDate as unknown as IMyDateModel)?.toISOString();
    delete model.searchFields;
    return model;
  }

  receive(model: BankBranch): BankBranch {
    return model;
  }
}
