import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {AdminResult} from '@models/admin-result';
import {CommonUtils} from '@helpers/common-utils';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import {ObjectUtils} from '@helpers/object-utils';

export class Goal extends SearchableCloneable<Goal> implements IAuditModelProperties<Goal>{
  goal!: string;

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  searchFields: ISearchFieldsMap<Goal> = {
    ...normalSearchFields(['goal'])
  };

  getGoalsFields(control: boolean): any {
    const values = ObjectUtils.getControlValues<Goal>(this.getValuesWithLabels());
    return {
      goal: control ? [values.goal, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)
      ]] : values.goal,
    }
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      goal: {langKey: 'goal', value: this.goal}
    };
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof Goal): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }
}
