import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {UrgentInterventionAttachment} from '@app/models/urgent-intervention-attachment';
import {DateUtils} from '@helpers/date-utils';

export class UrgentInterventionAttachmentInterceptor implements IModelInterceptor<UrgentInterventionAttachment> {
  receive(model: UrgentInterventionAttachment): UrgentInterventionAttachment {
    model.createdOnString = DateUtils.getDateStringFromDate(model.createdOn);
    return model;
  }

  send(model: Partial<UrgentInterventionAttachment>): Partial<UrgentInterventionAttachment> {
    UrgentInterventionAttachmentInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionAttachment>): void {
    delete model.searchFields;
    delete model.langService;
    delete model.dialog;
  }
}
