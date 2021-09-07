import {BaseModel} from './base-model';
import {CountryService} from '../services/country.service';
import {FactoryService} from '../services/factory.service';
import {INames} from '../interfaces/i-names';
import {LangService} from '../services/lang.service';
import {AdminResult} from './admin-result';
import {searchFunctionType} from '../types/types';
import {StatusEnum} from '../enums/status.enum';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

export class Country extends BaseModel<Country, CountryService> {
  parentId?: number;
  riskLevel!: number;
  statusDateModified!: string;
  status!: number;

  parentInfo!: AdminResult;
  statusInfo!: AdminResult;
  service: CountryService;
  langService: LangService;
  statusDateModifiedString: string = '';

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    // parent: text => !this.parentInfo ? false : this.parentInfo.getName().toLowerCase().indexOf(text) !== -1,
    status: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1,
    riskLevel: 'riskLevel',
    statusDateModified: 'statusDateModifiedString'
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('CountryService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }

  isRetired(): boolean {
    return Number(this.status) === CommonStatusEnum.RETIRED;
  }

  isInactive(): boolean {
    return Number(this.status) === CommonStatusEnum.DEACTIVATED;
  }

  isActive(): boolean {
    return Number(this.status) === CommonStatusEnum.ACTIVATED;
  }

}
