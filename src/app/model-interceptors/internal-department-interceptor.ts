import {InternalDepartment} from '@models/internal-department';
import {Team} from '@models/team';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';
import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {Lookup} from '@models/lookup';

export class InternalDepartmentInterceptor implements IModelInterceptor<InternalDepartment> {
  receive(model: InternalDepartment): InternalDepartment {
    model.mainTeam = (new Team()).clone(model.mainTeam);
    model.teamId = model.mainTeam.id;
    if (!model.statusInfo) {
      const lookupService = FactoryService.getService('LookupService') as LookupService;
      model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    } else {
      model.statusInfo = new Lookup().clone(model.statusInfo);
    }
    return model;
  }

  send(model: any): any {
    model.mainTeam = {id: model.teamId};
    delete model.statusInfo;
    delete model.teamId;
    delete model.service;
    delete model.langService;
    delete model.typeInfo;
    delete model.updatedByInfo;
    delete model.parentInfo;
    delete model.managerInfo;
    delete model.createdByInfo;
    return model;
  }


}
