import {normalSearchFields} from "@app/helpers/normal-search-fields";
import {ISearchFieldsMap} from "@app/types/types";
import {SearchableCloneable} from "./searchable-cloneable";
import {AdminResult} from "./admin-result";
import {infoSearchFields} from "@app/helpers/info-search-fields";
import {InterceptModel} from "@app/decorators/decorators/intercept-model";
import { GdxQatarRedCrescentResponseInterceptor } from "@app/model-interceptors/gdx-qatar-red-crescent-response-interceptor";

const gdxQatarRedCrescentResponseInterceptor = new GdxQatarRedCrescentResponseInterceptor();

@InterceptModel({
  send: gdxQatarRedCrescentResponseInterceptor.send,
  receive: gdxQatarRedCrescentResponseInterceptor.receive
})
export class GdxQatarRedCrescentResponse extends SearchableCloneable<GdxQatarRedCrescentResponse> {
  installmentsCount!: number;
  periodicType!: number;
  approvalDate!: number;
  aidAmount!: number;
  aidSuggestedAmount!: number;
  aidTotalPayedAmount!: number;
  aidRemainingAmount!: number;
  aidDescription!: string;
  aidStartPayDate!: string;
  aidLookupCategoryId!: number;
  aidLookupParentId!: number;
  aidLookupId!: number;
  donorId!: number;

  // extra properties
  periodicTypeInfo!: AdminResult;
  aidLookupCategoryInfo!: AdminResult;
  aidLookupParentInfo!: AdminResult;
  aidLookupInfo!: AdminResult;
  donorInfo!: AdminResult;
  approvalDateString!: string;
  aidStartPayDateString!: string;

  searchFields: ISearchFieldsMap<GdxQatarRedCrescentResponse> = {
    ...normalSearchFields(['approvalDateString', 'installmentsCount', 'aidSuggestedAmount','aidAmount',
      'aidRemainingAmount', 'aidTotalPayedAmount', 'aidStartPayDateString']),
    ...infoSearchFields(['periodicTypeInfo', 'aidLookupInfo', 'aidLookupParentInfo', 'donorInfo']),
  }
}
