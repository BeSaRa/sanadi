import {AdminResult} from './admin-result';
import {isValidValue} from '../helpers/utils';

export class AuditLog {
  auditId!: number;
  updatedOn!: string;
  operation!: number;
  operationInfo!: AdminResult;
  status!: number;
  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;
  clientData: string = '';
  statusDateModified: string = '';
  statusInfo!: AdminResult;
  qId!: number;
  clientIP: string = '';

  // extra properties
  statusDateModifiedString!: string;

  get orgAndBranchInfo() {
    if (!isValidValue(this.orgInfo.getName())) {
      return new AdminResult();
    }
    return AdminResult.createInstance({
      arName: this.orgInfo.arName + ' - ' + this.orgBranchInfo.arName,
      enName: this.orgInfo.enName + ' - ' + this.orgBranchInfo.enName,
    });
  }
}
