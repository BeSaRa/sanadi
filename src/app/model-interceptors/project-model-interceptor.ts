import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {ProjectModel} from "@app/models/project-model";
import {ProjectComponent} from "@app/models/project-component";

export class ProjectModelInterceptor implements IModelInterceptor<ProjectModel> {
  send(model: Partial<ProjectModel>): Partial<ProjectModel> {
    model.componentList = model.componentList?.map(item => {
      delete (item as Partial<ProjectComponent>).searchFields;
      return item;
    });
    return model;
  }

  receive(model: ProjectModel): ProjectModel {
    return model;
  }
}
