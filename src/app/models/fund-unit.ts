import { CollectedFundsService } from "@app/services/collected-funds.service";
import { FactoryService } from "@app/services/factory.service";
import { LangService } from "@app/services/lang.service";
import { AdminResult } from "./admin-result";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { FundUnitInterceptor } from "@app/model-interceptors/fund-unit-interceptor";


const fundUnitInterceptor = new FundUnitInterceptor();

@InterceptModel({
  receive: fundUnitInterceptor.receive
})
export class FundUnit {
    service!: CollectedFundsService;
    langService: LangService;
    
    id!: number;
    updatedBy!: number;
    updatedOn!: string;
    clientData!: string;
    implCaseId!: string;
    requestType!: number;
    templateId!: string;
    fundraisingVsId!: string;
    permitType!: number;
    projectTotalCost!: number;
    totalCost!: number;
    newCost!: number;
    requestStatus!: number;
    collectedAmount!: number;
    operationType!: number;
    approvalStatus!: number;
    
    permitTypeInfo!: AdminResult;
    approvalStatusInfo!: AdminResult;
    requestTypeInfo!: AdminResult;
    requestStatusInfo!: AdminResult;
    
    constructor() {
        this.langService = FactoryService.getService('LangService');
    }

    buildForm(controls?: boolean): any {
        const {
        } = this;
        return {}
    }
}
