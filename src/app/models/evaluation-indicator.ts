import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {AdminResult} from '@app/models/admin-result';
import {CustomValidators} from '@app/validators/custom-validators';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {ObjectUtils} from '@app/helpers/object-utils';
import {normalSearchFields} from "@helpers/normal-search-fields";

export class EvaluationIndicator extends SearchableCloneable<EvaluationIndicator> implements IAuditModelProperties<EvaluationIndicator> {
  indicator!: string;
  notes!: string;

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  searchFields: ISearchFieldsMap<EvaluationIndicator> = {
    ...normalSearchFields(['indicator', 'notes'])
  };

  getAdminResultByProperty(property: keyof EvaluationIndicator): AdminResult {
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

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      indicator: {langKey: 'indicator', value: this.indicator},
      notes: {langKey: 'notes', value: this.notes},
    };
  }

  buildForm(controls?: boolean): any {
    const values = ObjectUtils.getControlValues<EvaluationIndicator>(this.getValuesWithLabels());
    return {
      indicator: controls ? [values.indicator, [CustomValidators.required, CustomValidators.maxLength(250)]] : values.indicator,
      notes: controls ? [values.notes, [CustomValidators.maxLength(250)]] : values.notes
    }
  }

  isEqual(record: EvaluationIndicator): boolean {
    return this.indicator === record.indicator;
  }
}
