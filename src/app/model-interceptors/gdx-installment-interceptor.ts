import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { GdxMoeInstallment } from "@app/models/gdx-moe-Installment";

export class GdxInstallmentInterceptor implements IModelInterceptor<GdxMoeInstallment> {
    receive(model: GdxMoeInstallment): GdxMoeInstallment {
      return model;
    }
  
    send(model: Partial<GdxMoeInstallment>): Partial<GdxMoeInstallment> {
      return model;
    }
  }