import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { InspectionLogInterceptor } from "@app/model-interceptors/inspection-log-interceptor";
import { AdminResult } from "./admin-result";

const { send, receive } = new InspectionLogInterceptor()
@InterceptModel({ send, receive })
export class InspectionLog  {

    comment!: string;
    inspectionDate!: string;
    inspectionStatus!: number;
    inspectionStatusInfo!: AdminResult;

    inspectorId!: number
    inspectorInfo!: AdminResult;

    

}