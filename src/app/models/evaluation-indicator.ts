import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {AdminResult} from '@app/models/admin-result';
import {CustomValidators} from '@app/validators/custom-validators';
import {Validators} from '@angular/forms';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {ObjectUtils} from '@app/helpers/object-utils';
import {normalSearchFields} from "@helpers/normal-search-fields";
import {infoSearchFields} from "@helpers/info-search-fields";

export class EvaluationIndicator extends SearchableCloneable<EvaluationIndicator> implements IAuditModelProperties<EvaluationIndicator> {
  indicator!: number;
  percentage!: number;
  notes!: string;
  indicatorInfo?: AdminResult;

  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  searchFields: ISearchFieldsMap<EvaluationIndicator> = {
    ...normalSearchFields(['percentage', 'notes']),
    ...infoSearchFields(['indicatorInfo'])
  };

  getAdminResultByProperty(property: keyof EvaluationIndicator): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'indicator':
        adminResultValue = this.indicatorInfo!;
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
      indicator: {langKey: 'indicator', value: this.indicator},
      percentage: {langKey: 'percentage', value: this.percentage},
      notes: {langKey: 'notes', value: this.notes},
    };
  }

  buildForm(controls?: boolean): any {
    const values = ObjectUtils.getControlValues<EvaluationIndicator>(this.getValuesWithLabels());
    return {
      indicator: controls ? [values.indicator, [CustomValidators.required,]] : values.indicator,
      percentage: controls ? [values.percentage, [CustomValidators.required, Validators.max(100), CustomValidators.decimal(2)]] : values.percentage,
      notes: controls ? [values.notes, [CustomValidators.maxLength(250)]] : values.notes
    }
  }

  isEqual(record: EvaluationIndicator): boolean {
    return this.indicator === record.indicator
      && this.percentage === record.percentage
      && this.notes === record.notes;
  }
}
