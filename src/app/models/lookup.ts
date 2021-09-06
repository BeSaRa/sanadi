import {BaseModel} from './base-model';
import {LookupCategories} from '../enums/lookup-categories';
import {FactoryService} from '../services/factory.service';
import {LangService} from '../services/lang.service';
import {INames} from '../interfaces/i-names';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

export class Lookup extends BaseModel<Lookup, any> {
  service: any;
  category!: LookupCategories;
  lookupKey!: number;
  lookupStrKey: string | undefined;
  status: number | undefined;
  itemOrder: number | undefined;
  parent: number | undefined;
  langService: LangService;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  setValues(arName: string, enName: string, lookupKey: number, id: number): Lookup {
    this.arName = arName;
    this.enName = enName;
    this.lookupKey = lookupKey;
    this.id = id;
    return this;
  }

  isRetiredOrgStatus(): boolean {
    return Number(this.category) === Number(LookupCategories.ORG_STATUS_CAT_ID) && this.lookupKey === 0;
  }

  isRetiredOrgUserStatus(): boolean {
    return Number(this.category) === Number(LookupCategories.ORG_USER_STATUS_CAT_ID) && this.lookupKey === 0;
  }

  isRetiredAidLookupStatus(): boolean {
    return Number(this.category) === Number(LookupCategories.AID_LOOKUP_STATUS_CAT_ID) && this.lookupKey === 0;
  }

  isRemovedSubRequestStatus(): boolean {
    return Number(this.category) === Number(LookupCategories.SUB_REQUEST_STATUS_CAT_ID) && this.lookupKey === 0;
  }

  isCancelledSubRequestStatus(): boolean {
    return Number(this.category) === Number(LookupCategories.SUB_REQUEST_STATUS_CAT_ID) && this.lookupKey === 4;
  }

  isRetiredCommonStatus(): boolean {
    return Number(this.category) === Number(LookupCategories.COMMON_STATUS_CAT_ID) && this.lookupKey === CommonStatusEnum.RETIRED;
  }
}
