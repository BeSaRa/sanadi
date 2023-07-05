import { DateUtils } from '@app/helpers/date-utils';
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { AdminResult } from '@app/models/admin-result';
import { isValidAdminResult } from '@helpers/utils';
import { IMyDateModel } from 'angular-mydatepicker';
import { BuildingAbility } from './../models/building-ability';

export class BuildingAbilityInterceptor implements IModelInterceptor<BuildingAbility> {
  caseInterceptor?: IModelInterceptor<BuildingAbility> | undefined;
  send(model: Partial<BuildingAbility>): Partial<BuildingAbility> {
    delete model.searchFields;
    delete model.employeeService;
    delete model.trainingWayInfo;
    delete model.trainingActivityTypeInfo;
    delete model.trainingLanguageInfo;
    delete model.filtrationMethodInfo
    delete model.otherFiltrationMethodInfo
    delete model.suggestedActivityDateFromStamp
    delete model.suggestedActivityDateToStamp
    delete model.employeeService
    model.suggestedActivityDateFrom = !model.suggestedActivityDateFrom
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.suggestedActivityDateFrom as unknown as IMyDateModel
      )?.toISOString();
    model.suggestedActivityDateTo = !model.suggestedActivityDateTo
      ? undefined
      : DateUtils.changeDateFromDatepicker(
        model.suggestedActivityDateTo as unknown as IMyDateModel
      )?.toISOString();

    model.timeFrom = model.getISOFromString!(model.timeFrom);
    model.timeTo = model.getISOFromString!(model.timeTo);
    return model;
  }
  receive(model: BuildingAbility): BuildingAbility {
    model.trainingActivityTypeInfo = AdminResult.createInstance(isValidAdminResult(model.trainingActivityTypeInfo) ? model.trainingActivityTypeInfo : {});
    model.trainingLanguageInfo = AdminResult.createInstance(isValidAdminResult(model.trainingLanguageInfo) ? model.trainingLanguageInfo : {});
    model.trainingWayInfo = AdminResult.createInstance(isValidAdminResult(model.trainingWayInfo) ? model.trainingWayInfo : {});
    model.filtrationMethodInfo = AdminResult.createInstance(isValidAdminResult(model.filtrationMethodInfo) ? model.filtrationMethodInfo : {});
    model.otherFiltrationMethodInfo = AdminResult.createInstance(isValidAdminResult(model.otherFiltrationMethodInfo) ? model.otherFiltrationMethodInfo : {});

    model.suggestedActivityDateFrom = DateUtils.changeDateToDatepicker(
      model.suggestedActivityDateFrom
    );
    model.suggestedActivityDateTo = DateUtils.changeDateToDatepicker(
      model.suggestedActivityDateTo
    );
    model.timeFrom = new Date(model.timeFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
    model.timeTo = new Date(model.timeTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })

    model.suggestedActivityDateFromStamp = !model.suggestedActivityDateFrom ? null : DateUtils.getTimeStampFromDate(model.suggestedActivityDateFrom);
    model.suggestedActivityDateToStamp = !model.suggestedActivityDateTo ? null : DateUtils.getTimeStampFromDate(model.suggestedActivityDateTo);
    return model;
  }


}
