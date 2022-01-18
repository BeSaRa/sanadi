import {BaseModel} from '@app/models/base-model';
import {ChecklistService} from '@app/services/checklist.service';
import {Lookup} from '@app/models/lookup';
import {INames} from '@app/interfaces/i-names';
import {FactoryService} from '@app/services/factory.service';
import {LangService} from '@app/services/lang.service';

export class ChecklistItem extends BaseModel<ChecklistItem, ChecklistService>{
  langService: LangService;
  service!: ChecklistService;
  arDesc!: string;
  enDesc!: string;
  stepId!: number;
  stepOrder!: number;
  status!: number;
  statusInfo!: Lookup;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
