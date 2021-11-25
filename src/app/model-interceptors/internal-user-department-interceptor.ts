import {IModelInterceptor} from "@app/interfaces/i-model-interceptor";
import {InternalUserDepartment} from "@app/models/internal-user-department";
import {AdminResult} from "@app/models/admin-result";

export class InternalUserDepartmentInterceptor implements IModelInterceptor<InternalUserDepartment> {
  send(model: Partial<InternalUserDepartment>): Partial<InternalUserDepartment> {
    delete model.arName;
    delete model.enName;
    return model;
  }

  receive(model: InternalUserDepartment): InternalUserDepartment {
    model.departmentInfo = AdminResult.createInstance(model.departmentInfo);
    return model;
  }
}
