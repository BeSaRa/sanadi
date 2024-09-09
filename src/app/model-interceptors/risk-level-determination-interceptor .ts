import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { RiskLevelDetermination } from "@app/models/risk-level-determination";

export class RiskLevelDeterminationInterceptor implements IModelInterceptor<RiskLevelDetermination> {
    receive(model: RiskLevelDetermination): RiskLevelDetermination {
      model.statusInfo = AdminResult.createInstance(model.statusInfo??{});
      model.requestStatusInfo = AdminResult.createInstance(model.requestStatusInfo??{});
      model.countryInfo = AdminResult.createInstance(model.countryInfo??{});
      model.applicantInfo = AdminResult.createInstance(model.applicantInfo??{});
      model.operationInfo = AdminResult.createInstance(model.operationInfo??{});
      return model;
    }
  
    send(model: Partial<RiskLevelDetermination>): Partial<RiskLevelDetermination> {
      RiskLevelDeterminationInterceptor._deleteBeforeSend(model);
      return model;
    }
  
    private static _deleteBeforeSend(model: Partial<RiskLevelDetermination> | any): void {
      delete model.service;
      delete model.langService;
      delete model.searchFields;
      delete model.statusInfo;
      delete model.requestStatusInfo;
      delete model.countryInfo;
      delete model.applicantInfo;
      delete model.requiredAttentionLevelInfo;
      delete model.operationInfo;
      delete model.arName;
      delete model.enName;

    }
  
  }