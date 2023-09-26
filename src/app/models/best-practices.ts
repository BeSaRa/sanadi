import {ControlValueLabelLangKey} from './../types/types';
import {AdminResult} from '@app/models/admin-result';
import {SearchableCloneable} from '@app/models/searchable-cloneable';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';
import {ISearchFieldsMap} from '@app/types/types';
import {normalSearchFields} from '@helpers/normal-search-fields';
import {CustomValidators} from '@app/validators/custom-validators';
import {AuditOperationTypes} from '@app/enums/audit-operation-types';
import {CommonUtils} from '@app/helpers/common-utils';
import {ObjectUtils} from '@app/helpers/object-utils';
import {IAuditModelProperties} from '@app/interfaces/i-audit-model-properties';

export class BestPractices extends SearchableCloneable<BestPractices> implements IAuditModelProperties<BestPractices> {
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;
  bestPractices: number[] = [];
  statement!: string;
  bestPracticesInfo: AdminResult[] = [];
  itemId!:string;


  // extra properties
  langService: LangService;

  searchFields: ISearchFieldsMap<BestPractices> = {
    ...normalSearchFields(['bestPracticesListString', 'statement'])
  };

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getAdminResultByProperty(property: keyof BestPractices): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      case 'bestPractices':
        adminResultValue = new AdminResult();
        this.bestPracticesInfo.forEach(bp => {
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
      bestPractices: {langKey: 'best_practices', value: this.bestPractices},
      statement: {langKey: 'statement', value: this.statement},
    };
  }

  buildForm(controls?: boolean): any {
    const values = ObjectUtils.getControlValues<BestPractices>(this.getValuesWithLabels())

    return {
      bestPractices: controls ? [values.bestPractices, [CustomValidators.required]] : values.bestPractices,
      statement: controls ? [values.statement, [CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]] : values.statement,
    }
  }

  get bestPracticesListString(): string {
    return this.bestPracticesInfo?.map(x => x.getName()).join(', ') ?? '';
  }

  isEqual(record: BestPractices): boolean {
    return this.statement === record.statement
      && (this.bestPractices ?? []).sort().join(',') === (record.bestPractices ?? []).sort().join(',');
  }
}
