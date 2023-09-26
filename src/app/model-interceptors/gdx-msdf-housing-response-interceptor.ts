import { DateUtils } from "@app/helpers/date-utils";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { GdxMsdfHousingResponse } from "@app/models/gdx-msdf-housing";

export class GdxMsdfHousingResponseInterceptor implements IModelInterceptor<GdxMsdfHousingResponse> {
  receive(model: GdxMsdfHousingResponse): GdxMsdfHousingResponse {

    model.beneficiaryDateString = DateUtils.getDateStringFromDate(model.beneficiaryDate, 'DEFAULT_DATE_FORMAT');
    return model;
  }

  send(model: Partial<GdxMsdfHousingResponse>): Partial<GdxMsdfHousingResponse> {
    delete model.beneficiaryDateString

    return model;
  }
}
