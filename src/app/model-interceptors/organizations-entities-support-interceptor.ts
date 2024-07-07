import { DateUtils } from '@app/helpers/date-utils';
import { AdminResult } from '@app/models/admin-result';
import { OrganizationsEntitiesSupport } from '@app/models/organizations-entities-support';
import { IModelInterceptor } from '@contracts/i-model-interceptor';
import { IMyDateModel } from '@nodro7/angular-mydatepicker';

export class OrganizationsEntitiesSupportInterceptor
  implements IModelInterceptor<OrganizationsEntitiesSupport>
{
  receive(model: OrganizationsEntitiesSupport): OrganizationsEntitiesSupport {
    model.ouInfo && (model.ouInfo = AdminResult.createInstance(model.ouInfo));
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.serviceTypeInfo && (model.serviceTypeInfo = AdminResult.createInstance(model.serviceTypeInfo));
    model.licenseStatusInfo && (model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo));
    // model.followUpDateString = DateUtils.getDateStringFromDate(model.followUpDate);

    // model.followUpDate = DateUtils.changeDateToDatepicker(model.followUpDate);

    return model;
  }

  send(
    model: Partial<OrganizationsEntitiesSupport>
  ): Partial<OrganizationsEntitiesSupport> {
        model.followUpDate = !model.followUpDate
      ? undefined
      : DateUtils.changeDateFromDatepicker(
          model.followUpDate as unknown as IMyDateModel
        )?.toISOString();
    OrganizationsEntitiesSupportInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(
    model: Partial<OrganizationsEntitiesSupport>
  ): void {
    delete model.searchFields;
    delete model.requestTypeInfo;
    delete model.ouInfo;
    delete model.serviceTypeInfo;
    delete model.licenseStatusInfo;

    // delete model.followUpDate;
  }
}
