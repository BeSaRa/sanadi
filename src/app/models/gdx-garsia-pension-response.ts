import {GdxPensionMonthPayment} from '@app/models/gdx-pension-month-payment';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {InterceptModel} from '@decorators/intercept-model';
import {GdxGarsiaPensionResponseInterceptor} from '@app/model-interceptors/gdx-garsia-pension-response-interceptor';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {dateSearchFields} from '@helpers/date-search-fields';

const {send, receive} = new GdxGarsiaPensionResponseInterceptor();

@InterceptModel({send, receive})
export class GdxGarsiaPensionResponse extends SearchableCloneable<GdxGarsiaPensionResponse>{
  pensionArName!: string;
  pensionEmployer!: string;
  pensionStatus!: string;
  firstJoinDate!: string;
  endOfServiceDate!: string;
  pensionDeserveDate!: string;
  totalPensionDeserved!: number;
  finalServicePeriodDays!: number;
  finalServicePeriodMonths!: number;
  finalServicePeriodYears!: number;
  pensionMonthlyPayments: GdxPensionMonthPayment[] = [];

  //extra properties
  dummyIdentifier!: number;

  searchFields: ISearchFieldsMap<GdxGarsiaPensionResponse> = {
    ...normalSearchFields(['pensionArName', 'pensionEmployer', 'pensionStatus', 'finalServicePeriodDays', 'finalServicePeriodMonths', 'finalServicePeriodYears', 'totalPensionDeserved']),
    ...dateSearchFields(['firstJoinDate', 'endOfServiceDate', 'pensionDeserveDate'])
  }
}
