import { DateUtils } from "@app/helpers/date-utils";
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { VacationDates } from "@app/models/vacation-dates";
import { ConfigurationService } from "@app/services/configuration.service";
import { FactoryService } from "@app/services/factory.service";

export class VacationDatesInerceptor
  implements IModelInterceptor<VacationDates>
{
  send(model: Partial<VacationDates>): Partial<VacationDates> {
    const configurationService: ConfigurationService =
      FactoryService.getService("ConfigurationService");
    model.vacationDateFrom &&
      (model.vacationDateFrom =
        DateUtils.setStartOfDay(model.vacationDateFrom)
          .format(configurationService.CONFIG.TIMESTAMP)
          .split(" ")
          .join("T") + "Z");
    model.vacationDateTo &&
      (model.vacationDateTo =
        DateUtils.setEndOfDay(model.vacationDateTo)
          .format(configurationService.CONFIG.TIMESTAMP)
          .split(" ")
          .join("T") + "Z");
    return model;
  }
  receive(model: VacationDates): VacationDates {
    return model;
  }
}
