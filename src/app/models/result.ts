import { ControlValueLabelLangKey } from './../types/types';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@helpers/normal-search-fields';
import { CustomValidators } from '@app/validators/custom-validators';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { AdminResult } from './admin-result';
import { ObjectUtils } from '@app/helpers/object-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';

export class Result extends SearchableCloneable<Result> implements IAuditModelProperties<Result> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  outputs!: string;
  expectedResults!: string;
  expectedImpact!: string;

  constructor() {
    super();
  }

  searchFields: ISearchFieldsMap<Result> = {
    ...normalSearchFields(['outputs', 'expectedImpact', 'expectedResults'])
  };

  getAdminResultByProperty(property: keyof Result): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({ arName: value as string, enName: value as string });
    }
    return adminResultValue ?? new AdminResult();
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      outputs: { langKey: 'project_outputs', value: this.outputs },
      expectedImpact: { langKey: 'project_expected_results', value: this.expectedImpact },
      expectedResults: { langKey: 'project_expected_impacts', value: this.expectedResults },
    };
  }
  buildForm(controls: boolean = false) {
    const values = ObjectUtils.getControlValues<Result>(this.getValuesWithLabels())

    return {
      outputs: controls ? [values.outputs, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.outputs,
      expectedImpact: controls ? [values.expectedImpact, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.expectedImpact,
      expectedResults: controls ? [values.expectedResults, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.expectedResults
    };
  }
}
