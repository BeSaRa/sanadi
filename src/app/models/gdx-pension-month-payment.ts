import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';

export class GdxPensionMonthPayment extends SearchableCloneable<GdxPensionMonthPayment> {
  payMonth!: number;
  payYear!: number;
  payValue!: number;
  payAccountNum!: string;

  searchFields: ISearchFieldsMap<GdxPensionMonthPayment> = {
    ...normalSearchFields(['payAccountNum', 'payYear', 'payMonth', 'payValue'])
  };
}
