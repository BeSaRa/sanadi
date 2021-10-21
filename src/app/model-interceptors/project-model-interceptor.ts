import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {ProjectModel} from "@app/models/project-model";

export class ProjectModelInterceptor implements IModelInterceptor<ProjectModel> {
  send(model: Partial<ProjectModel>): Partial<ProjectModel> {
    return model;
  }

  receive(model: ProjectModel): ProjectModel {
    return model;
  }
}
