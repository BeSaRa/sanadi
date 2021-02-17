import {FactoryService} from '../services/factory.service';
import {SubventionLogService} from '../services/subvention-log.service';
import {AdminResult} from './admin-result';

export class SubventionLog {
  id!: number;
  subventionRequestId!: number;
  orgId!: number;
  orgBranchId!: number;
  orgUserId!: number;
  benId!: number;
  status!: number;
  statusDateModified: string | undefined;
  requestSerial!: number;
  requestFullSerial!: string;
  requestChannel!: number;
  requestType!: number;
  requestedAidAmount: number | undefined;
  requestYear: number | undefined;
  requestSummary: string | undefined;
  requestNotes: string | undefined;
  charityRefNo: string | undefined;
  charitySerialNo: number | undefined;
  creationDate!: string;
  approvalIndicator: number | undefined;
  requestStatusInfo: AdminResult | undefined;
  requestChannelInfo!: AdminResult;
  requestTypeInfo!: AdminResult;
  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;
  actionType!: number;
  actionTypeInfo!: AdminResult;
  actionTime!: string;
  userComments: string | undefined;

  // temp properties
  private service: SubventionLogService;
  actionTimeString!: string;

  constructor() {
    this.service = FactoryService.getService('SubventionLogService');
  }
}
