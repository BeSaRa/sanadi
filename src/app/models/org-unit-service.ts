import { BaseModel } from '@app/models/base-model';
import { OrganizationUnitServicesService } from '@app/services/organization-unit-services.service';
import { AdminResult } from '@app/models/admin-result';
import { searchFunctionType } from '@app/types/types';
import { FactoryService } from '@app/services/factory.service';
import { Observable } from 'rxjs';
import { INames } from '@app/interfaces/i-names';
import { LangService } from '@app/services/lang.service';
import { OrganizationUnitServicesInterceptor } from "@app/model-interceptors/organization-unit-services-interceptor";
import { InterceptModel } from "@decorators/intercept-model";

const { send, receive } = new OrganizationUnitServicesInterceptor();

@InterceptModel({ send, receive })
export class OrgUnitService extends BaseModel<OrgUnitService, OrganizationUnitServicesService> {
  serviceId!: number
  orgUnitId!: number;
  orgUnitInfo!: AdminResult;
  serviceDataInfo!: AdminResult;
  status!: number;
  statusDateModified: string = '';

  searchFields: { [key: string]: searchFunctionType | string } = {
    serviceName: text => !this.serviceDataInfo ? false : this.serviceDataInfo.getName().toLowerCase().indexOf(text) !== -1
  };
  service: OrganizationUnitServicesService;
  langService: LangService;
  statusDateModifiedString: string = '';

  constructor() {
    super();
    this.service = FactoryService.getService('OrganizationUnitServicesService');
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  create(): Observable<OrgUnitService> {
    return this.service.create(this);
  }

  delete(): Observable<boolean> {
    return this.service.delete(this.id);
  }

  save(): Observable<OrgUnitService> {
    return this.id ? this.update() : this.create();
  }

  update(): Observable<OrgUnitService> {
    return this.service.update(this);
  }
}
