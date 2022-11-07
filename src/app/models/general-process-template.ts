import { CustomFormlyFieldConfig, ISelectOption } from '@contracts/custom-formly-field-config';
import { FieldMode } from './../interfaces/custom-formly-field-config';
import { of } from 'rxjs';
import { IMyDateModel } from 'angular-mydatepicker';
import { IKeyValue } from './../interfaces/i-key-value';
import { GeneralProcessTemplateFieldTypes } from './../enums/general-process-template-field-types.enum';
import { Cloneable } from '@app/models/cloneable';
import { CustomValidators } from './../validators/custom-validators';
import { INames } from '@contracts/i-names';
import { LangService } from '@app/services/lang.service';
import { FactoryService } from '@app/services/factory.service';
export class GeneralProcessTemplate extends Cloneable<GeneralProcessTemplate>{
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
  options: IKeyValue[] = [{ id: 1, name: 'No' }, { id: 2, name: 'Yes' }];
  langService: LangService;
  value!: number | string | IMyDateModel;
  constructor() {
    super();
    this.langService = FactoryService.getService('LangService');
  }

  getName(): string {
    return this[(this.langService.map.lang + 'Name') as keyof INames];
  }

  buildForm(controls?: boolean): any {
    const {
      identifyingName,
      arName,
      enName,
      order,
      note,
      required,
      pattern,
      type
    } = this;
    return {
      identifyingName: controls ? [identifyingName, [
        CustomValidators.required,
        CustomValidators.maxLength(300),
        CustomValidators.minLength(3),
        CustomValidators.pattern('ENG_NO_SPACES_ONLY'),
      ]] : identifyingName,
      arName: controls ? [arName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('AR_NUM_ONE_AR')
      ]] : arName,
      enName: controls ? [enName, [
        CustomValidators.required,
        CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH),
        CustomValidators.pattern('ENG_NUM_ONE_ENG')
      ]] : enName,
      required: controls ? [required] : required,
      type: controls ? [type, [CustomValidators.required]] : type,
      order: controls ? [order, [CustomValidators.required]] : order,
      pattern: controls ? [pattern, []] : pattern,
      note: controls ? [note, [CustomValidators.required]] : note,
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
      arName,
      enName,
      mask
    } = this;
    let selectOptions: ISelectOption = {
      bindValue: 'id',
      bindLabel: 'name',
      options: options
    };
    const classes = type == GeneralProcessTemplateFieldTypes.textarea ? 'col-12' : 'col-12 col-md-4'
    const field = {
      id: id,
      key: id,
      type: GeneralProcessTemplateFieldTypes[type],
      label: new ILabel(arName, enName),
      className: classes,
      templateOptions: {
        required: required,
        pattern: pattern,
        rows: 3,
        options: of(options)
      },
      selectOptions,
      mode,
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
