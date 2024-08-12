import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { RiskLevel } from "@app/models/risk-level";

export class RiskLevelInterceptor implements IModelInterceptor<RiskLevel> {
    receive(model: RiskLevel): RiskLevel {
      model.requiredAttentionLevelInfo = AdminResult.createInstance(model.requiredAttentionLevelInfo??{});
      return model;
    }
  
    send(model: Partial<RiskLevel>): Partial<RiskLevel> {
      RiskLevelInterceptor._deleteBeforeSend(model);
      return model;
    }
  
    private static _deleteBeforeSend(model: Partial<RiskLevel> | any): void {
      delete model.service;
      delete model.langService;
      delete model.searchFields;
      delete model.statusInfo;
      delete model.requiredAttentionLevelInfo;
    }
  
  }