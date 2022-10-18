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
  mainDACCategoryInfo!: AdminResult;

  mainUNOCHACategory!: number;
  mainUNOCHACategoryInfo!: AdminResult;

  subDACCategory!: number;
  subDACCategoryInfo!: AdminResult;

  subUNOCHACategory!: number;
  subUNOCHACategoryInfo!: AdminResult;

  id!: number;
  objectDBId?: number;
  domain?: number;
  domainInfo!: AdminResult;

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
      domainInfo,
      mainDACCategoryInfo,
      mainUNOCHACategoryInfo,
      subDACCategoryInfo,
      subUNOCHACategoryInfo

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
      domainInfo,
      mainDACCategoryInfo,
      mainUNOCHACategoryInfo,
      subDACCategoryInfo,
      subUNOCHACategoryInfo


    });
  }
}
