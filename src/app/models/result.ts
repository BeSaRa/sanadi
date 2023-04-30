import { ControlValueLabelLangKey } from './../types/types';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@helpers/normal-search-fields';
import { CustomValidators } from '@app/validators/custom-validators';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { AdminResult } from './admin-result';

export class Result extends SearchableCloneable<Result> {
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
    const { outputs, expectedResults, expectedImpact } = this;
    return {
      outputs: controls ? [outputs, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : outputs,
      expectedImpact: controls ? [expectedImpact, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : expectedImpact,
      expectedResults: controls ? [expectedResults, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : expectedResults
    };
  }
}
