import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {QueryResult} from '../models/query-result';
import {AdminResult} from '../models/admin-result';

export class QueryResultInterceptor implements IModelInterceptor<QueryResult> {
  send(model: Partial<QueryResult>): Partial<QueryResult> {
    delete model.fromUserInfo;
    delete model.orgInfo;
    delete model.riskStatusInfo;
    delete model.displayNameInfo;
    return model;
  }

  receive(model: QueryResult): QueryResult {
    model.fromUserInfo = AdminResult.createInstance(model.fromUserInfo);
    model.orgInfo = AdminResult.createInstance(model.orgInfo);
    model.riskStatusInfo = AdminResult.createInstance(model.riskStatusInfo);
    model.displayNameInfo = AdminResult.createInstance(model.displayNameInfo);
    return model;
  }
}
