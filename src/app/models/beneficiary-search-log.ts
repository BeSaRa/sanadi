import {AdminResult} from '@app/models/admin-result';
import {ISearchFieldsMap} from '@app/types/types';
import {infoSearchFields} from '@helpers/info-search-fields';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {isValidValue} from '@helpers/utils';
import {InterceptModel} from '@decorators/intercept-model';
import {
  BeneficiarySearchLogCriteriaInterceptor
} from '@app/model-interceptors/beneficiary-search-log-criteria-interceptor';

const beneficiarySearchLogCriteriaInterceptor = new BeneficiarySearchLogCriteriaInterceptor();

@InterceptModel({
  receive: beneficiarySearchLogCriteriaInterceptor.receive
})
export class BeneficiarySearchLog {
  id!: number;
  benIdNationality!: number;
  benIdType!: number;
  benIsPrimaryId!: boolean;
  benIdNumber!: string;
  actionTime!: string;
  orgId!: number;
  orgUserId!: number;
  orgInfo!: AdminResult;
  orgUserInfo!: AdminResult;
  benIdTypeInfo!: AdminResult;
  benNationalityInfo!: AdminResult;

  // extra properties
  actionTimeString!: string;

  searchFields: ISearchFieldsMap<BeneficiarySearchLog> = {
    ...normalSearchFields(['actionTimeString']),
    ...infoSearchFields(['orgInfo', 'orgUserInfo']),
  }; // add the same columns to displayColumns
}
