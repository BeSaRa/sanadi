import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {UrgentInterventionLicense} from '@app/models/urgent-intervention-license';
import {AdminResult} from '@app/models/admin-result';
import {isValidAdminResult} from '@app/helpers/utils';

export class UrgentInterventionLicenseInterceptor implements IModelInterceptor<UrgentInterventionLicense> {
  receive(model: UrgentInterventionLicense): UrgentInterventionLicense {
    model.ouInfo = AdminResult.createInstance(isValidAdminResult(model.ouInfo) ? model.ouInfo : {});
    model.caseStatusInfo = AdminResult.createInstance(isValidAdminResult(model.caseStatusInfo) ? model.caseStatusInfo : {});
    model.creatorInfo = AdminResult.createInstance(isValidAdminResult(model.creatorInfo) ? model.creatorInfo : {});

    model.specialistDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.specialistDecisionInfo) ? model.specialistDecisionInfo : {});
    model.secondSpecialistDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.secondSpecialistDecisionInfo) ? model.secondSpecialistDecisionInfo : {});
    model.chiefDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.chiefDecisionInfo) ? model.chiefDecisionInfo : {});
    model.managerDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.managerDecisionInfo) ? model.managerDecisionInfo : {});
    model.generalManagerDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.generalManagerDecisionInfo) ? model.generalManagerDecisionInfo : {});
    model.reviewerDepartmentDecisionInfo = AdminResult.createInstance(isValidAdminResult(model.reviewerDepartmentDecisionInfo) ? model.reviewerDepartmentDecisionInfo : {});

    model.licenseStatusInfo = AdminResult.createInstance(isValidAdminResult(model.licenseStatusInfo) ? model.licenseStatusInfo : {});
    model.mainUNOCHAInfo = AdminResult.createInstance(isValidAdminResult(model.mainUNOCHAInfo) ? model.mainUNOCHAInfo : {});
    model.currencyInfo = AdminResult.createInstance(isValidAdminResult(model.currencyInfo) ? model.currencyInfo : {});
    model.domainInfo = model.getDomainInfo();

    model.projectNameInfo = AdminResult.createInstance({arName: model.arName, enName: model.enName});
    return model;
  }

  send(model: Partial<UrgentInterventionLicense>): Partial<UrgentInterventionLicense> {
    UrgentInterventionLicenseInterceptor._deleteBeforeSend(model);
    return model;
  }

  private static _deleteBeforeSend(model: Partial<UrgentInterventionLicense>): void {
    delete model.ouInfo;
    delete model.requestTypeInfo;
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
