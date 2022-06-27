import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UrgentInterventionReport} from '@app/models/urgent-intervention-report';
import {UrgentInterventionAnnouncementRequestType} from '@app/enums/service-request-types';
import {FactoryService} from '@app/services/factory.service';
import {UrgentInterventionReportingService} from '@app/services/urgent-intervention-reporting.service';
import {ImplementingAgency} from '@app/models/implementing-agency';
import {InterventionField} from '@app/models/intervention-field';
import {InterventionRegion} from '@app/models/intervention-region';
import {ImplementationTemplate} from '@app/models/implementation-template';
import {AdminResult} from '@app/models/admin-result';

export class UrgentInterventionReportInterceptor implements IModelInterceptor<UrgentInterventionReport> {
  receive(model: UrgentInterventionReport): UrgentInterventionReport {
    let service: UrgentInterventionReportingService = FactoryService.getService('UrgentInterventionReportingService');
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

  send(model: Partial<UrgentInterventionReport>): Partial<UrgentInterventionReport> {
    if (model.ignoreSendInterceptor) {
      UrgentInterventionReportInterceptor._deleteBeforeSend(model);
      return model;
    }
    if (model.requestType !== UrgentInterventionAnnouncementRequestType.START && model.requestType !== UrgentInterventionAnnouncementRequestType.EDIT) {
      model.implementingAgencyList = [];
      model.interventionRegionList = [];
      model.interventionFieldList = [];
    }

    let service: UrgentInterventionReportingService = FactoryService.getService('UrgentInterventionReportingService');
    if (model.implementingAgencyList && model.implementingAgencyList.length > 0) {
      model.implementingAgencyList = model.implementingAgencyList.map(x => service.implementingAgencyInterceptor.send(x) as ImplementingAgency);
    }
    if (model.interventionRegionList && model.interventionRegionList.length > 0) {
      model.interventionRegionList = model.interventionRegionList.map(x => service.interventionRegionInterceptor.send(x) as InterventionRegion);
    }
    if (model.interventionFieldList && model.interventionFieldList.length > 0) {
      model.interventionFieldList = model.interventionFieldList.map(x => service.interventionFieldInterceptor.send(x) as InterventionField);
    }

    UrgentInterventionReportInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionReport>): void {
    delete model.ignoreSendInterceptor;
    delete model.ouInfo;
    delete model.requestTypeInfo;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.beneficiaryCountryInfo;
    delete model.executionCountryInfo;
    delete model.categoryInfo;
  }

}
