import {ISearchFieldsMap} from "@app/types/types";
import {SearchableCloneable} from "@models/searchable-cloneable";
import {InterceptModel} from "@app/decorators/decorators/intercept-model";
import {GdxMsdfSecurityResponseInterceptor} from "@app/model-interceptors/gdx-msdf-security-response-interceptor";
import {AdminResult} from "@models/admin-result";
import {infoSearchFields} from "@helpers/info-search-fields";

const gdxMsdfSecurityResponseInterceptor = new GdxMsdfSecurityResponseInterceptor();

@InterceptModel({
  receive: gdxMsdfSecurityResponseInterceptor.receive
})
export class GdxMsdfSecurityResponse extends SearchableCloneable<GdxMsdfSecurityResponse>{
  statusCode!: number;
  statusInfo!: AdminResult;

  searchFields: ISearchFieldsMap<GdxMsdfSecurityResponse> = {
    ...infoSearchFields(['statusInfo'])
  };
}
