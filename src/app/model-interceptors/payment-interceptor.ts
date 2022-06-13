import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {Payment} from '@app/models/payment';

export class PaymentInterceptor implements  IModelInterceptor<Payment>{
  receive(model: Payment): Payment {
    return model;
  }

  send(model: Partial<Payment>): Partial<Payment> {
    PaymentInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<Payment>): void {

  }
}
