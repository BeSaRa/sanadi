import {AdminResult} from '@models/admin-result';

export interface IValueDifference {
  labelInfo: AdminResult,
  oldValueInfo: AdminResult,
  newValueInfo: AdminResult
}
