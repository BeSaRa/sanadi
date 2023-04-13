import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { ForeignAidClassificationInterceptor } from '@app/model-interceptors/foreign-aid-classification-interceptor';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';

const { send, receive } = new ForeignAidClassificationInterceptor();

@InterceptModel({
  receive,
  send
})

export class ForeignAidClassification extends SearchableCloneable<ForeignAidClassification> implements IAuditModelProperties<ForeignAidClassification> {
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

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  getAdminResultByProperty(property: keyof ForeignAidClassification): AdminResult {
    return AdminResult.createInstance({});
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
