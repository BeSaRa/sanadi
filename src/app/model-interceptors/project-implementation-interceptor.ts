import {IModelInterceptor} from "@contracts/i-model-interceptor";
import {ProjectImplementation} from "@app/models/project-implementation";

export class ProjectImplementationInterceptor implements IModelInterceptor<ProjectImplementation> {
  send(model: Partial<ProjectImplementation>): Partial<ProjectImplementation> {
    return model;
  }

  receive(model: ProjectImplementation): ProjectImplementation {
    return model;
  }
}
