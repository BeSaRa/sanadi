import { DateUtils } from "@app/helpers/date-utils";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { BannedPersonSearch } from "@app/models/banned-person-search";
import { IMyDateModel } from '@nodro7/angular-mydatepicker';

export class BannedPersonSearchInterceptor implements IModelInterceptor<BannedPersonSearch> {
    send(model: Partial<BannedPersonSearch>): Partial<BannedPersonSearch> {
        model.dateFrom && (model.dateFrom = DateUtils.setEndOfDay(model.dateFrom as unknown as IMyDateModel)?.toISOString());
        model.dateTo && (model.dateTo = DateUtils.setEndOfDay(model.dateTo as unknown as IMyDateModel)?.toISOString());
        return model;
    }
    receive(model: BannedPersonSearch): BannedPersonSearch {

        return model;
    }
}
