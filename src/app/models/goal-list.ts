import {infoSearchFields} from '@app/helpers/info-search-fields';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {AdminResult} from './admin-result';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {CommonUtils} from '@helpers/common-utils';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import {ObjectUtils} from '@helpers/object-utils';

export class GoalList extends SearchableCloneable<GoalList> implements IAuditModelProperties<GoalList> {
  domain!: number;
  mainDACCategory!: number | null;
  mainDACCategoryInfo!: AdminResult;
  mainUNOCHACategory!: number | null;
  mainUNOCHACategoryInfo!: AdminResult;
  domainInfo!: AdminResult;
  itemId!:string;

  searchFields: ISearchFieldsMap<GoalList> = {
    ...infoSearchFields(['domainInfo', 'mainDACCategoryInfo', 'mainUNOCHACategoryInfo']),
  };

  // extra fields
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      domain: {langKey: 'domain', value: this.domain},
      mainDACCategory: {langKey: 'main_dac_category', value: this.mainDACCategory},
      mainUNOCHACategory: {langKey: 'main_unocha_category', value: this.mainUNOCHACategory}
    };
  }

  buildForm(control: boolean): any {
    const values = ObjectUtils.getControlValues<GoalList>(this.getValuesWithLabels());
    return {
      domain: control ? [values.domain, CustomValidators.required] : values.domain,
      mainDACCategory: control ? [values.mainDACCategory] : values.mainDACCategory,
      mainUNOCHACategory: control ? [values.mainUNOCHACategory] : values.mainUNOCHACategory,
    };
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof GoalList): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'domain':
        adminResultValue = this.domainInfo;
        break;
      case 'mainDACCategory':
        adminResultValue = this.mainDACCategoryInfo;
        break;
      case 'mainUNOCHACategory':
        adminResultValue = this.mainUNOCHACategoryInfo;
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }

  isEqual(record: GoalList): boolean {
    return this.domain === record.domain
      && this.mainDACCategory === record.mainDACCategory
      && this.mainUNOCHACategory === record.mainUNOCHACategory;
  }
}
