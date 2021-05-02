import {AdminResult} from './admin-result';
import {SubventionRequestPartialLogService} from '../services/subvention-request-partial-log.service';
import {FactoryService} from '../services/factory.service';

export class SubventionRequestPartialLog {
  requestId!: number;
  charityRefNo: string = '';
  requestFullSerial: string = '';
  creationDate!: string;
  orgId!: number;
  orgBranchId!: number;
  orgUserId!: number;
  orgUserInfo!: AdminResult;
  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  actionType!: number;
  actionTypeInfo!: AdminResult;
  actionTime?: string;
  requestSummary?: string;
  benCategory!: number;
  benCategoryInfo!: AdminResult;
  requestType!: number;
  requestTypeInfo!: AdminResult;

  //extra properties
  creationDateString!: string;
  actionDateString?: string;

  subventionRequestPartialLogService: SubventionRequestPartialLogService;

  constructor() {
    this.subventionRequestPartialLogService = FactoryService.getService('SubventionRequestPartialLogService');
  }
}
