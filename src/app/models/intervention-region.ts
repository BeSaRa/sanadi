import {ControlValueLabelLangKey} from './../types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {AdminResult} from './admin-result';
import {ObjectUtils} from '@app/helpers/object-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';

export class InterventionRegion extends SearchableCloneable<InterventionRegion> implements IAuditModelProperties<InterventionRegion> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  description!: string;
  region!: string;

  searchFields: ISearchFieldsMap<InterventionRegion> = {
    ...normalSearchFields(['region', 'description'])
  };

  constructor() {
    super();
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      region: {langKey: 'region', value: this.region},
      description: {langKey: 'lbl_description', value: this.description}
    };
  }

  getRegionFields(controls: boolean = false) {
    const values = ObjectUtils.getControlValues<InterventionRegion>(this.getValuesWithLabels())

    return {
      region: controls ? [values.region, [CustomValidators.required, CustomValidators.maxLength(50)]] : values.region,
      description: controls ? [values.description, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.description,
    }
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof InterventionRegion): AdminResult {
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

  isEqual(record: InterventionRegion): boolean {
    return this.region === record.region
      && this.description === record.description;
  }
}
