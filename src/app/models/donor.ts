import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {BaseModel} from '@app/models/base-model';
import {DonorService} from '@services/donor.service';
import {FactoryService} from '@services/factory.service';
import {LangService} from '@services/lang.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {INames} from '@contracts/i-names';
import {AdminResult} from '@app/models/admin-result';
import {infoSearchFields} from '@helpers/info-search-fields';
import {InterceptModel} from '@decorators/intercept-model';
import {DonorInterceptor} from '@app/model-interceptors/donor-interceptor';

const interceptor: DonorInterceptor = new DonorInterceptor()

@InterceptModel({
  receive: interceptor.receive,
  send: interceptor.send
})
export class Donor extends BaseModel<Donor, DonorService>{
  id!: number;
  arName!: string;
  enName!: string;
  status: number = CommonStatusEnum.ACTIVATED;
  statusDateModified!: string;

  // extra properties
  service!: DonorService;
  langService!: LangService;
  statusInfo!: AdminResult;
  statusDateModifiedString!: string;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
    this.service = FactoryService.getService('DonorService')
  }

  searchFields: ISearchFieldsMap<Donor> = {
    ...normalSearchFields(['arName', 'enName']),
    ...infoSearchFields(['statusInfo']),
    statusDateModified: 'statusDateModifiedString'
  };

  buildForm(controls?: boolean): any {
    const {
      arName,
      enName,
    } = this;
    return {
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : enName,
    }
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  isActive(): boolean {
    return Number(this.status) === CommonStatusEnum.ACTIVATED;
  }

  updateStatus(newStatus: CommonStatusEnum): any {
    return this.service.updateStatus(this.id, newStatus);
  }
}
