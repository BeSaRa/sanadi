import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import { ProjectCompletion } from '@app/models/project-completion';
export class ProjectCompletionInterceptor implements IModelInterceptor<ProjectCompletion> {
  send(model: Partial<ProjectCompletion>): Partial<ProjectCompletion> {

    // delete model.exitMechanismInfo;
    return model;
  }

  receive(model: ProjectCompletion): ProjectCompletion {
    return model;
  }
}
