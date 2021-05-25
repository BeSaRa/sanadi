import {IBulkResultItem} from './ibulk-result-item';

export interface IBulkResult {
  failedOperations: IBulkResultItem[]
}
