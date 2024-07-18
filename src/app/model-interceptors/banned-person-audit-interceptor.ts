import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { BannedPersonAudit } from "@app/models/banned-person-audit";


export class BannedPersonAuditInterceptor implements IModelInterceptor<BannedPersonAudit> {
    send(model: Partial<BannedPersonAudit>): Partial<BannedPersonAudit> {
       return model;
    }
    receive(model: BannedPersonAudit): BannedPersonAudit {
        model.operationInfo = AdminResult.createInstance(model.operationInfo);
        model.departmentInfo = AdminResult.createInstance(model.departmentInfo);
        model.internalUserInfo = AdminResult.createInstance(model.internalUserInfo);
        model.requestStatusInfo = AdminResult.createInstance(model.requestStatusInfo);
        model.auditOperationInfo = AdminResult.createInstance(model.auditOperationInfo);
        return model;
    }
}

