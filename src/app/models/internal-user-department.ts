import { BaseModel } from "@app/models/base-model";
import { InternalUserDepartmentService } from "@app/services/internal-user-department.service";
import { AdminResult } from "@app/models/admin-result";
import { FactoryService } from "@app/services/factory.service";
import { InternalUserDepartmentInterceptor } from "@app/model-interceptors/internal-user-department-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const { send, receive } = new InternalUserDepartmentInterceptor();

@InterceptModel({ send, receive })
export class InternalUserDepartment extends BaseModel<InternalUserDepartment, InternalUserDepartmentService> {
  internalUserId!: number;
  internalDepartmentId!: number;
  departmentInfo!: AdminResult
  interalUserInfo!: AdminResult

  service!: InternalUserDepartmentService;

  constructor() {
    super();
    this.service = FactoryService.getService('InternalUserDepartmentService');
  }
}
