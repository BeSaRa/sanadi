import { DateUtils } from "@app/helpers/date-utils";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { GdxMmeResponse } from "@app/models/gdx-mme-leased-contract";

export class GdxMmeResponseInterceptor implements IModelInterceptor<GdxMmeResponse> {
  receive(model: GdxMmeResponse): GdxMmeResponse {
    
    model.contractToDateString = DateUtils.getDateStringFromDate(model.contractToDate, 'DEFAULT_DATE_FORMAT');
    model.contractFromDateString = DateUtils.getDateStringFromDate(model.contractFromDate, 'DEFAULT_DATE_FORMAT');
    model.contractSignDateString = DateUtils.getDateStringFromDate(model.contractSignDate, 'DEFAULT_DATE_FORMAT');
    return model;
  }

  send(model: Partial<GdxMmeResponse>): Partial<GdxMmeResponse> {
    delete model.contractToDateString
    delete model.contractFromDateString
    delete model.contractSignDateString

    return model;
  }
}
