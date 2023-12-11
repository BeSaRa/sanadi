import { FundSummaryInterceptor } from "@app/model-interceptors/fund-summary-interceptor";
import { AdminResult } from "./admin-result";
import { InterceptModel } from "@app/decorators/decorators/intercept-model";

const fundSummaryInterceptor = new FundSummaryInterceptor();

@InterceptModel({
  receive: fundSummaryInterceptor.receive
})
export class FundSummary {
    createdBy!: number;
    profileId!: number;
    createdOn!: string;
    fullSerial!: string;
    fundraisingVsId!: string;
    
    licenseEndDate!: string;
    licenseEndPercentage!: number;
    
    refundedAmount!: number;
    remainingAmount!: number;
    remainingPercentage!: number;
    targetAmount!: number;
    totalCollected!: number;
    totalConsumed!: number;

    creatorInfo!: AdminResult;
    profileInfo!: AdminResult;
}
