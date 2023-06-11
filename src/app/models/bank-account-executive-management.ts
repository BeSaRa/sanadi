import {SearchableCloneable} from "@models/searchable-cloneable";
import {LangService} from "@services/lang.service";
import {FactoryService} from "@services/factory.service";

export class BankAccountExecutiveManagement extends SearchableCloneable<BankAccountExecutiveManagement> {
  id!: number;
  identificationNumber!: string;
  arabicName!: string;
  englishName!: string;
  jobTitle!: string;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this.langService?.map.lang == 'ar' ? this.arabicName : this.englishName;
  }
}
