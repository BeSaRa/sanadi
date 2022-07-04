import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {Result} from '@app/models/result';

export class ResultInterceptor implements IModelInterceptor<Result> {
  receive(model: Result): Result {
    return model;
  }

  send(model: Partial<Result>): Partial<Result> {
    return model;
  }

  private static _deleteBeforeSend(model: Partial<Result>): void {

  }
}
