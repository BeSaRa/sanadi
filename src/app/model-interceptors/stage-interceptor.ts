import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {Stage} from '@app/models/stage';

export class StageInterceptor implements IModelInterceptor<Stage> {
  receive(model: Stage): Stage {
    return model;
  }

  send(model: Partial<Stage>): Partial<Stage> {
    StageInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<Stage>): void {
    delete model.searchFields;
  }
}
