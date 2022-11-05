import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { AdminResult } from '@app/models/admin-result';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { ISearchFieldsMap } from '@app/types/types';

export class Goal extends SearchableCloneable<Goal> {
  goal!: string;


  searchFields: ISearchFieldsMap<Goal> = {
    ...normalSearchFields(['goal'])
  };
  getGoalsFields(control: boolean): any {
    const { goal } = this;
    return {
      goal: control
      ? [
          goal,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
          ],
        ]
      : goal,
    }
  }

}
