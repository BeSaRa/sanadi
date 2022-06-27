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
  orgBranchId!: number;
  orgId!: number;
  gdxServiceResponse!: string;
  orgUserId!: string;
  orgBranchInfo!: AdminResult;
  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;

  //extra properties
  gdxServiceResponseList: any[] = [];
  gdxServiceResponseParsed: any;
  actionTimeString: string = '';

  get orgAndBranchInfo() {
    if (!isValidValue(this.orgInfo.getName())) {
      return new AdminResult();
    }
    return AdminResult.createInstance({
      arName: this.orgInfo.arName + ' - ' + this.orgBranchInfo.arName,
      enName: this.orgInfo.enName + ' - ' + this.orgBranchInfo.enName,
    });
  }

  searchFields: ISearchFieldsMap<GdxServiceLog> = {
    ...normalSearchFields([]),
    ...infoSearchFields(['orgAndBranchInfo', 'orgUserInfo']),
    ...dateSearchFields(['actionTime'])
  }
}
