import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import { ControlValueLabelLangKey } from '@app/types/types';
import { AdminResult } from './admin-result';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { CustomValidators } from '@app/validators/custom-validators';

export class ProjectModelForeignCountriesProject extends SearchableCloneable<ProjectModelForeignCountriesProject> implements IAuditModelProperties<ProjectModelForeignCountriesProject> {
  objectDBId!: number;
  projectName!: string;
  notes!: string;

  getAdminResultByProperty(property: keyof ProjectModelForeignCountriesProject): AdminResult {
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
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      objectDBId:{ langKey: 'component_name', value: this.objectDBId },
      projectName:{ langKey: 'project_name', value: this.projectName },
      notes:{ langKey: 'notes', value: this.notes },
    };
  }
  buildForm(withControls = true): IKeyValue {
    const {
      notes,
      objectDBId
    } = this;
    return {
      objectDBId: withControls? [objectDBId, [CustomValidators.required]] : objectDBId,
      notes: withControls? [notes]: notes
    };
  }
}
