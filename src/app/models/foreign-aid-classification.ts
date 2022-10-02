import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { ForeignAidClassificationInterceptor } from '@app/model-interceptors/foreign-aid-classification-interceptor';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';

const { send, receive } = new ForeignAidClassificationInterceptor();

@InterceptModel({
  receive,
  send
})

export class ForeignAidClassification extends SearchableCloneable<ForeignAidClassification> {
  charityWorkArea!: number;
  aidClassification!: number;
  aidClassificationInfo!: AdminResult;
  governanceDomain!: number;
  governanceDomainInfo!: AdminResult;

  mainDACCategory!: number;
  mainDACInfo!: AdminResult;

  mainUNOCHACategory!: number;
  mainUNOCHAInfo!: AdminResult;

  subDACCategory!: number;
  subDACInfo!: AdminResult;

  subUNOCHACategory!: number;
  subUNOCHAInfo!: AdminResult;

  id!: number;
  objectDBId?: number;
  domain?: number;

  toCharityOrgnizationUpdate() {
    const {
      id,
      charityWorkArea,
      aidClassification,
      governanceDomain,
      mainDACCategory,
      mainUNOCHACategory,
      subDACCategory,
      subUNOCHACategory,
      governanceDomainInfo,
      aidClassificationInfo,
      mainDACInfo,
      mainUNOCHAInfo,
      subDACInfo,
      subUNOCHAInfo

    } = this;
    return new ForeignAidClassification().clone({
      objectDBId: id,
      domain: governanceDomain,
      charityWorkArea,
      aidClassification,
      mainDACCategory,
      mainUNOCHACategory,
      subDACCategory,
      subUNOCHACategory,
      governanceDomainInfo,
      aidClassificationInfo,
      mainDACInfo,
      mainUNOCHAInfo,
      subDACInfo,
      subUNOCHAInfo

    });
  }
}
