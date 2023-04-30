import { ControlValueLabelLangKey } from './../types/types';
import {ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {Validators} from '@angular/forms';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { AdminResult } from './admin-result';
import { CommonUtils } from '@app/helpers/common-utils';

export class Stage extends SearchableCloneable<Stage> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  stage!: string;
  notes!: string;
  interventionCost!: number;
  duration!: number;

  searchFields: ISearchFieldsMap<Stage> = {
    ...normalSearchFields(['stage', 'duration', 'interventionCost', 'notes'])
  };

  getAdminResultByProperty(property: keyof Stage): AdminResult {
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
      stage: { langKey: 'stage', value: this.stage },
      duration: { langKey: 'duration', value: this.duration },
      interventionCost: { langKey: 'intervention_cost', value: this.interventionCost },
      notes: { langKey: 'notes', value: this.notes },
    };
  }
  buildForm(controls: boolean = false) {
    const {stage, duration, interventionCost, notes} = this;
    return {
      stage: controls ? [stage, [CustomValidators.required, CustomValidators.maxLength(200)]] : stage,
      duration: controls ? [duration, [CustomValidators.required, CustomValidators.number, Validators.max(30)]] : duration,
      interventionCost: controls ? [interventionCost, [CustomValidators.required, CustomValidators.decimal(2), CustomValidators.maxLength(20)]] : interventionCost,
      notes: controls ? [notes, [CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]]: notes
    };
  }
}
