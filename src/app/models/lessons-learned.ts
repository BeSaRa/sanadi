import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {LangService} from '@services/lang.service';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {FactoryService} from '@services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';

export class LessonsLearned extends SearchableCloneable<LessonsLearned> {
  lessonsLearned: number[] = [];
  statement!: string;
  lessonsLearnedInfo: AdminResult[] = [];

  // extra properties
  langService: LangService;

  searchFields: ISearchFieldsMap<LessonsLearned> = {
    ...normalSearchFields(['lessonsLearntListString', 'statement'])
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  buildForm(controls?: boolean): any {
    const {lessonsLearned, statement} = this;
    return {
      lessonsLearned: controls ? [lessonsLearned, [CustomValidators.required]] : lessonsLearned,
      statement: controls ? [statement, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : statement,
    };
  }

  get lessonsLearntListString(): string {
    return this.lessonsLearnedInfo?.map(x => x.getName()).join(', ') ?? '';
  }
}
