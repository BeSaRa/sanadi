import {InterceptModel} from '@decorators/intercept-model';
import {GdxMociResponseInterceptor} from '@app/model-interceptors/gdx-moci-response-interceptor';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';

const gdxMociResponseInterceptor = new GdxMociResponseInterceptor();

@InterceptModel({
  receive: gdxMociResponseInterceptor.receive
})
export class GdxMociResponse extends SearchableCloneable<GdxMociResponse>{
  commerciallicenseNumber!: string;
  crnStatus!: string;
  commercialType!: string;
  identityNum!: string;
  IdentityType!: string;
  nationality!: string;
  orgCRNNum!: string;
  orgStatus!: string;
  ownerStatus!: string;
  ownerType!: string;
  primaryEstablishmentDivinTypeCD!: string;
  primaryEstablishmentName!: string;
  primaryEstablishmentCPN!: string;


  searchFields: ISearchFieldsMap<GdxMociResponse> = {
      ...normalSearchFields(['primaryEstablishmentName', 'commerciallicenseNumber', 'crnStatus', 'ownerType', 'ownerStatus'])
  }
}
