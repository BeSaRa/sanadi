import {BaseModel} from './base-model';
import {UserTypes} from '@enums/user-types.enum';
import {INames} from '@contracts/i-names';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';
import {AdminResult} from "@app/models/admin-result";
import {InternalDepartment} from "@app/models/internal-department";
import {InternalUserService} from "@app/services/internal-user.service";
import {CustomValidators} from "@app/validators/custom-validators";
import {Observable} from "rxjs";
import {ISearchFieldsMap} from '@app/types/types';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {InternalUserInterceptor} from "@app/model-interceptors/internal-user-interceptor";
import {InterceptModel} from "@decorators/intercept-model";
import {UserPreferences} from '@models/user-preferences';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {infoSearchFields} from '@helpers/info-search-fields';

const interceptor = new InternalUserInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class InternalUser extends BaseModel<InternalUser, InternalUserService> {
  service: InternalUserService;
  id!: number;
  arName!: string;
  enName!: string;
  defaultDepartmentId!: number;
  defaultDepartmentInfo!: AdminResult;
  departmentInfo!: InternalDepartment[];
  domainName!: string;
  qid!: string;
  email!: string;
  empNum!: string;
  jobTitle!: number;
  jobTitleInfo!: AdminResult;
  officialPhoneNumber!: string;
  phoneExtension!: string;
  phoneNumber!: string;
  status!: number;
  statusInfo!: AdminResult;
  userTypeInfo!: AdminResult;
  statusDateModified!: string;
  userType: UserTypes = UserTypes.INTERNAL;
  generalUserId!: number;
  customRoleId!: number;
  userPreferences!: UserPreferences;
  langService: LangService;

  searchFields: ISearchFieldsMap<InternalUser> = {
    ...normalSearchFields(['domainName', 'arName', 'enName', 'empNum', 'qid']),
    ...infoSearchFields(['statusInfo', 'defaultDepartmentInfo'])
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('InternalUserService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  getProfileId(): number | undefined {
    return undefined;
  }

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
      domainName,
      email,
      qid,
      empNum,
      phoneNumber,
      status,
      customRoleId
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(50),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(50),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM')
      ]] : enName,
      domainName: controls ? [domainName, [
        CustomValidators.required,
        CustomValidators.maxLength(50),
        CustomValidators.pattern('ENG_NUM_ONLY')]
      ] : domainName,
      qid: controls ? [{
        value: qid,
        disabled: !!this.id
      }, [CustomValidators.required].concat(CustomValidators.commonValidations.qId)] : qid,
      email: controls ? [email, [
        CustomValidators.required,
        CustomValidators.maxLength(50),
        CustomValidators.pattern('EMAIL')]
      ] : email,
      empNum: controls ? [empNum, [
        CustomValidators.required,
        CustomValidators.number,
        CustomValidators.maxLength(10)
      ]] : empNum,
      phoneNumber: controls ? [phoneNumber, CustomValidators.commonValidations.phone] : phoneNumber,
      status: controls ? [status, [CustomValidators.required]] : status,
      customRoleId: controls ? [customRoleId] : customRoleId
    }
  }

  ngSelectSearch(searchText: string): boolean {
    if (!searchText) {
      return true;
    }
    return this.getName().toLowerCase().indexOf(searchText.toLowerCase()) > -1;
  }

  isExternal(): boolean {
    return false;
  }

  isInternal(): boolean {
    return true;
  }

  updateDefaultDepartment(): Observable<boolean> {
    return this.service.updateDefaultDepartment({id: this.id, defaultDepartmentId: this.defaultDepartmentId});
  }

  isInactive(): boolean {
    return Number(this.status) === CommonStatusEnum.DEACTIVATED;
  }

  isActive(): boolean {
    return Number(this.status) === CommonStatusEnum.ACTIVATED;
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }

  saveSignature(signatureFile: File): Observable<any> {
    return this.service.saveSignature(this.generalUserId, signatureFile);
  }

  // noinspection JSUnusedGlobalSymbols
  getUniqueName(): string {
    return this.domainName;
  }
}
