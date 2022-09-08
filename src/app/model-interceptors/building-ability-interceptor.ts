import { isValidAdminResult } from '@helpers/utils';
import { BuildingAbility } from './../models/building-ability';
import { IModelInterceptor } from "@app/interfaces/i-model-interceptor";
import { DateUtils } from '@app/helpers/date-utils';
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from '@app/models/admin-result';

export class BuildingAbilityInterceptor implements IModelInterceptor<BuildingAbility> {
  caseInterceptor?: IModelInterceptor<BuildingAbility> | undefined;
  send(model: Partial<BuildingAbility>): Partial<BuildingAbility> {
    delete model.searchFields;
    delete model.employeeService;
      model.suggestedActivityDateFrom =  !model.suggestedActivityDateFrom
      ? undefined
      : DateUtils.changeDateFromDatepicker(
          model.suggestedActivityDateFrom as unknown as IMyDateModel
        )?.toISOString();
      model.suggestedActivityDateTo =  !model.suggestedActivityDateTo
      ? undefined
      : DateUtils.changeDateFromDatepicker(
          model.suggestedActivityDateTo as unknown as IMyDateModel
        )?.toISOString();

        return model;
  }
  receive(model: BuildingAbility): BuildingAbility {
    model.trainingActivityTypeInfo= AdminResult.createInstance(isValidAdminResult(model.trainingActivityTypeInfo)? model.trainingActivityTypeInfo :{});
    model.trainingLanguageInfo= AdminResult.createInstance(isValidAdminResult(model.trainingLanguageInfo)? model.trainingLanguageInfo :{});
    model.trainingWayInfo= AdminResult.createInstance(isValidAdminResult(model.trainingWayInfo)? model.trainingWayInfo :{});
    return model;
  }
}
