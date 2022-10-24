import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {AdminResult} from '@app/models/admin-result';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';

export class GeneralAssociationInternalMember extends SearchableCloneable<GeneralAssociationInternalMember>{
  id!: number;
  arabicName!: string;
  englishName!: string;
  domainName!: string;
  memberType!: number;
  name?: string;
  pId?: string;
  tkiid?: string;
  memberTypeInfo!: AdminResult;
  langService!: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this.langService.map.lang === 'ar' ? this.arabicName : this.englishName;
  }
}
