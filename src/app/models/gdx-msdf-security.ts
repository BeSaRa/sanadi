import { ISearchFieldsMap } from "@app/types/types";
import { SearchableCloneable } from "@models/searchable-cloneable";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { GdxMsdfSecurityResponseInterceptor } from "@app/model-interceptors/gdx-msdf-security-response-interceptor";

const gdxMsdfSecurityResponseInterceptor = new GdxMsdfSecurityResponseInterceptor();

@InterceptModel({
  receive: gdxMsdfSecurityResponseInterceptor.receive
})
export class GdxMsdfSecurityResponse extends SearchableCloneable<GdxMsdfSecurityResponse>{
  statusCode!: number;
  beneficiaryStatus!: string;

  searchFields: ISearchFieldsMap<GdxMsdfSecurityResponse> = {
    ...normalSearchFields(['beneficiaryStatus']),
  };
}
