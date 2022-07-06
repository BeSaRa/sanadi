import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';

export class ValidOrgUnit extends SearchableCloneable<ValidOrgUnit>{
  arabicName!: string;
  englishName!: string;
  organizationId!: number;
  langService!: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this.langService?.map.lang === 'ar' ? this.arabicName : this.englishName;
  }
}
