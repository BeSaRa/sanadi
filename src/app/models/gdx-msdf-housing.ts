import { GdxMsdfHousingResponseInterceptor } from '@model-interceptors/gdx-msdf-housing-response-interceptor';
import { ISearchFieldsMap } from "@app/types/types";
import { SearchableCloneable } from "./searchable-cloneable";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";

const gdxMsdfHousingResponseInterceptor = new GdxMsdfHousingResponseInterceptor();

@InterceptModel({
  receive: gdxMsdfHousingResponseInterceptor.receive
})
export class GdxMsdfHousingResponse extends SearchableCloneable<GdxMsdfHousingResponse>{
  beneficiaryType!: string;
  beneficiaryDate!: string;
  status!: number;

  //extra
  statusString!: string;

  searchFields: ISearchFieldsMap<GdxMsdfHousingResponse> = {
    ...normalSearchFields(['beneficiaryType', 'beneficiaryDate', 'statusString']),
  };
}
