import { ControlValueLabelLangKey } from './../types/types';
import { AdminResult } from '@app/models/admin-result';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { CustomValidators } from '@app/validators/custom-validators';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ObjectUtils } from '@app/helpers/object-utils';

export class InterventionField extends SearchableCloneable<InterventionField> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  mainUNOCHACategory!: number;
  subUNOCHACategory!: number;
  mainUNOCHACategoryInfo!: AdminResult;
  subUNOCHACategoryInfo!: AdminResult;

  searchFields: ISearchFieldsMap<InterventionField> = {
    ...infoSearchFields(['mainUNOCHACategoryInfo', 'subUNOCHACategoryInfo'])
  };

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      mainUNOCHACategory: { langKey: 'main_unocha_category', value: this.mainUNOCHACategory },
      subUNOCHACategory: { langKey: 'sub_unocha_category', value: this.subUNOCHACategory }
    };
  }
  getInterventionFieldForm(controls: boolean = false) {
    const values = ObjectUtils.getControlValues<InterventionField>(this.getValuesWithLabels())

    return {
      mainUNOCHACategory: controls ? [values.mainUNOCHACategory, [CustomValidators.required]] : values.mainUNOCHACategory,
      subUNOCHACategory: controls ? [values.subUNOCHACategory, [CustomValidators.required]] : values.subUNOCHACategory
    }
  }
  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof InterventionField): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'mainUNOCHACategory':
        adminResultValue = this.mainUNOCHACategoryInfo;
        break;
      case 'subUNOCHACategory':
        adminResultValue = this.subUNOCHACategoryInfo;
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
}
