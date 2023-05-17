import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {ControlValueLabelLangKey, ISearchFieldsMap} from '@app/types/types';
import {AdminResult} from '@models/admin-result';
import {CommonUtils} from '@helpers/common-utils';
import {ObjectUtils} from '@helpers/object-utils';
import {normalSearchFields} from "@helpers/normal-search-fields";

export class TargetGroup extends SearchableCloneable<TargetGroup> {
  services!: string;
  targetedGroup!: string;

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  searchFields: ISearchFieldsMap<TargetGroup> = {
    ...normalSearchFields(['services', 'targetedGroup'])
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      services: {langKey: 'lbl_services', value: this.services},
      targetedGroup: {langKey: 'targeted_groups', value: this.targetedGroup}
    };
  }

  getTargetGroupFields(control: boolean): any {
    const values = ObjectUtils.getControlValues<TargetGroup>(this.getValuesWithLabels());

    return {
      services: control ? [values.services, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX)]] : values.services,
      targetedGroup: control ? [values.targetedGroup, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.targetedGroup
    };
  }

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof TargetGroup): AdminResult {
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
