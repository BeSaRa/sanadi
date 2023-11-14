import { AdminResult } from '@app/models/admin-result';
import { WorldCheckSearch } from '@app/models/world-check-search';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class WorldCheckInterceptor implements IModelInterceptor<WorldCheckSearch> {
  send(model: Partial<WorldCheckSearch>): Partial<WorldCheckSearch> {
    delete model.internalUserDeptInfo;
    delete model.internalUserInfo;
    return model;
  }

  receive(model: WorldCheckSearch): WorldCheckSearch {
    model.internalUserDeptInfo = AdminResult.createInstance(model.internalUserDeptInfo);
    model.internalUserInfo = AdminResult.createInstance(model.internalUserInfo);

    return model;
  }

}
