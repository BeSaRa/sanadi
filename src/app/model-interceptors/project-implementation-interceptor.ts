import {IModelInterceptor} from "@contracts/i-model-interceptor";
import {ProjectImplementation} from "@app/models/project-implementation";
import {AdminResult} from "@models/admin-result";

export class ProjectImplementationInterceptor implements IModelInterceptor<ProjectImplementation> {
  send(model: Partial<ProjectImplementation>): Partial<ProjectImplementation> {
    delete model.beneficiaryCountryInfo
    delete model.domainInfo
    delete model.mainUNOCHACategoryInfo
    delete model.subUNOCHACategoryInfo
    delete model.mainDACCategoryInfo
    delete model.subDACCategoryInfo
    delete model.workAreaInfo
    delete model.internalProjectClassificationInfo
    delete model.implementingAgencyTypeInfo
    delete model.requestTypeInfo
    delete model.creatorInfo
    delete model.ouInfo
    delete model.caseStatusInfo
    delete model.licenseStatusInfo
    return model;
  }

  receive(model: ProjectImplementation): ProjectImplementation {
    model.beneficiaryCountryInfo = AdminResult.createInstance(model.beneficiaryCountryInfo)
    model.domainInfo = AdminResult.createInstance(model.domainInfo)
    model.mainUNOCHACategoryInfo = AdminResult.createInstance(model.mainUNOCHACategoryInfo)
    model.subUNOCHACategoryInfo = AdminResult.createInstance(model.subUNOCHACategoryInfo)
    model.mainDACCategoryInfo = AdminResult.createInstance(model.mainDACCategoryInfo)
    model.subDACCategoryInfo = AdminResult.createInstance(model.subDACCategoryInfo)
    model.workAreaInfo = AdminResult.createInstance(model.workAreaInfo)
    model.internalProjectClassificationInfo = AdminResult.createInstance(model.internalProjectClassificationInfo)
    model.implementingAgencyTypeInfo = AdminResult.createInstance(model.implementingAgencyTypeInfo)
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo)
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo)
    model.ouInfo = AdminResult.createInstance(model.ouInfo)
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo)
    model.licenseStatusInfo = AdminResult.createInstance(model.licenseStatusInfo)
    return model;
  }
}
