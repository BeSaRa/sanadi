import {AdminResult} from './admin-result';
import {SubventionRequestPartialLogService} from '../services/subvention-request-partial-log.service';
import {FactoryService} from '../services/factory.service';
import {isValidValue} from '../helpers/utils';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {infoSearchFields} from '@app/helpers/info-search-fields';
import {normalSearchFields} from '@app/helpers/normal-search-fields';

export class SubventionRequestPartialLog extends SearchableCloneable<SubventionRequestPartialLog> {
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
    super();
    this.subventionRequestPartialLogService = FactoryService.getService('SubventionRequestPartialLogService');
  }

  searchFields: ISearchFieldsMap<SubventionRequestPartialLog> = {
    ...infoSearchFields(['benCategoryInfo', 'requestTypeInfo', 'actionTypeInfo', 'orgAndBranchInfo', 'orgUserInfo']),
    ...normalSearchFields(['requestFullSerial', 'creationDateString', 'requestSummary', 'actionDateString'])
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
