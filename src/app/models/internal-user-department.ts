import {BaseModel} from "@app/models/base-model";
import {InternalUserDepartmentService} from "@app/services/internal-user-department.service";
import {AdminResult} from "@app/models/admin-result";

export class InternalUserDepartment extends BaseModel<InternalUserDepartment, InternalUserDepartmentService> {
  service!: InternalUserDepartmentService;
  generalUserId!: number;
  departmentId!: number;
  departmentInfo!: AdminResult
}
