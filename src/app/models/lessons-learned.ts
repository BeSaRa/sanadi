import {ControlValueLabelLangKey} from './../types/types';
import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {LangService} from '@services/lang.service';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {FactoryService} from '@services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {ObjectUtils} from '@app/helpers/object-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';

export class LessonsLearned extends SearchableCloneable<LessonsLearned> implements IAuditModelProperties<LessonsLearned> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  lessonsLearned: number[] = [];
  statement!: string;
  lessonsLearnedInfo: AdminResult[] = [];
  itemId!:string;

  // extra properties
  langService: LangService;

  searchFields: ISearchFieldsMap<LessonsLearned> = {
    ...normalSearchFields(['lessonsLearntListString', 'statement'])
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getAdminResultByProperty(property: keyof LessonsLearned): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'lessonsLearned':
        adminResultValue = new AdminResult();
        this.lessonsLearnedInfo.forEach(bp => {
          adminResultValue.arName += bp.arName;
          adminResultValue.enName += bp.enName;
        })
        break;
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      lessonsLearned: {langKey: 'lessons_learnt', value: this.lessonsLearned},
      statement: {langKey: 'statement', value: this.statement},
    };
  }

  buildForm(controls?: boolean): any {
    const values = ObjectUtils.getControlValues<LessonsLearned>(this.getValuesWithLabels())

    return {
      lessonsLearned: controls ? [values.lessonsLearned, [CustomValidators.required]] : values.lessonsLearned,
      statement: controls ? [values.statement, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.statement,
    };
  }

  get lessonsLearntListString(): string {
    return this.lessonsLearnedInfo?.map(x => x.getName()).join(', ') ?? '';
  }

  isEqual(record: LessonsLearned): boolean {
    return this.statement === record.statement
      && (this.lessonsLearned ?? []).sort().join(',') === (record.lessonsLearned ?? []).sort().join('');
  }
}
