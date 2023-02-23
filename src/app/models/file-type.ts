import {SearchableCloneable} from '@models/searchable-cloneable';
import {INames} from '@contracts/i-names';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';

export class FileType extends SearchableCloneable<FileType> {
  id!: number;
  extension!: string;
  description!: string;
  mimeType!: string;
  arName!: string;
  enName!: string;
  size!: number;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName() {
    return this[(this.langService?.map.lang + 'Name') as keyof INames] || '';
  }

  ngSelectSearch(searchText: string): boolean {
    if (!searchText) {
      return true;
    }
    return this.getName().toLowerCase().indexOf(searchText.toLowerCase()) > -1;
  }
}
