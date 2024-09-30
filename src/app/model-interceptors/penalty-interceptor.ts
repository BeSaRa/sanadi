import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { Penalty } from "@app/models/penalty";

export class PenaltyInterceptor implements IModelInterceptor<Penalty> {
    receive(model: Penalty): Penalty {
      model.statusInfo = AdminResult.createInstance(model.statusInfo??{});
      return model;
    }
  
    send(model: Partial<Penalty>): Partial<Penalty> {
      PenaltyInterceptor._deleteBeforeSend(model);
      return model;
    }
  
    private static _deleteBeforeSend(model: Partial<Penalty> | any): void {
      delete model.service;
      delete model.langService;
      delete model.searchFields;
      delete model.statusInfo;
    }
  
  }