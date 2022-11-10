import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {CustomValidators} from '@app/validators/custom-validators';

export class BestPractices extends SearchableCloneable<BestPractices> {
  bestPractices: number[] = [];
  statement!: string;
  bestPracticesInfo: AdminResult[] = [];

  // extra properties
  langService: LangService;

  searchFields: ISearchFieldsMap<BestPractices> = {
    ...normalSearchFields(['bestPracticesListString', 'statement'])
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  buildForm(controls?: boolean): any {
    const {bestPractices, statement} = this;
    return {
      bestPractices: controls ? [bestPractices, [CustomValidators.required]] : bestPractices,
      statement: controls ? [statement, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : statement,
    }
  }

  get bestPracticesListString(): string {
    return this.bestPracticesInfo?.map(x => x.getName()).join(', ') ?? '';
  }
}
