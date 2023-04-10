import { TemplateFieldTypes } from '@app/enums/template-field-types.enum';
import { CustomFormlyFieldConfig, ISelectOption } from '@contracts/custom-formly-field-config';
import { FieldMode } from '../interfaces/custom-formly-field-config';
import { of } from 'rxjs';
import { IMyDateModel } from 'angular-mydatepicker';
import { IKeyValue } from '../interfaces/i-key-value';
import { Cloneable } from '@app/models/cloneable';
import { CustomValidators } from '../validators/custom-validators';
import { INames } from '@contracts/i-names';
import { LangService } from '@app/services/lang.service';
import { FactoryService } from '@app/services/factory.service';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { AuditOperationTypes } from '@app/enums/audit-operation-types';
import { CommonUtils } from '@app/helpers/common-utils';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { ControlValueLabelLangKey } from '@app/types/types';
import { AdminResult } from './admin-result';
import { FormlyTemplate } from './formly-template';
import { IAuditModelProperties } from '@app/interfaces/i-audit-model-properties';
export class TemplateField extends Cloneable<TemplateField> implements IAuditModelProperties<TemplateField>{
  id!: string;
  identifyingName!: string;
  arName!: string;
  enName!: string;
  note!: string;
  order!: number;
  wrappers: string = 'custom-wrapper';
  type!: number;
  pattern!: string;
  mask!: string;
  required!: boolean;
  options: IKeyValue[] = [];
  langService: LangService;
  value!: number | string | IMyDateModel;
  status: number = 1;
  showOnTable: number = 1;
  comparisonValue: any;

  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  getValuesWithLabels(): { [key: string]: ControlValueLabelLangKey } {
    return {
      value: {
        langKey: {} as keyof ILanguageKeys, value: this.value,
        comparisonValue: this.comparisonValue, label: () => this.getName()
      },
    };
  }

  // extra properties
  auditOperation: AuditOperationTypes = AuditOperationTypes.NO_CHANGE;

  // don't delete (used in case audit history)
  getAdminResultByProperty(property: keyof TemplateField): AdminResult {
    let adminResultValue: AdminResult;
    switch (property) {
      default:
        let value: any = this[property];
        if (!CommonUtils.isValidValue(value) || typeof value === 'object') {
          value = '';
        } else {
          if (this.type === TemplateFieldTypes.selectField || this.type === TemplateFieldTypes.yesOrNo) {
            value = this.options.find(x => x.id === value)?.name;
          }
        }
        adminResultValue = AdminResult.createInstance({arName: value as string, enName: value as string});
    }
    return adminResultValue ?? new AdminResult();
  }
  buildForm(): any {
    const {
      identifyingName,
      arName,
      enName,
      order,
      note,
      required,
      pattern,
      type,
      status,
      showOnTable
    } = this;
    return {
      identifyingName: [identifyingName, [
        CustomValidators.required,
        CustomValidators.maxLength(300),
        CustomValidators.minLength(3),
        CustomValidators.pattern('ENG_NO_SPACES_ONLY'),
      ]],
      arName: [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]],
      enName: [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]],
      required: [required],
      type: [type, [CustomValidators.required]],
      order: [order, [CustomValidators.required]],
      pattern: [pattern, []],
      note: [note],
      status: [status],
      showOnTable: [showOnTable]
    }
  }

  buildField(mode: FieldMode = 'init'): CustomFormlyFieldConfig {
    const {
      id,
      type,
      options,
      required,
      pattern,
      wrappers,
      note,
      arName,
      enName,
      mask,
      value,
      status
    } = this;
    let selectOptions: ISelectOption = {
      bindValue: 'id',
      bindLabel: 'name',
      options: options
    };
    const classes = type == TemplateFieldTypes.textarea ? 'col-12' : 'col-12 col-md-4'
    const field = {
      id: id,
      key: id,
      type: TemplateFieldTypes[type],
      label: new ILabel(arName, enName),
      note,
      className: classes,
      templateOptions: {
        required: required && status == CommonStatusEnum.ACTIVATED,
        pattern: pattern,
        rows: 3,
        options: of(options),
        readonly: mode == 'view' || status == CommonStatusEnum.DEACTIVATED,
      },
      selectOptions,
      mode,
      defaultValue: value,
      mask,
      wrappers: [wrappers],
    }
    return field;
  }
}

export class ILabel {
  langService: LangService;
  constructor(private arName: string, private enName: string) {
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }
}
