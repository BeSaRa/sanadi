import {INames} from '../interfaces/i-names';
import {ModelCrudInterface} from '../interfaces/model-crud-interface';
import {Observable} from 'rxjs';
import {extender} from '../helpers/extender';

export abstract class BaseModel<D> implements INames, ModelCrudInterface<D> {
  // @ts-ignore
  id: number;
  arName: string = '';
  enName: string = '';
  updatedBy?: number | undefined;
  updatedOn?: string | undefined;
  clientData?: string | undefined;

  abstract create(): Observable<D>;

  abstract delete(): Observable<boolean>;

  abstract save(): Observable<D>;

  abstract update(): Observable<D>;

  clone(): D {
    return extender<D>(this, this);
  }
}
