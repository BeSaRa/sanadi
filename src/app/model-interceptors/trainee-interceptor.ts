import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {Trainee} from '@app/models/trainee';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';
import {Lookup} from '@app/models/lookup';
import {TraineeData} from '@app/models/trainee-data';
import { AdminResult } from '@app/models/admin-result';

export class TraineeInterceptor implements IModelInterceptor<TraineeData> {
  receive(model: TraineeData): TraineeData {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.trainee = (new Trainee()).clone(model.trainee);

    let statusInfo = (lookupService.listByCategory.TRAINING_TRAINEE_STATUS.find(s => s.lookupKey == model.status)!);
    model.trainee.statusInfo = (new Lookup()).clone(statusInfo);

    let nationalityInfo = (lookupService.listByCategory.Nationality.find(s => s.lookupKey == model.trainee.nationality)!);
    model.trainee.nationalityInfo = (new Lookup()).clone(nationalityInfo);
    model.trainee.externalOrgInfo = model.trainee.externalOrgInfo && AdminResult.createInstance(model.trainee.externalOrgInfo);
    
    model.trainee.addedByRACA = model.addedByRACA;
    return model;
  }

  send(model: Partial<Trainee>): Partial<Trainee> {
    delete model.service;
    delete model.lang;
    delete model.statusInfo;
    delete model.nationalityInfo;
    return model;
  }
}
