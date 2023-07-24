import {Team} from './team';
import {BaseModel} from './base-model';
import {INames} from '@contracts/i-names';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';
import {InternalDepartmentService} from '@services/internal-department.service';
import {Lookup} from '@app/models/lookup';
import {CustomValidators} from '@app/validators/custom-validators';
import {ISearchFieldsMap} from '@app/types/types';
import {Observable} from 'rxjs';
import {BlobModel} from '@app/models/blob-model';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {InternalDepartmentInterceptor} from "@app/model-interceptors/internal-department-interceptor";
import {InterceptModel} from "@decorators/intercept-model";
import {normalSearchFields} from '@helpers/normal-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';

const interceptor = new InternalDepartmentInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class InternalDepartment extends BaseModel<InternalDepartment, InternalDepartmentService> {
  service!: InternalDepartmentService;
  mainTeam!: Team;
  code!: string;
  createdBy!: any;
  createdOn!: any;
  email!: string;
  ldapPrefix!: string;
  parent!: number;
  status: number = CommonStatusEnum.ACTIVATED;
  statusDateModified!: any;
  type!: number;
  statusInfo!: Lookup;
  managerId!: number;
  teamId!: number;

  langService: LangService;

  searchFields: ISearchFieldsMap<InternalDepartment> = {
    ...normalSearchFields(['arName', 'enName']),
    ...infoSearchFields(['statusInfo'])
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('InternalDepartmentService')
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      teamId,
      managerId,
      email
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(100),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(100),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')
      ]] : enName,
      teamId: controls ? [teamId, [
        CustomValidators.required
      ]] : teamId,
      managerId: controls ? [managerId, []] : managerId,
      email: controls ? [email, [
        CustomValidators.required,
        CustomValidators.maxLength(50),
        CustomValidators.pattern('EMAIL')
      ]] : email
    }
  }

  saveStamp(file: File): Observable<boolean> {
    return this.service.updateStamp(this.id, file);
  }

  getStamp(): Observable<BlobModel> {
    return this.service.getStamp(this.id);
  }

  ngSelectSearch(searchText: string): boolean {
    if (!searchText) {
      return true;
    }
    return this.getName().toLowerCase().indexOf(searchText.toLowerCase()) > -1;
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
