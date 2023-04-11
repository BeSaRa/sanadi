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
export class TemplateField extends Cloneable<TemplateField>{
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
  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
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
