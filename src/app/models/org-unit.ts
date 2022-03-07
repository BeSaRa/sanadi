import {BaseModel} from './base-model';
import {Observable} from 'rxjs';
import {FactoryService} from '../services/factory.service';
import {LangService} from '../services/lang.service';
import {INames} from '../interfaces/i-names';
import {OrganizationUnitService} from '../services/organization-unit.service';
import {Lookup} from './lookup';
import {LookupService} from '../services/lookup.service';
import {LookupCategories} from '../enums/lookup-categories';
import {searchFunctionType} from '../types/types';
import {FileStore} from './file-store';
import {DialogRef} from '../shared/models/dialog-ref';
import {CustomValidators} from '@app/validators/custom-validators';
import {Validators} from '@angular/forms';

export class OrgUnit extends BaseModel<OrgUnit, OrganizationUnitService> {
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
  orgNationality: number | undefined = 1;
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
  city: number | undefined;
  licensingAuthority!: number;
  workField!: number;
  orgFieldId!: number;
  promoteExtProj: boolean = false;
  arabicBrief: string | undefined;
  enBrief: string | undefined;
  arabicBoardMembers: string[] | undefined = [];
  enBoardMembers: string[] | undefined = [];
  logo: FileStore | undefined;

  service: OrganizationUnitService;
  langService: LangService;
  lookupService: LookupService;
  statusDateModifiedString!: string;

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    // nationality: text => this.getOrgNationalityLookup()?.getName().toLowerCase().indexOf(text) !== -1,
    phoneNumber1: 'phoneNumber1',
    email: 'email',
    address: 'address',
    statusModifiedDate: 'statusDateModifiedString',
    status: text => !this.getOrgStatusLookup() ? false : this.getOrgStatusLookup()?.getName().toLowerCase().indexOf(text) !== -1
  };

  constructor() {
    super();
    this.service = FactoryService.getService('OrganizationUnitService');
    this.langService = FactoryService.getService('LangService');
    this.lookupService = FactoryService.getService('LookupService');
  }

  buildFormBasic(controls?: boolean): any {
    const {
      arName,
      enName,
      orgUnitType,
      orgCode,
      status,
      email,
      phoneNumber1,
      phoneNumber2,
      address,
      buildingName,
      unitName,
      street,
      zone,
      city,
      orgNationality,
      poBoxNum,
      hotLine,
      faxNumber,
      registryCreator,
      registryDate,
      licensingAuthority,
      workField,
      orgFieldId,
      promoteExtProj
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
      ]] : enName,
      orgUnitType: controls ? [orgUnitType, CustomValidators.required] : orgUnitType,
      orgCode: controls ? [orgCode, [CustomValidators.required, Validators.maxLength(10)]]: orgCode,
      status: controls ? [status, CustomValidators.required]: status,
      email: controls ? [email, [CustomValidators.required, Validators.email, Validators.maxLength(50)]]: email,
      phoneNumber1: controls ? [phoneNumber1, [
        CustomValidators.required, CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]]: phoneNumber1,
      phoneNumber2: controls ? [phoneNumber2, [
        CustomValidators.number, Validators.maxLength(CustomValidators.defaultLengths.PHONE_NUMBER_MAX)]]: phoneNumber2,
      address: controls ? [address, [Validators.maxLength(CustomValidators.defaultLengths.ADDRESS_MAX)]]: address,
      buildingName: controls ? [buildingName, [CustomValidators.required, Validators.maxLength(200)]]: buildingName,
      unitName: controls ? [unitName, [CustomValidators.required, Validators.maxLength(200)]]: unitName,
      street: controls ? [street, [CustomValidators.required, Validators.maxLength(200)]]: street,
      zone: controls ? [zone, [CustomValidators.required, Validators.maxLength(100)]]: zone,
      city: controls ? [city, [CustomValidators.required]]: city,
      orgNationality: controls ? [orgNationality, CustomValidators.required]: orgNationality,
      poBoxNum: controls ? [poBoxNum, [CustomValidators.number, Validators.maxLength(10)]]: poBoxNum,
      hotLine: controls ? [hotLine, [CustomValidators.required, CustomValidators.number, Validators.maxLength(10)]]: hotLine,
      faxNumber: controls ? [faxNumber, [CustomValidators.required].concat(CustomValidators.commonValidations.fax)]: faxNumber,
      registryCreator: controls ? [registryCreator]: registryCreator,
      registryDate: controls ? [registryDate, CustomValidators.maxDate(new Date())]: registryDate,
      licensingAuthority: controls ? [licensingAuthority, CustomValidators.required]: licensingAuthority,
      workField: controls ? [workField, CustomValidators.required]: workField,
      orgFieldId: controls ? [orgFieldId, CustomValidators.required]: orgFieldId,
      promoteExtProj: controls ? [promoteExtProj]: promoteExtProj
    }
  }

  setBasicFormCrossValidations(): any {
    return CustomValidators.validateFieldsStatus([
      'arName', 'enName', 'orgUnitType', 'orgCode', 'status', 'email', 'phoneNumber1', 'phoneNumber2',
      'address', 'buildingName', 'unitName', 'street', 'zone', 'city', 'orgNationality', 'poBoxNum', 'hotLine', 'faxNumber', 'registryCreator',
      'registryDate', 'licensingAuthority', 'workField'
    ])
  }

  buildFormAdvanced(controls?: boolean): any {
    const {
      unifiedEconomicRecord, webSite, establishmentDate, registryNumber, budgetClosureDate, orgUnitAuditor, linkToInternalSystem,
      lawSubjectedName, boardDirectorsPeriod, arabicBoardMembers, enBoardMembers, arabicBrief, enBrief
    } = this;
    return {
      unifiedEconomicRecord: controls ? [unifiedEconomicRecord, [Validators.maxLength(150)]]: unifiedEconomicRecord,
      webSite: controls ? [webSite, [Validators.maxLength(350)]]: webSite,
      establishmentDate: controls ? [establishmentDate]: establishmentDate,
      registryNumber: controls ? [registryNumber, [Validators.maxLength(50)]]: registryNumber,
      budgetClosureDate: controls ? [budgetClosureDate]: budgetClosureDate,
      orgUnitAuditor:controls ?  [orgUnitAuditor, [Validators.maxLength(350)]]: orgUnitAuditor,
      linkToInternalSystem:controls ?  [linkToInternalSystem, [Validators.maxLength(450)]]: linkToInternalSystem,
      lawSubjectedName:controls ?  [lawSubjectedName, [Validators.maxLength(450)]]: lawSubjectedName,
      boardDirectorsPeriod:controls ?  [boardDirectorsPeriod, [Validators.maxLength(350)]]: boardDirectorsPeriod,
      arabicBoardMembers:controls ?  [arabicBoardMembers]: arabicBoardMembers,
      enBoardMembers:controls ?  [enBoardMembers]: enBoardMembers,
      arabicBrief:controls ?  [arabicBrief, [CustomValidators.pattern('AR_NUM'), Validators.maxLength(2000)]]: arabicBrief,
      enBrief:controls ?  [enBrief, [CustomValidators.pattern('ENG_NUM'), Validators.maxLength(2000)]]: enBrief
    }
  }

  setAdvancedFormCrossValidations(): any {
    return CustomValidators.validateFieldsStatus([
      'unifiedEconomicRecord', 'webSite', 'establishmentDate', 'registryNumber', 'budgetClosureDate',
      'orgUnitAuditor', 'linkToInternalSystem', 'lawSubjectedName', 'boardDirectorsPeriod',
      'arabicBoardMembers', 'enBoardMembers', 'arabicBrief', 'enBrief'
    ])
  }

  create(): Observable<OrgUnit> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  deactivate(): Observable<boolean> {
    return this.service.deactivate(this.id);
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

  saveLogo(file: File): Observable<boolean> {
    return this.service.updateLogo(this.id, file);
  }

  showAuditLogs(): Observable<DialogRef> {
    return this.service.openAuditLogsById(this.id);
  }

}
