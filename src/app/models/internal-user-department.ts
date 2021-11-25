import {BaseModel} from "@app/models/base-model";
import {InternalUserDepartmentService} from "@app/services/internal-user-department.service";
import {AdminResult} from "@app/models/admin-result";
import {FactoryService} from "@app/services/factory.service";

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
