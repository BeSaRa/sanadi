import {AdminResult} from '@app/models/admin-result';
import {InterventionField} from '@app/models/intervention-field';
import {InterventionRegion} from '@app/models/intervention-region';
import {ImplementingAgency} from '@app/models/implementing-agency';
import {UrgentInterventionFinancialNotification} from '@app/models/urgent-intervention-financial-notification';
import {IModelInterceptor} from '@contracts/i-model-interceptor';
import {ImplementingAgencyInterceptor} from '@app/model-interceptors/implementing-agency-interceptor';
import {InterventionRegionInterceptor} from '@app/model-interceptors/intervention-region-interceptor';
import {InterventionFieldInterceptor} from '@app/model-interceptors/intervention-field-interceptor';

const implementingAgencyInterceptor: IModelInterceptor<ImplementingAgency> = new ImplementingAgencyInterceptor();
const interventionRegionInterceptor: IModelInterceptor<InterventionRegion> = new InterventionRegionInterceptor();
const interventionFieldInterceptor: IModelInterceptor<InterventionField> = new InterventionFieldInterceptor();

export class UrgentInterventionFinancialNotificationInterceptor implements IModelInterceptor<UrgentInterventionFinancialNotification> {
  receive(model: UrgentInterventionFinancialNotification): UrgentInterventionFinancialNotification {
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.beneficiaryCountryInfo && (model.beneficiaryCountryInfo = AdminResult.createInstance(model.beneficiaryCountryInfo));
    model.executionCountryInfo && (model.executionCountryInfo = AdminResult.createInstance(model.executionCountryInfo));

    if (model.implementingAgencyList && model.implementingAgencyList.length > 0) {
      model.implementingAgencyList = model.implementingAgencyList.map(x => implementingAgencyInterceptor.receive(new ImplementingAgency().clone(x)));
    }
    if (model.interventionRegionList && model.interventionRegionList.length > 0) {
      model.interventionRegionList = model.interventionRegionList.map(x => interventionRegionInterceptor.receive(new InterventionRegion().clone(x)));
    }
    if (model.interventionFieldList && model.interventionFieldList.length > 0) {
      model.interventionFieldList = model.interventionFieldList.map(x => interventionFieldInterceptor.receive(new InterventionField().clone(x)));
    }
    return model;
  }

  send(model: Partial<UrgentInterventionFinancialNotification>): Partial<UrgentInterventionFinancialNotification> {
    if (model.implementingAgencyList && model.implementingAgencyList.length > 0) {
      model.implementingAgencyList = model.implementingAgencyList.map(x => implementingAgencyInterceptor.send(new ImplementingAgency().clone(x)) as ImplementingAgency);
    }
    if (model.interventionRegionList && model.interventionRegionList.length > 0) {
      model.interventionRegionList = model.interventionRegionList.map(x => interventionRegionInterceptor.send(new InterventionRegion().clone(x)) as InterventionRegion);
    }
    if (model.interventionFieldList && model.interventionFieldList.length > 0) {
      model.interventionFieldList = model.interventionFieldList.map(x => interventionFieldInterceptor.send(new InterventionField().clone(x)) as InterventionField);
    }
    model.amount && (model.amount = +model.amount);
    delete model.requestTypeInfo;
    delete model.beneficiaryCountryInfo;
    delete model.executionCountryInfo;
    delete model.searchFields;
    return model;
  }
}
