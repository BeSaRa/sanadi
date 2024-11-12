import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { LegalAction } from "@app/models/legal-action";

export class LegalActionInterceptor implements IModelInterceptor<LegalAction> {
    receive(model: LegalAction): LegalAction {
      model.statusInfo = AdminResult.createInstance(model.statusInfo??{});
      model.mainActionInfo = AdminResult.createInstance(model.mainActionInfo??{});
      return model;
    }
  
    send(model: Partial<LegalAction>): Partial<LegalAction> {
      LegalActionInterceptor._deleteBeforeSend(model);
      return model;
    }
  
    private static _deleteBeforeSend(model: Partial<LegalAction> | any): void {
      delete model.service;
      delete model.langService;
      delete model.searchFields;
      delete model.statusInfo;
      delete model.mainActionInfo;
    }
  
  }