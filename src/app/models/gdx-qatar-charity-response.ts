import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { ISearchFieldsMap } from "@app/types/types";
import { SearchableCloneable } from "./searchable-cloneable";
import { AdminResult } from "./admin-result";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { dateSearchFields } from "@app/helpers/date-search-fields";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { GdxQatarCharityResponseInterceptor } from "@app/model-interceptors/gdx-qatar-charity-response-interceptor";

const gdxQatarCharityResponseInterceptor = new GdxQatarCharityResponseInterceptor();

@InterceptModel({
  send:gdxQatarCharityResponseInterceptor.send,
  receive: gdxQatarCharityResponseInterceptor.receive
})
export class GdxQatarCharityResponse extends SearchableCloneable<GdxQatarCharityResponse>{
  installmentsCount!: number;
  periodicType!: number;
  approvalDate!: number;
  aidAmount!: number;
  aidSuggestedAmount!:number;
  aidTotalPayedAmount!: number;
  aidRemainingAmount!: number;
  aidDescription!: string;
  aidStartPayDate!: string;
  aidLookupCategoryId!: number;
  aidLookupParentId!: number;
  aidLookupId!: number;
  donorId!: number;

  // extra properties
  periodicTypeInfo!:AdminResult;
  aidLookupCategoryInfo!:AdminResult;
  aidLookupParentInfo!:AdminResult;
  aidLookupInfo!:AdminResult;
  donorInfo!:AdminResult;

  searchFields: ISearchFieldsMap<GdxQatarCharityResponse> = {
    ...normalSearchFields(['installmentsCount','aidAmount','aidSuggestedAmount','aidTotalPayedAmount',]),
    ...infoSearchFields(['periodicTypeInfo','aidLookupCategoryInfo','aidLookupInfo','aidLookupParentInfo','donorInfo']),
    ...dateSearchFields(['aidStartPayDate'])
  }
}
