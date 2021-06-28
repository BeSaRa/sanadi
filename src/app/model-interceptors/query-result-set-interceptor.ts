import {IModelInterceptor} from '../interfaces/i-model-interceptor';
import {QueryResultSet} from '../models/query-result-set';
import {QueryResult} from '../models/query-result';
import {QueryResultInterceptor} from './query-result-interceptor';

const queryResultInterceptor: QueryResultInterceptor = new QueryResultInterceptor();

export class QueryResultSetInterceptor implements IModelInterceptor<QueryResultSet> {
  receive(model: QueryResultSet): QueryResultSet {
    model.items = model.items.map(item => {
      return queryResultInterceptor.receive((new QueryResult().clone(item)));
    });
    return model;
  }

  send(model: any): any {
    return model;
  }
}
