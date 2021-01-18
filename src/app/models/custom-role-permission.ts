import {ModelCrudInterface} from '../interfaces/model-crud-interface';
import {CustomRolePermissionService} from '../services/custom-role-permission.service';
import {Observable} from 'rxjs';
import {FactoryService} from '../services/factory.service';

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
