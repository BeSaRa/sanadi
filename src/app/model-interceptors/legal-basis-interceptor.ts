import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { LegalBasis } from "@app/models/legal-basis";

export class LegalBasisInterceptor implements IModelInterceptor<LegalBasis> {
    receive(model: LegalBasis): LegalBasis {
      model.statusInfo = AdminResult.createInstance(model.statusInfo??{});
      return model;
    }
  
    send(model: Partial<LegalBasis>): Partial<LegalBasis> {
      LegalBasisInterceptor._deleteBeforeSend(model);
      return model;
    }
  
    private static _deleteBeforeSend(model: Partial<LegalBasis> | any): void {
      delete model.service;
      delete model.langService;
      delete model.searchFields;
      delete model.statusInfo;
    }
  
  }