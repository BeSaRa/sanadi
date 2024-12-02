import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { infoSearchFields } from "@app/helpers/info-search-fields";
import { normalSearchFields } from "@app/helpers/normal-search-fields";
import { PenaltyViolationLogInterceptor } from "@app/model-interceptors/penalty-violation-log-interceptor";
import { FactoryService } from "@app/services/factory.service";
import { PenaltyViolationLogService } from "@app/services/penalty-violation-log.service";
import { ISearchFieldsMap } from "@app/types/types";
import { AdminResult } from "./admin-result";
import { BaseModel } from "./base-model";
import { PenaltiesAndViolations } from "./penalties-and-violations";
import { Penalty } from "./penalty";
const { send, receive } = new PenaltyViolationLogInterceptor();
@InterceptModel({send,receive})
export class PenaltyViolationLog extends BaseModel<PenaltyViolationLog,PenaltyViolationLogService>{
    clientData!: string;
    incidentNumber!: string;
    caseId!: string;
    caseObject!: string;
    orgId!: number;
    penalty!:number;
    organizationInfo!: AdminResult;
    penaltiesInfo!:Penalty[];
    penaltyDate!:string;
    identificationNumber!: string;
    statusDateModified!: string;
    service!: PenaltyViolationLogService;
    case?:PenaltiesAndViolations
    penaltiesInfoString! :string
    searchFields: ISearchFieldsMap<PenaltyViolationLog> = {
        ...normalSearchFields(['incidentNumber', 'updatedOnString','penaltyDateString','penaltiesInfoString']),
        ...infoSearchFields([ 'organizationInfo'])
    };
    updatedOnString! :string;
    penaltyDateString! :string;

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