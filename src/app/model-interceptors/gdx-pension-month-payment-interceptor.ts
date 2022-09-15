import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxPensionMonthPayment} from '@app/models/gdx-pension-month-payment';

export class GdxPensionMonthPaymentInterceptor implements IModelInterceptor<GdxPensionMonthPayment>{
  receive(model: GdxPensionMonthPayment): GdxPensionMonthPayment {
    return model;
  }

  send(model: Partial<GdxPensionMonthPayment>): Partial<GdxPensionMonthPayment> {
    GdxPensionMonthPaymentInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<GdxPensionMonthPayment>): void {

  }
}
