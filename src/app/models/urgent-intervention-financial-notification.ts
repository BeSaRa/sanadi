import { FactoryService } from './../services/factory.service';
import { UrgentInterventionFinancialNotificationService } from '../services/urgent-intervention-financial-notification.service';
import { LicenseApprovalModel } from '@app/models/license-approval-model';
import { CaseTypes } from '../enums/case-types.enum';

export class UrgentInterventionFinancialNotification extends LicenseApprovalModel<UrgentInterventionFinancialNotificationService, UrgentInterventionFinancialNotification> {
  service!: UrgentInterventionFinancialNotificationService;
  caseType: number = CaseTypes.URGENT_INTERVENTION_FINANCIAL_NOTIFICATION;
  constructor() {
    super();
    this.service = FactoryService.getService('UrgentInterventionFinancialNotificationService');
  }
}
