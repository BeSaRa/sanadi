import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import {AuditOperationTypes} from '@enums/audit-operation-types';
import {AdminResult} from '@models/admin-result';
import {IAuditModelProperties} from '@contracts/i-audit-model-properties';
export class CommercialActivity extends SearchableCloneable<CommercialActivity> implements IAuditModelProperties<CommercialActivity>{
  activityName!: string;
  details!: string;

  searchFields: ISearchFieldsMap<CommercialActivity> = {
    ...normalSearchFields(['activityName', 'details']),
  };

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  getAdminResultByProperty(property: keyof CommercialActivity): AdminResult {
    return AdminResult.createInstance({});
  }

  constructor() {
    super();
  }

  buildForm(controls: boolean = false) {
    const { activityName, details } = this;
    return {
      activityName: controls
        ? [
            activityName,
            [
              CustomValidators.required,
              CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.ENGLISH_NAME_MAX
              ),
            ],
          ]
        : activityName,
      details: controls
        ? [
            details,
            [
              CustomValidators.maxLength(
                CustomValidators.defaultLengths.EXPLANATIONS
              ),
            ],
          ]
        : details,
    };
  }
}
