import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {AdminResult} from '@app/models/admin-result';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';

export class GeneralAssociationExternalMember extends SearchableCloneable<GeneralAssociationExternalMember>{
  id?: number;
  arabicName!: string;
  englishName!: string;
  jobTitleId!: number;
  identificationNumber!: number;
  jobTitleInfo!: AdminResult;
  langService!: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this.langService.map.lang === 'ar' ? this.arabicName : this.englishName;
  }
}
