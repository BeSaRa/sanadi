import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {AdminResult} from '@app/models/admin-result';
import { FundUnit } from '@app/models/fund-unit';

export class FundUnitInterceptor implements IModelInterceptor<FundUnit> {
  receive(model: FundUnit): FundUnit {
    model.approvalStatusInfo && (model.approvalStatusInfo = AdminResult.createInstance(model.approvalStatusInfo));
    model.permitTypeInfo && (model.permitTypeInfo = AdminResult.createInstance(model.permitTypeInfo));
    return model;
  }

  send(model: Partial<FundUnit>): Partial<FundUnit> {
    FundUnitInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<FundUnit>): void {
    delete model.approvalStatusInfo;
    delete model.permitTypeInfo;
  }
}
