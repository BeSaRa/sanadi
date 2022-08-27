import { ModelCrudInterface } from '@contracts/model-crud-interface';
import { CustomRolePermissionService } from '@services/custom-role-permission.service';
import { Observable } from 'rxjs';
import { FactoryService } from '@services/factory.service';
import { InterceptModel } from "@decorators/intercept-model";

@InterceptModel({
  send: (model: any) => {
    delete model.service;
    return model;
  },
  receive: (model: CustomRolePermission) => model
})
export class CustomRolePermission implements ModelCrudInterface<CustomRolePermission> {
  id!: number;
  permissionId!: number;
  customRoleId!: number;
  service!: CustomRolePermissionService;

  constructor() {
    this.service = FactoryService.getService('CustomRolePermissionService');
  }

  create(): Observable<CustomRolePermission> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<CustomRolePermission> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<CustomRolePermission> {
    return this.service.update(this);
  }
}
