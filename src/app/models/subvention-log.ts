import {FactoryService} from '../services/factory.service';
import {SubventionLogService} from '../services/subvention-log.service';
import {AdminResult} from './admin-result';
import {ISearchFieldsMap} from '../types/types';
import {isValidValue} from '../helpers/utils';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {SearchableCloneable} from '@app/models/searchable-cloneable';

export class SubventionLog extends SearchableCloneable<SubventionLog>{
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

  searchFields: ISearchFieldsMap<SubventionLog> = {
    ...infoSearchFields(['orgInfo', 'orgBranchInfo', 'orgUserInfo', 'actionTypeInfo']),
    ...normalSearchFields(['actionTimeString', 'userComments'])
  };

  constructor() {
    super();
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
