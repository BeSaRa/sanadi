import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {ProjectModel} from "@app/models/project-model";
import {ProjectComponent} from "@app/models/project-component";
import {AdminResult} from "@app/models/admin-result";

export class ProjectModelInterceptor implements IModelInterceptor<ProjectModel> {
  send(model: Partial<ProjectModel>): Partial<ProjectModel> {
    model.componentList = model.componentList?.map(item => {
      delete (item as Partial<ProjectComponent>).searchFields;
      return item;
    });
    delete model.domainInfo;
    delete model.caseStatusInfo;
    delete model.implementingAgencyTypeInfo;
    delete model.projectTypeInfo;
    delete model.requestTypeInfo;
    delete model.templateTypeInfo;
    delete model.creatorInfo;
    return model;
  }

  receive(model: ProjectModel): ProjectModel {
    model.domainInfo = AdminResult.createInstance(model.domainInfo);
    model.caseStatusInfo = AdminResult.createInstance(model.caseStatusInfo);
    model.implementingAgencyTypeInfo = AdminResult.createInstance(model.implementingAgencyTypeInfo);
    model.projectTypeInfo = AdminResult.createInstance(model.projectTypeInfo);
    model.requestTypeInfo = AdminResult.createInstance(model.requestTypeInfo);
    model.templateTypeInfo = AdminResult.createInstance(model.templateTypeInfo);
    model.creatorInfo = AdminResult.createInstance(model.creatorInfo);
    return model;
  }
}
