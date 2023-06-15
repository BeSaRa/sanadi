import { DateUtils } from "@app/helpers/date-utils";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { Permission } from "@app/models/permission";
import { FactoryService } from "@app/services/factory.service";
import { LookupService } from "@app/services/lookup.service";

export class PermissionInterceptor implements IModelInterceptor<Permission> {
  receive(model: Permission): Permission {
    model.categoryInfo = AdminResult.createInstance(model.categoryInfo ?? {});
    model.groupInfo = AdminResult.createInstance(model.groupInfo ?? {});
    return model;
  }

  send(model: Partial<Permission>): Partial<Permission> {
    PermissionInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<Permission> | any): void {
    delete model.service;
    delete model.searchFields;
    delete model.statusDateModifiedString;
    delete model.categoryInfo;
    delete model.langService;
    delete model.groupInfo;
  }

}
