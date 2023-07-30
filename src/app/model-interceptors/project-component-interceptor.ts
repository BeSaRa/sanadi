import {ProjectComponent} from '@app/models/project-component';
import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {AdminResult} from "@models/admin-result";

export class ProjectComponentInterceptor implements IModelInterceptor<ProjectComponent> {
  send(model: Partial<ProjectComponent>): Partial<ProjectComponent> {
    delete model.searchFields;
    delete model.expensesTypeInfo;
    delete model.auditOperation;
    return model;
  }

  receive(model: ProjectComponent): ProjectComponent {
    model.expensesTypeInfo = AdminResult.createInstance(model.expensesTypeInfo ?? {});
    return model;
  }
}

