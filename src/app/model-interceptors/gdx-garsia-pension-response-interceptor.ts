import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxGarsiaPensionResponse} from '@app/models/gdx-garsia-pension-response';
import {GdxPensionMonthPaymentInterceptor} from '@app/model-interceptors/gdx-pension-month-payment-interceptor';
import {GdxPensionMonthPayment} from '@app/models/gdx-pension-month-payment';
import {DateUtils} from '@helpers/date-utils';

const gdxGarsiaPensionMonthPaymentInterceptor = new GdxPensionMonthPaymentInterceptor();
export class GdxGarsiaPensionResponseInterceptor implements IModelInterceptor<GdxGarsiaPensionResponse> {
  receive(model: GdxGarsiaPensionResponse): GdxGarsiaPensionResponse {
    model.dummyIdentifier = DateUtils.getTimeStampFromDate(new Date())!;
    model.pensionMonthlyPayments = model.pensionMonthlyPayments.map(x => {
      return gdxGarsiaPensionMonthPaymentInterceptor.receive(new GdxPensionMonthPayment().clone(x));
    });
    return model;
  }

  send(model: Partial<GdxGarsiaPensionResponse>): Partial<GdxGarsiaPensionResponse> {
    model.pensionMonthlyPayments = model.pensionMonthlyPayments?.map((item: GdxPensionMonthPayment)=> {
      return gdxGarsiaPensionMonthPaymentInterceptor.send(item) as GdxPensionMonthPayment;
    });
    GdxGarsiaPensionResponseInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<GdxGarsiaPensionResponse>): void {
    delete model.searchFields;
    delete model.dummyIdentifier;
  }
}
