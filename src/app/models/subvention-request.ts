import {Observable} from 'rxjs';
import {BaseModel} from './base-model';

export class SubventionRequest extends BaseModel<SubventionRequest> {

  constructor() {
    super();
  }

  create(): Observable<SubventionRequest> {
    throw new Error('Method not implemented.');
  }

  delete(): Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  save(): Observable<SubventionRequest> {
    throw new Error('Method not implemented.');
  }

  update(): Observable<SubventionRequest> {
    throw new Error('Method not implemented.');
  }
}
