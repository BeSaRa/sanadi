import {IStats} from '../interfaces/istats';
import {QueryResult} from './query-result';

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
