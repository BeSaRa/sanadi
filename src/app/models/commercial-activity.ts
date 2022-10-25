import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
export class CommercialActivity extends SearchableCloneable<CommercialActivity> {
  activityName!: string;
  details!: string;

  searchFields: ISearchFieldsMap<CommercialActivity> = {
    ...normalSearchFields(['activityName', 'details']),
  };

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
