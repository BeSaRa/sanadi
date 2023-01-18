import {AdminResult} from '@app/models/admin-result';
import {InterceptModel} from '@decorators/intercept-model';
import {GdxServiceLogInterceptor} from '@app/model-interceptors/gdx-service-log.interceptor';
import {isValidValue} from '@helpers/utils';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';
import {dateSearchFields} from '@helpers/date-search-fields';

const gdxServiceLogInterceptor = new GdxServiceLogInterceptor();

@InterceptModel({
  receive: gdxServiceLogInterceptor.receive
})
export class GdxServiceLog {
  id!: number;
  benId!: number;
  gdxServiceId!: string;
  actionTime!: string;
  orgId!: number;
  gdxServiceResponse!: string;
  orgUserId!: string;
  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;
  viewable!: boolean;
  status!: boolean;
  //extra properties
  gdxServiceResponseList: any[] = [];
  gdxServiceResponseParsed: any;
  actionTimeString: string = '';

  searchFields: ISearchFieldsMap<GdxServiceLog> = {
    ...normalSearchFields([]),
    ...infoSearchFields(['orgInfo', 'orgUserInfo']),
    ...dateSearchFields(['actionTime'])
  }
}
