import {ProjectComponent} from '@app/models/project-component';
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";

export class ProjectComponentInterceptor implements IModelInterceptor<ProjectComponent> {
  send(model: Partial<ProjectComponent>): Partial<ProjectComponent> {
    delete model.searchFields;
    return model;
  }

  receive(model: ProjectComponent): ProjectComponent {
    return model;
  }
}

