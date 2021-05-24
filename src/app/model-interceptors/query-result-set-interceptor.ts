import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {QueryResultSet} from '../models/query-result-set';

export class QueryResultSetInterceptor implements IModelInterceptor<QueryResultSet> {
  receive(model: QueryResultSet): QueryResultSet {
    return model;
  }

  send(model: any): any {
    return model;
  }
}
