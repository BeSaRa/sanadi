import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {AdminResult} from '@app/models/admin-result';
import { FundSummary } from '@app/models/fund-summary';

export class FundSummaryInterceptor implements IModelInterceptor<FundSummary> {
  receive(model: FundSummary): FundSummary {
    model.creatorInfo && (model.creatorInfo = AdminResult.createInstance(model.creatorInfo));
    model.profileInfo && (model.profileInfo = AdminResult.createInstance(model.profileInfo));
    return model;
  }

  send(model: Partial<FundSummary>): Partial<FundSummary> {
    FundSummaryInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<FundSummary>): void {
    delete model.creatorInfo;
    delete model.profileInfo;
  }
}
