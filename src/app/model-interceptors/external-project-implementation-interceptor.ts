import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ExternalProjectImplementation} from '@app/models/external-project-implementation';
import {FactoryService} from '@app/services/factory.service';
import {ExternalProjectImplementationService} from '@app/services/external-project-implementation.service';
import {Payment} from '@app/models/payment';
import {ImplementationTemplate} from '@app/models/implementation-template';
import {FundingSource} from '@app/models/funding-source';
import {AdminResult} from '@app/models/admin-result';
import {isValidAdminResult} from '@app/helpers/utils';

export class ExternalProjectImplementationInterceptor implements IModelInterceptor<ExternalProjectImplementation> {
  receive(model: ExternalProjectImplementation): ExternalProjectImplementation {
    let service: ExternalProjectImplementationService = FactoryService.getService('ExternalProjectImplementation');
    if (model.implementationTemplate && model.implementationTemplate.length > 0) {
      model.implementationTemplate = model.implementationTemplate.map(x => service.implementationTemplateInterceptor.receive(new ImplementationTemplate().clone(x)));
    }
    if (model.payment && model.payment.length > 0) {
      model.payment = model.payment.map(x => service.paymentInterceptor.receive(new Payment().clone(x)));
    }
    if (model.fundingSources && model.fundingSources.length > 0) {
      model.fundingSources = model.fundingSources.map(x => service.fundingSourceInterceptor.receive(new FundingSource().clone(x)));
    }
    if (model.implementingAgencyInfo && model.implementingAgencyInfo.length > 0) {
      model.implementingAgencyInfo = model.implementingAgencyInfo.map(x => AdminResult.createInstance(x));
    }

    model.ouInfo = AdminResult.createInstance(isValidAdminResult(model.ouInfo) ? model.ouInfo : {});
    model.caseStatusInfo = AdminResult.createInstance(isValidAdminResult(model.caseStatusInfo) ? model.caseStatusInfo : {});
    model.creatorInfo = AdminResult.createInstance(isValidAdminResult(model.creatorInfo) ? model.creatorInfo : {});

    model.specialistDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.specialistDecisionInfo) ? model.specialistDecisionInfo : {});
    model.chiefDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.chiefDecisionInfo) ? model.chiefDecisionInfo : {});
    model.managerDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.managerDecisionInfo) ? model.managerDecisionInfo : {});
    model.generalManagerDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.generalManagerDecisionInfo) ? model.generalManagerDecisionInfo : {});

    model.licenseStatusInfo = AdminResult.createInstance(isValidAdminResult(model.licenseStatusInfo) ? model.licenseStatusInfo : {});
    model.domainInfo = AdminResult.createInstance(isValidAdminResult(model.domainInfo) ? model.domainInfo : {});

    return model;
  }

  send(model: Partial<ExternalProjectImplementation>): Partial<ExternalProjectImplementation> {
    if (model.ignoreSendInterceptor) {
      ExternalProjectImplementationInterceptor._deleteBeforeSend(model);
      return model;
    }

    let service: ExternalProjectImplementationService = FactoryService.getService('ExternalProjectImplementation');
    if (model.implementationTemplate && model.implementationTemplate.length > 0) {
      model.implementationTemplate = model.implementationTemplate.map(x => service.implementationTemplateInterceptor.send(x) as ImplementationTemplate);
    }
    if (model.payment && model.payment.length > 0) {
      model.payment = model.payment.map(x => service.paymentInterceptor.send(x) as Payment);
    }
    if (model.fundingSources && model.fundingSources.length > 0) {
      model.fundingSources = model.fundingSources.map(x => service.fundingSourceInterceptor.send(x) as FundingSource);
    }

    ExternalProjectImplementationInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<ExternalProjectImplementation>): void {
    delete model.ignoreSendInterceptor;
    delete model.service;
    delete model.employeeService;
    delete model.taskDetails;
    delete model.caseStatusInfo;
    delete model.creatorInfo;
    delete model.categoryInfo;
    delete model.implementingAgencyInfo;
    delete model.ouInfo;
    delete model.specialistDecisionInfo;
    delete model.chiefDecisionInfo;
    delete model.managerDecisionInfo;
    delete model.generalManagerDecisionInfo;
    delete model.licenseStatusInfo;
    delete model.domainInfo;
  }
}
