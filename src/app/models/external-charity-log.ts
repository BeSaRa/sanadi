import { ISearchFieldsMap } from '@app/types/types';
import { infoSearchFields } from '@helpers/info-search-fields';
import { normalSearchFields } from '@helpers/normal-search-fields';
import { SearchableCloneable } from '@models/searchable-cloneable';
import { AdminResult } from './admin-result';
import { ExternalCharityLogInterceptor } from '@app/model-interceptors/external-charity-log-interceptor';
import { InterceptModel } from '@app/decorators/decorators/intercept-model';

const {send, receive} = new ExternalCharityLogInterceptor();

@InterceptModel({send, receive})
export class ExternalCharityLog extends SearchableCloneable<ExternalCharityLog> {

  actionDate!:string;
  actionStatus!:number;
  actionStatusInfo!:AdminResult;
  comments!:string;
  internalUserId!:string;
  internalUserInfo!:AdminResult;
  actionTypeInfo!:AdminResult;
  generalUserInfo!:AdminResult;
  actionTime!:string;
  id!: number;
  updatedOn!: string;
  

  // extra properties
  updatedOnString!: string;

  searchFields: ISearchFieldsMap<ExternalCharityLog> = {
    ...normalSearchFields(['comments', 'updatedOnString']),
    ...infoSearchFields(['actionStatusInfo', 'internalUserInfo', ])
  }

}
