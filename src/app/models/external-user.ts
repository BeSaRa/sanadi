import { BaseModel } from './base-model';
import { Observable } from 'rxjs';
import { FactoryService } from '@services/factory.service';
import { ExternalUserService } from '@services/external-user.service';
import { LangService } from '@services/lang.service';
import { INames } from '@contracts/i-names';
import { AdminResult } from './admin-result';
import { Lookup } from './lookup';
import { LookupService } from '@services/lookup.service';
import {ISearchFieldsMap, searchFunctionType} from '../types/types';
import { DialogRef } from '../shared/models/dialog-ref';
import { ExternalUserInterceptor } from "@app/model-interceptors/external-user-interceptor";
import { InterceptModel } from "@decorators/intercept-model";
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';

const interceptor = new ExternalUserInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class ExternalUser extends BaseModel<ExternalUser, ExternalUserService> {
  serviceToken!:	string;
  customRoleId: number | undefined;
  qid: string | undefined;
  profileId!: number;
  domainPwd!:	string;
  nationality!: number;
  gender!: number;
  status: number | undefined;
  statusDateModified: number | undefined;
  userType: number | undefined;
  phoneNumber: string | undefined;
  officialPhoneNumber: string | undefined;
  email: string | undefined;
  jobTitle: number | undefined;
  empNum: number | undefined;
  phoneExtension: string | undefined;
  domainName!:string;
  generalUserId!: number;
  profileInfo!: AdminResult;
  customRoleInfo!: AdminResult;
  nationalityInfo!: AdminResult;
  statusInfo!: AdminResult;
  userTypeInfo!: AdminResult;
  jobTitleInfo!: AdminResult;

  service: ExternalUserService;
  private langService: LangService;
  // lookupService: LookupService;
  statusDateModifiedString!: string;

  searchFields: ISearchFieldsMap<ExternalUser> = {
    ...normalSearchFields(['arName', 'enName', 'empNum', 'domainName', 'statusDateModifiedString']),
    ...infoSearchFields(['statusInfo'])
    // status: text => !this.getStatusLookup() ? false : this.getStatusLookup()?.getName().toLowerCase().indexOf(text) !== -1
  };

  constructor() {
    super();
    this.service = FactoryService.getService('ExternalUserService');
    this.langService = FactoryService.getService('LangService');
    // this.lookupService = FactoryService.getService('LookupService');
  }

  create(): Observable<ExternalUser> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  deactivate(): Observable<boolean> {
    return this.service.deactivate(this.id);
  }

  save(): Observable<ExternalUser> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<ExternalUser> {
    return this.service.update(this);
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  /*getStatusLookup(): Lookup | null {
    return this.lookupService.findLookupByLookupKey(this.lookupService.listByCategory.CommonStatus, this.status);
  }*/

  showAuditLogs(_$event?: MouseEvent): Observable<DialogRef> {
    return this.service.openAuditLogsById(this.id);
  }

  isExternal(): boolean {
    return true;
  }

  isInternal(): boolean {
    return false;
  }

  isActive(): boolean {
    return this.status === CommonStatusEnum.ACTIVATED;
  }

  updateStatus(newStatus: CommonStatusEnum): Observable<boolean> {
    return this.service.updateStatus(this.id, newStatus);
  }

  // noinspection JSUnusedGlobalSymbols
  getUniqueName(): string {
    return this.qid?.toString()?? '';
  }
}
