import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {QueryResultSet} from '../models/query-result-set';
import {QueryResult} from '../models/query-result';

export class QueryResultSetInterceptor implements IModelInterceptor<QueryResultSet> {
  receive(model: QueryResultSet): QueryResultSet {
    model.items = model.items.map(item => (new QueryResult().clone(item)));
    return model;
  }

  send(model: any): any {
    return model;
  }
}
