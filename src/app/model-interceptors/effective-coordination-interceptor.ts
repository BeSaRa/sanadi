import { EffectiveCoordinationCapabilities } from '@app/models/effective-coordination-capabilities';
import { IModelInterceptor } from '@app/interfaces/i-model-interceptor';
import { DateUtils } from '@app/helpers/date-utils';
import { IMyDateModel } from 'angular-mydatepicker';
import { AdminResult } from '@app/models/admin-result';
import { isValidAdminResult } from '@app/helpers/utils';

export class EffectiveCoordinationInterceptor
  implements IModelInterceptor<EffectiveCoordinationCapabilities>
{
  caseInterceptor?:
    | IModelInterceptor<EffectiveCoordinationCapabilities>
    | undefined;
  send(
    model: Partial<EffectiveCoordinationCapabilities>
  ): Partial<EffectiveCoordinationCapabilities> {
    delete model.langService;
    delete model.searchFields;
    delete model.employeeService;
    delete model. organizationWayInfo;

    model.eventStartDate &&
      (model.eventStartDate = DateUtils.changeDateFromDatepicker(
        model.eventStartDate as unknown as IMyDateModel
      )?.toISOString());

    return model;
  }
  receive(
    model: EffectiveCoordinationCapabilities
  ): EffectiveCoordinationCapabilities {
    model.organizationWayInfo = AdminResult.createInstance(
      isValidAdminResult(model.organizationWayInfo)
        ? model.organizationWayInfo
        : {}
    );
    model.eventStartDate = DateUtils.changeDateToDatepicker(
      model.eventStartDate
    );
    model.eventStartDateStamp = !model.eventStartDate ? null : DateUtils.getTimeStampFromDate(model.eventStartDate);

    return model;
  }
}
