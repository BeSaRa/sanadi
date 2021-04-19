import {InternalDepartment} from '../models/internal-department';
import {Team} from '../models/team';

export class InternalDepartmentInterceptor {
  static receive(model: InternalDepartment): InternalDepartment {
    model.bawRole = (new Team()).clone(model.bawRole);
    return model;
  }

  static send(model: any): any {
    return model;
  }


}
