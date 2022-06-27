import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {FundingSource} from '@app/models/funding-source';
import {AdminResult} from '@app/models/admin-result';

export class FundingSourceInterceptor implements IModelInterceptor<FundingSource> {
  receive(model: FundingSource): FundingSource {
    model.categoryInfo && (model.categoryInfo = AdminResult.createInstance(model.categoryInfo));
    return model;
  }

  send(model: Partial<FundingSource>): Partial<FundingSource> {
    FundingSourceInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<FundingSource>): void {
    delete model.categoryInfo;
  }
}
