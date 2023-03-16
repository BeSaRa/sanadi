import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UrgentInterventionAnnouncement} from '@app/models/urgent-intervention-announcement';
import {UrgentInterventionAnnouncementRequestType} from '@app/enums/service-request-types';
import {FactoryService} from '@app/services/factory.service';
import {UrgentInterventionAnnouncementService} from '@services/urgent-intervention-announcement.service';
import {ImplementingAgency} from '@app/models/implementing-agency';
import {InterventionField} from '@app/models/intervention-field';
import {InterventionRegion} from '@app/models/intervention-region';
import {AdminResult} from '@app/models/admin-result';

export class UrgentInterventionAnnouncementInterceptor implements IModelInterceptor<UrgentInterventionAnnouncement> {
  receive(model: UrgentInterventionAnnouncement): UrgentInterventionAnnouncement {
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo));
    model.beneficiaryCountryInfo && (model.beneficiaryCountryInfo = AdminResult.createInstance(model.beneficiaryCountryInfo));
    model.executionCountryInfo && (model.executionCountryInfo = AdminResult.createInstance(model.executionCountryInfo));

    let service: UrgentInterventionAnnouncementService = FactoryService.getService('UrgentInterventionAnnouncementService');
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

  send(model: Partial<UrgentInterventionAnnouncement>): Partial<UrgentInterventionAnnouncement> {
    if (model.ignoreSendInterceptor) {
      UrgentInterventionAnnouncementInterceptor._deleteBeforeSend(model);
      return model;
    }
    if (model.requestType !== UrgentInterventionAnnouncementRequestType.START && model.requestType !== UrgentInterventionAnnouncementRequestType.UPDATE) {
      model.implementingAgencyList = [];
      model.interventionRegionList = [];
      model.interventionFieldList = [];
    }

    let service: UrgentInterventionAnnouncementService = FactoryService.getService('UrgentInterventionAnnouncementService');
    if (model.implementingAgencyList && model.implementingAgencyList.length > 0) {
      model.implementingAgencyList = model.implementingAgencyList.map(x => service.implementingAgencyInterceptor.send(new ImplementingAgency().clone(x)) as ImplementingAgency);
    }
    if (model.interventionRegionList && model.interventionRegionList.length > 0) {
      model.interventionRegionList = model.interventionRegionList.map(x => service.interventionRegionInterceptor.send(new InterventionRegion().clone(x)) as InterventionRegion);
    }
    if (model.interventionFieldList && model.interventionFieldList.length > 0) {
      model.interventionFieldList = model.interventionFieldList.map(x => service.interventionFieldInterceptor.send(new InterventionField().clone(x)) as InterventionField);
    }

    UrgentInterventionAnnouncementInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionAnnouncement>): void {
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
