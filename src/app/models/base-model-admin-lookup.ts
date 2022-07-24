import {Observable} from 'rxjs';
import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {INames} from '@contracts/i-names';
import {CrudServiceAdminLookupContract} from '@contracts/crud-service-admin-lookup-contract';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {BaseModelAdminLookupContract} from '@contracts/base-model-admin-lookup-contract';

export abstract class BaseModelAdminLookup<D, S extends CrudServiceAdminLookupContract<D>> extends SearchableCloneable<D> implements INames, BaseModelAdminLookupContract<D> {

  // @ts-ignore
  id: number;
  arName: string = '';
  enName: string = '';
  updatedBy?: number;
  updatedOn?: string;
  clientData?: string;
  abstract service: S;

  create(typeId: AdminLookupTypeEnum): Observable<D> {
    return this.service.create(this as unknown as D, typeId);
  };

  delete(typeId: AdminLookupTypeEnum): Observable<boolean> {
    return this.service.delete(this.id, typeId);
  };

  save(typeId: AdminLookupTypeEnum): Observable<D> {
    return this.id ? this.update(typeId) : this.create(typeId);
  };

  update(typeId: AdminLookupTypeEnum): Observable<D> {
    return this.service.update(this as unknown as D, typeId);
  };

  createAdminResult(): AdminResult {
    return AdminResult.createInstance({ arName: this.arName, enName: this.enName, id: this.id });
  }
}
