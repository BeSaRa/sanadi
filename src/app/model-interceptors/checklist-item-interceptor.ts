import {IModelInterceptor} from '@app/interfaces/i-model-interceptor';
import {ChecklistItem} from '@app/models/checklist-item';
import {FactoryService} from '@app/services/factory.service';
import {LookupService} from '@app/services/lookup.service';

export class ChecklistItemInterceptor implements IModelInterceptor<ChecklistItem> {
  receive(model: ChecklistItem): ChecklistItem {
    const lookupService = FactoryService.getService('LookupService') as LookupService;
    model.statusInfo = (lookupService.listByCategory.CommonStatus.find(s => s.lookupKey == model.status)!);
    return model;
  }

  send(model: Partial<ChecklistItem>): Partial<ChecklistItem> {
    model.status = model.status ? 1 : 0;
    model.stepOrder = +model.stepOrder!;
    delete model.langService;
    delete model.service;
    delete model.statusInfo;
    delete model.checked;
    delete model.searchFields;
    return model;
  }
}
