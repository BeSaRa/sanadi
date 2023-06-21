import {searchFunctionType} from '@app/types/types';
import {AdminResult} from './admin-result';
import {LangService} from '@services/lang.service';
import {AdminLookupService} from '@services/admin-lookup.service';
import {FactoryService} from '@services/factory.service';
import {INames} from '@contracts/i-names';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {InterceptModel} from '@decorators/intercept-model';
import {AdminLookupInterceptor} from '@app/model-interceptors/admin-lookup-interceptor';
import {BaseModelAdminLookup} from '@app/models/base-model-admin-lookup';
import {CustomValidators} from '@app/validators/custom-validators';
import {Lookup} from './lookup';


const interceptor = new AdminLookupInterceptor();

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class AdminLookup extends BaseModelAdminLookup<AdminLookup, AdminLookupService> {
  status!: number;
  type!: number;
  parentId?: number;
  statusDateModified!: string;

  parentInfo!: AdminResult;
  typeInfo!: AdminResult;
  statusInfo!: AdminResult;
  statusDateModifiedString!: string;

  service: AdminLookupService;
  langService: LangService;

  constructor() {
    super();
    this.service = FactoryService.getService('AdminLookupService');
    this.langService = FactoryService.getService('LangService');
  }

  searchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    statusInfo: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1
  };

  dacOchaSearchFields: { [key: string]: searchFunctionType | string } = {
    arName: 'arName',
    enName: 'enName',
    statusInfo: text => !this.statusInfo ? false : this.statusInfo.getName().toLowerCase().indexOf(text) !== -1
  };

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  convertToAdminResult(): AdminResult {
    return AdminResult.createInstance({
      arName: this.arName,
      enName: this.enName,
      id: this.id,
      status: this.status,
      disabled: !this.isActive()
    });
  }

  convertToLookup(): Lookup {
    return new Lookup().clone({arName: this.arName, enName: this.enName, lookupKey: this.id, status: this.status});
  }

  isInactive(): boolean {
    return Number(this.status) === CommonStatusEnum.DEACTIVATED;
  }

  isActive(): boolean {
    return Number(this.status) === CommonStatusEnum.ACTIVATED;
  }

  isRetired(): boolean {
    return Number(this.status) === CommonStatusEnum.RETIRED;
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, this.type, newStatus);
  }

  buildDacOchaForm(controls?: boolean): any {
    const {
      arName,
      enName,
      status,
      type
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
      status: controls ? [status, [CustomValidators.required]] : status,
      type: controls ? [type] : type
    }
  }

  buildActivityTypeForm(controls: boolean = false) {
    const {type, ...form} = this.buildDacOchaForm(controls);
    return form;
  }
}
