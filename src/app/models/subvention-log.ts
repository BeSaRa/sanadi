import {FactoryService} from '../services/factory.service';
import {SubventionLogService} from '../services/subvention-log.service';
import {AdminResult} from './admin-result';
import {searchFunctionType} from '../types/types';
import {isValidValue} from '../helpers/utils';


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

  searchFields: { [key: string]: searchFunctionType | string } = {
    organization: text => !this.orgInfo ? false : this.orgInfo.getName().toLowerCase().indexOf(text) !== -1,
    branch: text => !this.orgBranchInfo ? false : this.orgBranchInfo.getName().toLowerCase().indexOf(text) !== -1,
    user: text => !this.orgUserInfo ? false : this.orgUserInfo.getName().toLowerCase().indexOf(text) !== -1,
    actionType: text => !this.actionTypeInfo ? false : this.actionTypeInfo.getName().toLowerCase().indexOf(text) !== -1,
    actionTimeString: 'actionTimeString',
    userComments: 'userComments'
  };

  constructor() {
    this.service = FactoryService.getService('SubventionLogService');
  }

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
