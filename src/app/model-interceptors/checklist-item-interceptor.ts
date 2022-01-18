import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ChecklistItem} from '@app/models/checklist-item';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class ChecklistItemInterceptor implements IModelInterceptor<ChecklistItem>{
  receive(model: ChecklistItem): ChecklistItem {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<ChecklistItem>): Partial<ChecklistItem> {
    delete model.langService;
    return model;
  }
}
