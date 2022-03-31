import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UrgentInterventionLicense} from '@app/models/urgent-intervention-license';
import {AdminResult} from '@app/models/admin-result';

export class UrgentInterventionLicenseResultInterceptor implements  IModelInterceptor<UrgentInterventionLicense>{
  receive(model: UrgentInterventionLicense): UrgentInterventionLicense {
    model.ouInfo && (model.ouInfo = AdminResult.createInstance(model.ouInfo))
    model.requestTypeInfo && (model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo))
    model.caseStatusInfo && (model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo))
    model.creatorInfo && (model.creatorInfo = AdminResult.createInstance(model.creatorInfo))
    model.specialistDecisionInfo && (model.specialistDecisionInfo = AdminResult.createInstance(model.specialistDecisionInfo))
    model.secondSpecialistDecisionInfo && (model.secondSpecialistDecisionInfo = AdminResult.createInstance(model.secondSpecialistDecisionInfo))
    model.chiefDecisionInfo && (model.chiefDecisionInfo = AdminResult.createInstance(model.chiefDecisionInfo))
    model.managerDecisionInfo && (model.managerDecisionInfo = AdminResult.createInstance(model.managerDecisionInfo))
    model.generalManagerDecisionInfo && (model.generalManagerDecisionInfo = AdminResult.createInstance(model.generalManagerDecisionInfo))
    model.reviewerDepartmentDecisionInfo && (model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(model.reviewerDepartmentDecisionInfo))
    model.licenseStatusInfo && (model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo))
    model.mainUNOCHAInfo && (model.mainUNOCHAInfo = AdminResult.createInstance(model.mainUNOCHAInfo))
    model.currencyInfo && (model.currencyInfo = AdminResult.createInstance(model.currencyInfo))
    model.domainInfo && (model.domainInfo = AdminResult.createInstance(model.domainInfo))
    model.projectNameInfo = AdminResult.createInstance({arName: model.arName, enName: model.enName});
    return model;
  }

  send(model: Partial<UrgentInterventionLicense>): Partial<UrgentInterventionLicense> {
    UrgentInterventionLicenseResultInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionLicense>): void {
    delete model.ouInfo;
    delete model.requestTypeInfo;
    delete model.caseStatusInfo;
    delete model.managerDecisionInfo;
    delete model.reviewerDepartmentDecisionInfo;
    delete model.licenseStatusInfo;
    delete model.specialistDecisionInfo;
    delete model.secondSpecialistDecisionInfo;
    delete model.chiefDecisionInfo;
    delete model.generalManagerDecisionInfo;
    delete model.domainInfo;
    delete model.mainUNOCHAInfo;
    delete model.currencyInfo;
    delete model.projectNameInfo;
  }
}
