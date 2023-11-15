import {CustomValidators} from "@app/validators/custom-validators";
import {SearchableCloneable} from "@app/models/searchable-cloneable";
import {normalSearchFields} from "@app/helpers/normal-search-fields";
import {ControlValueLabelLangKey, ISearchFieldsMap} from "@app/types/types";
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
import {AdminResult} from '@models/admin-result';
import {ObjectUtils} from '@helpers/object-utils';
import {CommonUtils} from '@helpers/common-utils';

export class ApprovalReason extends SearchableCloneable<ApprovalReason> implements IAuditModelProperties<ApprovalReason> {
  projects!: string;
  research!: string;
  fieldVisit!: string;
  itemId!:string;

  searchFields: ISearchFieldsMap<ApprovalReason> = {
    ...normalSearchFields(['projects', 'research', 'fieldVisit'])
  };

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof ApprovalReason): AdminResult {
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
      projects: {langKey: 'lbl_projects', value: this.projects},
      research: {langKey: 'lbl_research', value: this.research},
      fieldVisit: {langKey: 'lbl_field_visit', value: this.fieldVisit}
    };
  }

  getApprovalReasonFields(control: boolean): any {
    const values = ObjectUtils.getControlValues<ApprovalReason>(this.getValuesWithLabels());

    return {
      projects: control ? [values.projects, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.projects,
      research: control ? [values.research, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.research,
      fieldVisit: control ? [values.fieldVisit, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.fieldVisit,
    };
  }

  isEqual(record: ApprovalReason): boolean {
    return record.research === this.research
      && record.projects === this.projects
      && record.fieldVisit === this.fieldVisit;
  }
}
