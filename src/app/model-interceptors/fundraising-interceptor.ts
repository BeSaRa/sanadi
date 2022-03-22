import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from "@app/models/admin-result";
import { Fundraising } from "@app/models/fundraising";

export class FundraisingInterceptor implements IModelInterceptor<Fundraising> {
    send(model: Partial<Fundraising>): Partial<Fundraising> {
        delete model.requestTypeInfo;
        return model;
    }
    receive(model: Fundraising): Fundraising {
        model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
        return model;
    }
}