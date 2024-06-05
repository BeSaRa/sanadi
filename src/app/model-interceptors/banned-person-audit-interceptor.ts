import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { BannedPersonAudit } from "@app/models/banned-person-audit";


export class BannedPersonAuditInterceptor implements IModelInterceptor<BannedPersonAudit> {
    send(model: Partial<BannedPersonAudit>): Partial<BannedPersonAudit> {
       return model;
    }
    receive(model: BannedPersonAudit): BannedPersonAudit {
        model.operationInfo = AdminResult.createInstance(model.operationInfo);
        model.orgInfo = AdminResult.createInstance(model.orgInfo);
        model.userInfo = AdminResult.createInstance(model.userInfo);
        model.statusInfo = AdminResult.createInstance(model.statusInfo);
        return model;
    }
}

