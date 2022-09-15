import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {InterceptModel} from '@decorators/intercept-model';
import {GdxMawaredResponseInterceptor} from '@app/model-interceptors/gdx-mawared-response-interceptor.interceptor';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';

const {send, receive} = new GdxMawaredResponseInterceptor();
@InterceptModel({send, receive})
export class GdxMawaredResponse extends SearchableCloneable<GdxMawaredResponse> {
  empNameEn!: string;
  empNameAr!: string;

  empQID!: string;
  entityId!: number;
  entityName!: string;

  firstMonth!: number;
  firstPayment!: number;

  secondMonth!: number;
  secondPayment!: number;

  thirdMonth!: number;
  thirdPayment!: number;

  searchFields: ISearchFieldsMap<GdxMawaredResponse> = {
    ...normalSearchFields(['empNameAr', 'empNameEn', 'empQID', 'entityName', 'entityId', 'firstMonth', 'firstPayment', 'secondMonth', 'secondPayment', 'thirdMonth', 'thirdPayment'])
  }
}
