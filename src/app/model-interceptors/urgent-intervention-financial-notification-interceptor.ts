import { UrgentInterventionFinancialNotificationService } from './../services/urgent-intervention-financial-notification.service';
import { AdminResult } from '@app/models/admin-result';
import { InterventionField } from '@app/models/intervention-field';
import { InterventionRegion } from '@app/models/intervention-region';
import { ImplementingAgency } from '@app/models/implementing-agency';
import { FactoryService } from '@app/services/factory.service';
import { UrgentInterventionFinancialNotification } from '@app/models/urgent-intervention-financial-notification';
import { IModelInterceptor } from '@contracts/i-model-interceptor';

export class UrgentInterventionFinancialNotificationInterceptor implements IModelInterceptor<UrgentInterventionFinancialNotification> {
  receive(model: UrgentInterventionFinancialNotification): UrgentInterventionFinancialNotification {
    model.beneficiaryCountryInfo && (model.beneficiaryCountryInfo = AdminResult.createInstance(model.beneficiaryCountryInfo));
    model.executionCountryInfo && (model.executionCountryInfo = AdminResult.createInstance(model.executionCountryInfo));

    let service: UrgentInterventionFinancialNotificationService = FactoryService.getService('UrgentInterventionFinancialNotificationService');
    if (model.implementingAgencyList && model.implementingAgencyList.length > 0) {
      model.implementingAgencyList = model.implementingAgencyList.map(x => service.implementingAgencyInterceptor.receive(new ImplementingAgency().clone(x)));
    }
    if (model.interventionRegionList && model.interventionRegionList.length > 0) {
      model.interventionRegionList = model.interventionRegionList.map(x => service.interventionRegionInterceptor.receive(new InterventionRegion().clone(x)));
    }
    if (model.interventionFieldList && model.interventionFieldList.length > 0) {
      model.interventionFieldList = model.interventionFieldList.map(x => service.interventionFieldInterceptor.receive(new InterventionField().clone(x)));
    }
    return model;
  }

  send(model: Partial<UrgentInterventionFinancialNotification>): Partial<UrgentInterventionFinancialNotification> {
    let service: UrgentInterventionFinancialNotificationService = FactoryService.getService('UrgentInterventionFinancialNotificationService');
    if (model.implementingAgencyList && model.implementingAgencyList.length > 0) {
      model.implementingAgencyList = model.implementingAgencyList.map(x => service.implementingAgencyInterceptor.send(x) as ImplementingAgency);
    }
    if (model.interventionRegionList && model.interventionRegionList.length > 0) {
      model.interventionRegionList = model.interventionRegionList.map(x => service.interventionRegionInterceptor.send(x) as InterventionRegion);
    }
    if (model.interventionFieldList && model.interventionFieldList.length > 0) {
      model.interventionFieldList = model.interventionFieldList.map(x => service.interventionFieldInterceptor.send(x) as InterventionField);
    }
    model.amount && (model.amount = +model.amount);
    delete model.beneficiaryCountryInfo;
    delete model.executionCountryInfo;
    return model;
  }
}
