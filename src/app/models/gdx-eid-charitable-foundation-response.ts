import {normalSearchFields} from "@app/helpers/normal-search-fields";
import {ISearchFieldsMap} from "@app/types/types";
import {SearchableCloneable} from "./searchable-cloneable";
import {AdminResult} from "./admin-result";
import {infoSearchFields} from "@app/helpers/info-search-fields";
import {InterceptModel} from "@app/decorators/decorators/intercept-model";
import { GdxEidCharitableFoundationResponseInterceptor } from "@app/model-interceptors/gdx-eid-charitable-foundation-response-interceptor";

const gdxEidCharitableFoundationResponseInterceptor = new GdxEidCharitableFoundationResponseInterceptor();

@InterceptModel({
  send: gdxEidCharitableFoundationResponseInterceptor.send,
  receive: gdxEidCharitableFoundationResponseInterceptor.receive
})
export class GdxEidCharitableFoundationResponse extends SearchableCloneable<GdxEidCharitableFoundationResponse> {
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

  searchFields: ISearchFieldsMap<GdxEidCharitableFoundationResponse> = {
    ...normalSearchFields(['approvalDateString', 'installmentsCount', 'aidSuggestedAmount','aidAmount',
      'aidRemainingAmount', 'aidTotalPayedAmount', 'aidStartPayDateString']),
    ...infoSearchFields(['periodicTypeInfo', 'aidLookupInfo', 'aidLookupParentInfo', 'donorInfo']),
  }
}
