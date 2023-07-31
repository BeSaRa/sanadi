import { InterceptModel } from '@app/decorators/decorators/intercept-model';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { ForeignAidClassificationInterceptor } from '@app/model-interceptors/foreign-aid-classification-interceptor';
import { ISearchFieldsMap } from '@app/types/types';
import { AdminResult } from './admin-result';
import { SearchableCloneable } from './searchable-cloneable';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import { CommonUtils } from '@app/helpers/common-utils';
import { ControlValueLabelLangKey } from '@app/types/types';

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
  itemId!: string;

  id!: number;
  objectDBId?: number;
  domain?: number;
  domainInfo!: AdminResult;

  searchFields: ISearchFieldsMap<ForeignAidClassification> = {
    ...infoSearchFields(['subUNOCHACategoryInfo', 'subUNOCHAInfo', 'subDACCategoryInfo', 'mainUNOCHACategoryInfo',
      'mainUNOCHAInfo', 'mainDACCategoryInfo', 'mainDACInfo', 'governanceDomainInfo', 'aidClassificationInfo'])
  }
  getAdminResultByProperty(property: keyof ForeignAidClassification): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'aidClassification':
        adminResultValue = this.aidClassificationInfo;
        break;
      case 'governanceDomain':
        adminResultValue = this.governanceDomainInfo;
        break;
      case 'mainDACCategory':
        adminResultValue = this.mainDACCategoryInfo;
        break;
      case 'subDACCategory':
        adminResultValue = this.subDACCategoryInfo;
        break;
      case 'mainUNOCHACategory':
        adminResultValue = this.mainUNOCHACategoryInfo;
        break;
      case 'subUNOCHACategory':
        adminResultValue = this.subUNOCHACategoryInfo;
        break;
      case 'domain':
        adminResultValue = this.domainInfo;
        break;

      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      charityWorkArea:{ langKey: 'work_area', value: this.charityWorkArea },
      aidClassification:{ langKey: 'menu_aid_class', value: this.aidClassification },
      governanceDomain:{ langKey: 'domain', value: this.governanceDomain },
      mainDACCategory:{ langKey: 'classification_of_DAC', value: this.mainDACCategory },
      mainUNOCHACategory:{ langKey: 'OCHA_main_classification', value: this.mainUNOCHACategory },
      subDACCategory:{ langKey: 'DAC_subclassification', value: this.subDACCategory },
      subUNOCHACategory:{ langKey: 'OCHA_subclassification', value: this.subUNOCHACategory },
      domain:{ langKey: 'domain', value: this.domain },

    };
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
