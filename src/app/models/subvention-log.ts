import { FactoryService } from '@services/factory.service';
import { SubventionLogService } from '@services/subvention-log.service';
import { AdminResult } from './admin-result';
import { ISearchFieldsMap } from '../types/types';
import { isValidValue } from '@helpers/utils';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { InterceptModel } from "@decorators/intercept-model";
import { SubventionLogInterceptor } from "@app/model-interceptors/subvention-log-interceptor";

const { send, receive } = new SubventionLogInterceptor();

@InterceptModel({ send, receive })
export class SubventionLog extends SearchableCloneable<SubventionLog>{
  id!: number;
  orgId!: number;
  orgUserId!: number;
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
    ...infoSearchFields(['orgInfo', 'orgInfo', 'orgUserInfo', 'actionTypeInfo']),
    ...normalSearchFields(['actionTimeString', 'userComments'])
  };

  constructor() {
    super();
    this.service = FactoryService.getService('SubventionLogService');
  }

}
