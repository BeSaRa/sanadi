import { BannedPersonAuditInterceptor } from "@app/model-interceptors/banned-person-audit-interceptor";
import { AdminResult } from "./admin-result";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";

const { send, receive } = new BannedPersonAuditInterceptor();
@InterceptModel({send,receive})
export class BannedPersonAudit {
    qId!: string;
    domainName!: string;
    clientIP!: string;
    id!: number;
    auditId!: number;
    updatedOn!: string;
    statusDateModified!: string;
    operationInfo!: AdminResult;
    orgInfo!: AdminResult;
    userInfo!: AdminResult;
    statusInfo!: AdminResult;

}
