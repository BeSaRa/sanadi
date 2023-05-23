import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {TransferFundsExecutiveManagement} from '@app/models/transfer-funds-executive-management';
import {AdminResult} from '@app/models/admin-result';

export class ExecutiveManagementListInterceptor implements IModelInterceptor<TransferFundsExecutiveManagement> {
  send(model: Partial<TransferFundsExecutiveManagement>): Partial<TransferFundsExecutiveManagement> {
    delete model.searchFields;
    delete model.langService;
    delete model.executiveNationalityInfo;
    return model;
  }

  receive(model: TransferFundsExecutiveManagement): TransferFundsExecutiveManagement {
    model.executiveNationalityInfo = model.executiveNationalityInfo ? AdminResult.createInstance(model.executiveNationalityInfo) : AdminResult.createInstance({});
    return model;
  }
}
