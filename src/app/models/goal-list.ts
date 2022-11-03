import { infoSearchFields } from '@app/helpers/info-search-fields';
import { SearchableCloneable } from '@app/models/searchable-cloneable';
import { ISearchFieldsMap } from '@app/types/types';
import { CustomValidators } from '@app/validators/custom-validators';
import { AdminResult } from './admin-result';
import { Goal } from './goal';
export class GoalList extends SearchableCloneable<GoalList> {
  domain!: number;
  mainDACCategory!: number | null;
  mainDACCategoryInfo!: AdminResult;
  mainUNOCHACategory!: number | null;
  mainUNOCHACategoryInfo!: AdminResult;
  domainInfo!: AdminResult;

  searchFields: ISearchFieldsMap<GoalList> = {
    ...infoSearchFields(['domainInfo', 'mainDACCategoryInfo', 'mainUNOCHACategoryInfo']),
  };

  buildForm(control: boolean): any {
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
