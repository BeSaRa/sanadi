import { CustomValidators } from '@app/validators/custom-validators';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { AdminResult } from '@app/models/admin-result';
import { infoSearchFields } from '@app/helpers/info-search-fields';
import { normalSearchFields } from '@app/helpers/normal-search-fields';
import { ISearchFieldsMap } from '@app/types/types';

export class Goal extends SearchableCloneable<Goal> {
  goals!: string;
  domain!: number;
  mainDACCategory!: number | null;
  mainDACCategoryInfo!: AdminResult;
  mainUNOCHACategory!: number | null;
  mainUNOCHACategoryInfo!: AdminResult;
  domainInfo!: AdminResult;

  searchFields: ISearchFieldsMap<Goal> = {
    ...infoSearchFields(['domainInfo', 'mainDACCategoryInfo', 'mainUNOCHACategoryInfo']),
  };
  getGoalsFields(control: boolean): any {
    const { goals } = this;
    return {
      goals: control
      ? [
          goals,
          [
            CustomValidators.required,
            CustomValidators.maxLength(
              CustomValidators.defaultLengths.ENGLISH_NAME_MAX
            ),
          ],
        ]
      : goals,
    }
  }
  getDomainsFields(control: boolean): any {
    const {
      domain,
      mainDACCategory,
      mainUNOCHACategory,

    } = this;

    return {
      domain: control ? [domain, CustomValidators.required] : domain,
      mainDACCategory: control ? [mainDACCategory] : mainDACCategory,
      mainUNOCHACategory: control ? [mainUNOCHACategory] : mainUNOCHACategory,

    };
  }

}
