import {AuditOperationTypes} from '@enums/audit-operation-types';
import {IAdminResultByProperty} from '@contracts/i-admin-result-by-property';

export interface IAuditModelProperties<M> extends IAdminResultByProperty<M> {
  auditOperation: AuditOperationTypes;
}
