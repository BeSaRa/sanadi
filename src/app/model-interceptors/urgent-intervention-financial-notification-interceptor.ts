import { UrgentInterventionFinancialNotification } from '@app/models/urgent-intervention-financial-notification';
import {IModelInterceptor} from '@contracts/i-model-interceptor';

export class UrgentInterventionFinancialNotificationInterceptor implements IModelInterceptor<UrgentInterventionFinancialNotification> {
  receive(model: UrgentInterventionFinancialNotification): UrgentInterventionFinancialNotification {
    return model;
  }

  send(model: Partial<UrgentInterventionFinancialNotification>): Partial<UrgentInterventionFinancialNotification> {
    return model;
  }
}
