import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {InterceptModel} from '@decorators/intercept-model';
import {GdxKahramaaResponseInterceptor} from '@app/model-interceptors/gdx-kahramaa-response-interceptor';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';

const {send, receive} = new GdxKahramaaResponseInterceptor();
@InterceptModel({send, receive})
export class GdxKahramaaResponse extends SearchableCloneable<GdxKahramaaResponse> {
  parentNum!: number;
  tenantNum!: number;
  amount!: number;
  lastInvoiceDate!: string;
  balanceAgingCategory!: string;
  currentMonth!: number;
  month1To3!: number;
  month1To6!: number;
  month6To12!: number;
  over12Months!: number;
  depositPaidAmount!: number;
  depositPaidDate!: string;
  fees!: number;
  fine!: number;
  qId!: string;

  // extra properties
  searchFields: ISearchFieldsMap<GdxKahramaaResponse> = {
    ...normalSearchFields(['amount', 'fees', 'fine'])
  }
}
