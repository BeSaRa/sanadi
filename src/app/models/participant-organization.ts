import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {IMyDateModel} from 'angular-mydatepicker';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';

export class ParticipantOrganization extends SearchableCloneable<ParticipantOrganization>{
  organizationId!: number;
  arabicName!: string;
  englishName!: string;
  donation?: number;
  workStartDate?: string | IMyDateModel;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName() {
    return this.langService?.map.lang == 'ar' ? this.arabicName : this.englishName;
  }
}
