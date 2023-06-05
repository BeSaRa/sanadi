import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {BestPractices} from '@app/models/best-practices';
import {AdminResult} from '@app/models/admin-result';

export class BestPracticesInterceptor implements IModelInterceptor<BestPractices> {
  receive(model: BestPractices): BestPractices {
    model.bestPracticesInfo = model.bestPracticesInfo.map(x => {
      return AdminResult.createInstance(x);
    });
    return model;
  }

  send(model: Partial<BestPractices>): Partial<BestPractices> {
    BestPracticesInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<BestPractices>): void {
    delete model.auditOperation;
    delete model.bestPracticesInfo;
    delete model.langService;
    delete model.searchFields;
  }
}
