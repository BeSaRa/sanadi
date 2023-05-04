import {AdminResult} from './admin-result';
import {InterceptModel} from '@decorators/intercept-model';
import {AuditLogInterceptor} from '@app/model-interceptors/audit-log-interceptor';
import {SearchableCloneable} from '@models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {infoSearchFields} from '@helpers/info-search-fields';
import {normalSearchFields} from '@helpers/normal-search-fields';

const {send, receive} = new AuditLogInterceptor();

@InterceptModel({send, receive})
export class AuditLog extends SearchableCloneable<AuditLog> {
  auditId!: number;
  updatedOn!: string;
  operation!: number;
  operationInfo!: AdminResult;
  status!: number;
  orgInfo!: AdminResult;
  userInfo!: AdminResult;
  clientData: string = '';
  statusDateModified: string = '';
  statusInfo!: AdminResult;
  qId!: number;
  clientIP: string = '';

  // extra properties
  statusDateModifiedString!: string;
  updatedOnString!: string;

  searchFields: ISearchFieldsMap<AuditLog> = {
    ...normalSearchFields(['qId', 'clientIP', 'updatedOnString']),
    ...infoSearchFields(['userInfo', 'orgInfo', 'operationInfo'])
  }

}
