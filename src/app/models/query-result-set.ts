import { IStats } from '@contracts/istats';
import { QueryResult } from './query-result';
import { InterceptModel } from "@decorators/intercept-model";
import { QueryResultSetInterceptor } from "@app/model-interceptors/query-result-set-interceptor";

const { send, receive } = new QueryResultSetInterceptor()

@InterceptModel({ send, receive })
export class QueryResultSet {
  identifier!: string;
  queryExecuteTime!: string;
  offset!: number;
  size!: number;
  requestedSize!: number;
  totalCount!: number;
  countLimitExceeded!: boolean;
  countLimit!: number;
  stats!: IStats;
  items: QueryResult[] = [];
}
