import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {Payment} from '@app/models/payment';
import {DateUtils} from "@helpers/date-utils";

export class PaymentInterceptor implements IModelInterceptor<Payment> {
  receive(model: Payment): Payment {
    model.dueDateString = DateUtils.getDateStringFromDate(model.dueDate, 'DATEPICKER_FORMAT');
    return model;
  }

  send(model: Partial<Payment>): Partial<Payment> {
    model.dueDate = DateUtils.getDateStringFromDate(model.dueDate);
    PaymentInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<Payment>): void {
    delete model.searchFields;
    delete model.dueDateString;
  }
}
