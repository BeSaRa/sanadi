import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {FactoryService} from '../services/factory.service';
import {LangService} from '../services/lang.service';
import {INames} from '../interfaces/i-names';
import {OrganizationUnitService} from '../services/organization-unit.service';
import {Lookup} from './lookup';
import {LookupService} from '../services/lookup.service';
import {LookupCategories} from '../enums/lookup-categories';

export class OrgUnit extends BaseModel<OrgUnit> {
  phoneNumber1: string | undefined;
  phoneNumber2: string | undefined;
  email: string | undefined;
  zone: string | undefined;
  street: string | undefined;
  buildingName: string | undefined;
  unitName: string | undefined;
  address: string | undefined;
  status: number | undefined;
  statusDateModified: number | undefined;
  orgCode: string | undefined;
  orgUnitType: number | undefined;
  registryCreator: number | undefined;
  registryDate: string | undefined;
  orgNationality: number | undefined;
  poBoxNum: number | undefined;
  unifiedEconomicRecord: string | undefined;
  hotLine: number | undefined;
  faxNumber: number | undefined;
  webSite: string | undefined;
  establishmentDate: string | undefined;
  registryNumber: string | undefined;
  budgetClosureDate: string | undefined;
  orgUnitAuditor: string | undefined;
  linkToInternalSystem: string | undefined;
  lawSubjectedName: string | undefined;
  boardDirectorsPeriod: string | undefined;

  service: OrganizationUnitService;
  langService: LangService;
  lookupService: LookupService;

  constructor() {
    super();
    this.service = FactoryService.getService('OrganizationUnitService');
    this.langService = FactoryService.getService('LangService');
    this.lookupService = FactoryService.getService('LookupService');
  }

  create(): Observable<OrgUnit> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<OrgUnit> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<OrgUnit> {
    return this.service.update(this);
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  getOrgNationalityLookup(): Lookup | null {
    // @ts-ignore
    return this.lookupService.getByLookupKeyAndCategory(this.orgNationality, LookupCategories.NATIONALITY);
  }

  getOrgStatusLookup(): Lookup | null {
    // @ts-ignore
    return this.lookupService.getByLookupKeyAndCategory(this.status, LookupCategories.ORG_STATUS);
  }

}
