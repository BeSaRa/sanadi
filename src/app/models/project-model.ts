import {CaseModel} from "@app/models/case-model";
import {ProjectModelService} from "@app/services/project-model.service";

export class ProjectModel extends CaseModel<ProjectModelService, ProjectModel> {
  service!: ProjectModelService;
  constructor() {
    super();
  }
}
