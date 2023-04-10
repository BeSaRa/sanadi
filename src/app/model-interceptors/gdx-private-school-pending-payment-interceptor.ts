import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { GdxMoePrivateSchoolPendingPayment } from "@app/models/gdx-moe-private-school-pending-payment";

export class GdxPrivateSchoolPendingPaymentInterceptor implements IModelInterceptor<GdxMoePrivateSchoolPendingPayment> {
    receive(model: GdxMoePrivateSchoolPendingPayment): GdxMoePrivateSchoolPendingPayment {
      return model;
    }
    send(model: Partial<GdxMoePrivateSchoolPendingPayment>): Partial<GdxMoePrivateSchoolPendingPayment> {
      return model;
    }
  }
  