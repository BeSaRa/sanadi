import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {Trainer} from '@app/models/trainer';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';
import {Lookup} from '@app/models/lookup';

export class TrainerInterceptor implements IModelInterceptor<Trainer>{
  receive(model: Trainer): Trainer {
    let languages: number[];
    try {
      languages = JSON.parse(model.langList);
    }
    catch (err) {
      languages = [];
    }
    model.langListArr = languages;

    const lookupService = FactoryService.getService('LookupService') as LookupService;

    if(model.langListArr.length > 0) {
      model.langListInfo = model.langListArr.map(id => {
        return lookupService.listByCategory.TRAINING_LANG.find(lang => lang.lookupKey == id) || new Lookup();
      });
    } else {
      model.langListInfo = [];
    }

    model.nationalityInfo = lookupService.listByCategory.Nationality.find(nationality => model.nationality == nationality.lookupKey) || new Lookup();
    return model;
  }

  send(model: Partial<Trainer>): Partial<Trainer> {
    model.langList = JSON.stringify(model.langListArr);
    delete model.langListArr;
    delete model.trainerCV;
    delete model.langListInfo;
    delete model.nationalityInfo;
    return model;
  }
}
