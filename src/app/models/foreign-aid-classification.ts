import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { ForeignAidClassificationInterceptor } from '@app/model-interceptors/foreign-aid-classification-interceptor';
import { ISearchFieldsMap } from '@app/types/types';
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
  mainDACInfo!: AdminResult;
  mainDACCategory!: number;
  mainDACCategoryInfo!: AdminResult;
  mainUNOCHAInfo!: AdminResult;
  mainUNOCHACategory!: number;
  mainUNOCHACategoryInfo!: AdminResult;
  subDACInfo!: AdminResult;
  subDACCategory!: number;
  subDACCategoryInfo!: AdminResult;
  subUNOCHAInfo!: AdminResult;
  subUNOCHACategory!: number;
  subUNOCHACategoryInfo!: AdminResult;

  id!: number;
  objectDBId?: number;
  domain?: number;
  domainInfo!: AdminResult;

  searchFields: ISearchFieldsMap<ForeignAidClassification> = {
    ...infoSearchFields(['subUNOCHACategoryInfo', 'subUNOCHAInfo', 'subDACCategoryInfo', 'mainUNOCHACategoryInfo',
      'mainUNOCHAInfo', 'mainDACCategoryInfo', 'mainDACInfo', 'governanceDomainInfo', 'aidClassificationInfo'])
  }
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
      aidClassificationInfo,
      domainInfo: governanceDomainInfo,
      mainDACCategoryInfo: mainDACInfo,
      mainUNOCHACategoryInfo: mainUNOCHAInfo,
      subDACCategoryInfo: subDACInfo,
      subUNOCHACategoryInfo: subUNOCHAInfo
    });
  }
}
