import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {AdminResult} from './admin-result';
import {ObjectUtils} from "@helpers/object-utils";
import {infoSearchFields} from "@helpers/info-search-fields";

export class ProjectComponent extends SearchableCloneable<ProjectComponent> implements IAuditModelProperties<ProjectComponent> {
  componentName!: string;
  details!: string;
  totalCost!: number;
  expensesType!: number;
  expensesTypeInfo!: AdminResult;

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getAdminResultByProperty(property: keyof ProjectComponent): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'expensesType':
        adminResultValue = this.expensesTypeInfo;
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

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      componentName: {langKey: 'component_name', value: this.componentName},
      details: {langKey: 'details', value: this.details},
      totalCost: {langKey: 'total_cost', value: this.totalCost},
      expensesType: {langKey: 'expenses_type', value: this.expensesType},
    };
  }

  buildForm(control: boolean = false): any {
    const values = ObjectUtils.getControlValues<ProjectComponent>(this.getValuesWithLabels());

    return {
      componentName: control ? [values.componentName, [CustomValidators.required, CustomValidators.maxLength(100)]] : values.componentName,
      details: control ? [values.details, [ CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.details,
      totalCost: control ? [values.totalCost, [CustomValidators.required].concat(CustomValidators.commonValidations.decimalWithMinValue(2), CustomValidators.maxLength(20))] : values.totalCost,
      expensesType: control ? [values.expensesType] : values.expensesType,
    }
  }

  searchFields: ISearchFieldsMap<ProjectComponent> = {
    ...normalSearchFields(['componentName', 'details', 'totalCost']),
    ...infoSearchFields(['expensesTypeInfo'])
  };

  isEqual(record: ProjectComponent): boolean {
    return this.componentName === record.componentName;
  }
}
