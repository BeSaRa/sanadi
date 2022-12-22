import {AdminResult} from '@app/models/admin-result';

export interface IExternalUserBasicInfoDifference {
  labelInfo: AdminResult,
  oldValueInfo: AdminResult,
  newValueInfo: AdminResult
}

export interface IExternalUserServicePermissionDifference {
  serviceInfo: AdminResult,
  canManageOld: boolean,
  canManageNew: boolean,
  canAddOld: boolean,
  canAddNew: boolean,
  canViewOld: boolean,
  canViewNew: boolean,
  approvalOld: boolean,
  approvalNew: boolean,
  followUpOld: boolean,
  followUpNew: boolean,
}
