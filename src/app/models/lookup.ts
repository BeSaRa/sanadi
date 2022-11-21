import {BaseModel} from './base-model';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {INames} from '@contracts/i-names';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {AdminResult} from '@app/models/admin-result';

export class Lookup extends BaseModel<Lookup, any> {
  service: any;
  category!: number;
  lookupKey!: number;
  lookupStrKey: string | undefined;
  status: number | undefined;
  itemOrder: number | undefined;
  parent: number | undefined;
  langService: LangService;

  // extra properties
  temp: boolean = false; // used in menu item (drag/drop) to mark the temporary item

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  ngSelectSearch(searchText: string): boolean {
    if (!searchText) {
      return true;
    }
    return this.getName().toLowerCase().indexOf(searchText.toLowerCase()) > -1;
  }

  setValues(arName: string, enName: string, lookupKey: number, id: number): Lookup {
    this.arName = arName;
    this.enName = enName;
    this.lookupKey = lookupKey;
    this.id = id;
    return this;
  }

  isRetiredCommonStatus(): boolean {
    return this.lookupKey === CommonStatusEnum.RETIRED;
  }

  isActive(): boolean {
    return !!this.status;
  }

  convertToAdminResult(): AdminResult {
    return AdminResult.createInstance({arName: this.arName, enName: this.enName, id: this.lookupKey});
  }
}
