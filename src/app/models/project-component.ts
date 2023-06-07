import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {AdminResult} from './admin-result';

export class ProjectComponent extends SearchableCloneable<ProjectComponent> implements IAuditModelProperties<ProjectComponent> {
  componentName!: string;
  details!: string;
  totalCost!: number;

  getAdminResultByProperty(property: keyof ProjectComponent): AdminResult {
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

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      componentName: {langKey: 'component_name', value: this.componentName},
      details: {langKey: 'details', value: this.details},
      totalCost: {langKey: 'total_cost', value: this.totalCost},
    };
  }

  buildForm(control: boolean = false): any {
    const {
      componentName,
      details,
      totalCost
    } = this;

    return {
      componentName: control ? [componentName, [CustomValidators.required, CustomValidators.maxLength(100)]] : componentName,
      details: control ? [details, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : details,
      totalCost: control ? [totalCost, [CustomValidators.required].concat(CustomValidators.commonValidations.decimalWithMinValue(2), CustomValidators.maxLength(20))] : totalCost
    }
  }

  searchFields: ISearchFieldsMap<ProjectComponent> = {
    ...normalSearchFields(['componentName', 'details', 'totalCost'])
  };

  isEqual(record: ProjectComponent): boolean {
    return this.componentName === record.componentName;
  }
}
