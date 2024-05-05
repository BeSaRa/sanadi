import { InterceptModel } from "@app/decorators/decorators/intercept-model";
import { InspectionActionLogInterceptor } from "@app/model-interceptors/inspection-action-log-interceptor";
import { AdminResult } from "./admin-result";


const { send, receive } = new InspectionActionLogInterceptor()
@InterceptModel({ send, receive })
export class InspectionActionLog {


    id!: number;
    action!: number;
    actionDate!: string;
    userId!: number;
    actionInfo!: AdminResult;
    userInfo!: AdminResult




}