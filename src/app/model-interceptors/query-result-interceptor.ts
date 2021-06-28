import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {QueryResult} from '../models/query-result';
import {AdminResult} from '../models/admin-result';

export class QueryResultInterceptor implements IModelInterceptor<QueryResult> {
  send(model: Partial<QueryResult>): Partial<QueryResult> {
    return model;
  }

  receive(model: QueryResult): QueryResult {
    model.fromUserInfo = AdminResult.createInstance(model.fromUserInfo);
    return model;
  }
}
