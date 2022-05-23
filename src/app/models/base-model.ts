import { INames } from '@contracts/i-names';
import { ModelCrudInterface } from '@contracts/model-crud-interface';
import { Observable } from 'rxjs';
import { BackendGenericService } from '../generics/backend-generic-service';
import { SearchableCloneable } from './searchable-cloneable';
import { AdminResult } from "@app/models/admin-result";
import { CrudGenericService } from "@app/generics/crud-generic-service";

export abstract class BaseModel<D, S extends BackendGenericService<D> | CrudGenericService<D>> extends SearchableCloneable<D> implements INames, ModelCrudInterface<D> {
  // @ts-ignore
  id: number;
  arName: string = '';
  enName: string = '';
  updatedBy?: number;
  updatedOn?: string;
  clientData?: string;
  abstract service: S;

  create(): Observable<D> {
    return this.service.create(this as unknown as D);
  };

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  };

  save(): Observable<D> {
    return this.id ? this.update() : this.create();
  };

  update(): Observable<D> {
    return this.service.update(this as unknown as D);
  };

  createAdminResult(): AdminResult {
    return AdminResult.createInstance({ arName: this.arName, enName: this.enName, id: this.id });
  }
}
