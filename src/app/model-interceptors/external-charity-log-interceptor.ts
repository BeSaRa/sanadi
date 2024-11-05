import { DateUtils } from "@app/helpers/date-utils";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { ExternalCharityLog } from "@app/models/external-charity-log";

export class ExternalCharityLogInterceptor implements IModelInterceptor<ExternalCharityLog> {
  receive(model: ExternalCharityLog): ExternalCharityLog {

    model.actionStatusInfo = AdminResult.createInstance(model.actionStatusInfo ?? {});
    model.internalUserInfo = AdminResult.createInstance(model.internalUserInfo ?? {});
    model.updatedOnString = DateUtils.getDateStringFromDate(model.updatedOn);
    model.actionTypeInfo = AdminResult.createInstance(model.actionTypeInfo ?? {});
    model.generalUserInfo = AdminResult.createInstance(model.generalUserInfo ?? {});
    return model;
  }

  send(model: Partial<ExternalCharityLog>): Partial<ExternalCharityLog> {
    delete model.updatedOnString;
    delete model.searchFields;
    delete model.actionStatusInfo
    delete model.internalUserInfo
    delete model.updatedOnString
    delete model.actionTypeInfo
    delete model.generalUserInfo
    delete model.updatedOn
    return model;
  }
}
