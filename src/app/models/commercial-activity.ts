import {normalSearchFields} from '@app/helpers/normal-search-fields';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {CustomValidators} from '@app/validators/custom-validators';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {AdminResult} from '@models/admin-result';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import {ObjectUtils} from '@helpers/object-utils';
import {CommonUtils} from '@helpers/common-utils';

export class CommercialActivity extends SearchableCloneable<CommercialActivity> implements IAuditModelProperties<CommercialActivity> {
  activityName!: string;
  details!: string;

  searchFields: ISearchFieldsMap<CommercialActivity> = {
    ...normalSearchFields(['activityName', 'details']),
  };

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  constructor() {
    super();
  }

  getAdminResultByProperty(property: keyof CommercialActivity): AdminResult {
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

  buildForm(controls: boolean = false) {
    const values = ObjectUtils.getControlValues<CommercialActivity>(this.getValuesWithLabels());
    return {
      activityName: controls
        ? [
          values.activityName,
          [
            CustomValidators.required,
            CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
          ],
        ]
        : values.activityName,
      details: controls
        ? [
          values.details,
          [
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.EXPLANATIONS
            ),
          ],
        ]
        : values.details,
    };
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      activityName: {langKey: 'lbl_activity_name', value: this.activityName},
      details: {langKey: 'details', value: this.details}
    };
  }
}
