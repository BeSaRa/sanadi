import {InternalDepartment} from '../models/internal-department';
import {Team} from '../models/team';

export class InternalDepartmentInterceptor {
  static receive(model: InternalDepartment): InternalDepartment {
    model.mainTeam = (new Team()).clone(model.mainTeam);
    return model;
  }

  static send(model: any): any {
    return model;
  }


}
