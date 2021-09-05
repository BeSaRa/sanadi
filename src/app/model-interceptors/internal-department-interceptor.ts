import {InternalDepartment} from '../models/internal-department';
import {Team} from '../models/team';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';

export class InternalDepartmentInterceptor implements IModelInterceptor<InternalDepartment>{
  receive(model: InternalDepartment): InternalDepartment {
    model.mainTeam = (new Team()).clone(model.mainTeam);
    model.teamId = model.mainTeam.id;
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: any): any {
    model.mainTeam = {id: model.teamId};
    delete model.statusInfo;
    delete model.teamId;
    delete model.service;
    delete model.langService;
    return model;
  }


}
