import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { FactoryService } from "@app/services/factory.service";
import { PenaltyViolationLogService } from "@app/services/penalty-violation-log.service";
import { ISearchFieldsMap } from "@app/types/types";
import { BaseModel } from "./base-model";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { PenaltyViolationLogInterceptor } from "@app/model-interceptors/penalty-violation-log-interceptor";
import { PenaltiesAndViolations } from "./penalties-and-violations";
const { send, receive } = new PenaltyViolationLogInterceptor();
@InterceptModel({send,receive})
export class PenaltyViolationLog extends BaseModel<PenaltyViolationLog,PenaltyViolationLogService>{
    clientData!: string;
    incidentNumber!: string;
    caseId!: string;
    caseObject!: string;
    orgId!: number;
    identificationNumber!: string;
    statusDateModified!: string;
    service!: PenaltyViolationLogService;
    case?:PenaltiesAndViolations
    searchFields: ISearchFieldsMap<PenaltyViolationLog> = {
        ...normalSearchFields(['incidentNumber', 'caseId', 'caseObject', 'orgId', 'identificationNumber']),
        // ...infoSearchFields(['statusInfo'])
    };

    constructor() {
        super();
        try {
            this.service = FactoryService.getService('PenaltyService');
        } catch { }
    }

    // getCase(){
    //     const caseObject = JSON.parse(this.caseObject);
    //     console.log(caseObject);
        
    // }
}