import { AdminResult } from './admin-result';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from './searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import { CommonUtils } from '@app/helpers/common-utils';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { ControlValueLabelLangKey } from '@app/types/types';
import { ObjectUtils } from '@app/helpers/object-utils';

export class ProjectNeed extends SearchableCloneable<ProjectNeed> implements IAuditModelProperties<ProjectNeed> {

  constructor() {
    super();
  }
  projectName!: string;
  projectDescription!: string;
  totalCost!: number;
  beneficiaries!: string;
  goals!: string;


  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof ProjectNeed): AdminResult {
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
   // extra properties
   auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
   getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      projectName:{langKey: 'project_name', value: this.projectName},
      projectDescription:{langKey: 'project_description', value: this.projectDescription},
      totalCost:{langKey: 'total_cost', value: this.totalCost},
      beneficiaries:{langKey: 'beneficiary', value: this.beneficiaries},
      goals:{langKey: 'goals', value: this.goals}
    };
  }
  buildForm(withControls = true): IKeyValue {
    const { projectName, projectDescription, totalCost, beneficiaries, goals } = ObjectUtils.getControlValues<ProjectNeed>(this.getValuesWithLabels());;
    return {
      projectName: withControls ? [projectName, [CustomValidators.required, CustomValidators.maxLength(300)]] : projectName,
      projectDescription: withControls ? [projectDescription, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : projectDescription,
      totalCost: withControls ? [totalCost, [CustomValidators.required, CustomValidators.decimal(2), CustomValidators.maxLength(50)]] : totalCost,
      beneficiaries: withControls ? [beneficiaries, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : beneficiaries,
      goals: withControls ? [goals, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : goals,
    };
  }
  searchFields: ISearchFieldsMap<ProjectNeed> = {
    ...normalSearchFields(['projectName','projectDescription','totalCost','beneficiaries','goals'])
  };
}

export type ProjectNeeds = Partial<ProjectNeed>[];
