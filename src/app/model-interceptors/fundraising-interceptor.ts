import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { Fundraising } from "@app/models/fundraising";

export class FundraisingInterceptor implements IModelInterceptor<Fundraising> {
    send(model: Partial<Fundraising>): Partial<Fundraising> {
        return model;
    }
    receive(model: Fundraising): Fundraising {
        return model;
    }
}