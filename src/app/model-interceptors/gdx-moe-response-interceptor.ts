import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {GdxMoeResponse} from '@app/models/gdx-moe-pending-installments';
import { GdxPrivateSchoolPendingPaymentInterceptor } from './gdx-private-school-pending-payment-interceptor';
import { GdxMoePrivateSchoolPendingPayment } from '@app/models/gdx-moe-private-school-pending-payment';
import { GdxInstallmentInterceptor } from './gdx-installment-interceptor';
import { GdxMoeInstallment } from '@app/models/gdx-moe-Installment';
import { DateUtils } from '@app/helpers/date-utils';

const privateSchoolPendingPaymentInterceptor = new GdxPrivateSchoolPendingPaymentInterceptor()
const installmentInterceptor = new GdxInstallmentInterceptor()

export class GdxMoeResponseInterceptor implements IModelInterceptor<GdxMoeResponse> {
  receive(model: GdxMoeResponse): GdxMoeResponse {
    model.dummyIdentifier = DateUtils.getTimeStampFromDate(new Date())!;
    model.privateSchoolPendingPayment = model.privateSchoolPendingPayment.map(item=>{
      return privateSchoolPendingPaymentInterceptor.receive(new GdxMoePrivateSchoolPendingPayment().clone(item))
    })
    model.installments = model.installments.map(item=>{
      return installmentInterceptor.receive(new GdxMoeInstallment().clone(item))
    })
    
    return model;
  }

  send(model: Partial<GdxMoeResponse>): Partial<GdxMoeResponse> {
    delete model.dummyIdentifier;
    return model;
  }
}
