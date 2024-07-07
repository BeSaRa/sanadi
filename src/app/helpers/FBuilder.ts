import {IFormRowGroup} from "../interfaces/iform-row-group";
import {IFormFieldOptions} from "../interfaces/i-form-field-options";
import {CustomFormlyFieldConfig} from "../interfaces/custom-formly-field-config";
import {DateUtils} from "./date-utils";
import {DynamicOptionsService} from "../services/dynamic-options.service";
import {FactoryService} from "../services/factory.service";
import {isObservable, Observable, of} from "rxjs";
import {ILanguageKeys} from "../interfaces/i-language-keys";
import { FormlyFieldConfig } from "@ngx-formly/core";


const ROWS_SYMBOL = Symbol('ROWS');
const PREPARED_ROWS_SYMBOL = Symbol('PREPARED_ROWS');

export interface IDynamicForm {
  getDynamicFields(): FormlyFieldConfig[];
}

export enum FieldsPerRow {
  // noinspection JSUnusedGlobalSymbols
  ONE = 1,
  // noinspection JSUnusedGlobalSymbols
  TWO
}

export enum DynamicFieldType {
  TEXT = 'input',
  MASK = 'maskInput',
  DATE = 'dateField',
  SELECT = 'selectField'
}


export interface IModelCriteriaOptions {
  fieldsPerRow: FieldsPerRow
}

export class FBuilder {
  static castFormlyFields(rows: IFormRowGroup[]): FormlyFieldConfig[] {
    return rows.map(row => FBuilder.generateFormRow(row));
  }

  static field(options?: Partial<IFormFieldOptions>): PropertyDecorator {
    return (target: any, fieldName: string | symbol) => {
      if (!target[ROWS_SYMBOL]) {
        target[ROWS_SYMBOL] = [];
      }
      target[ROWS_SYMBOL].push(FBuilder.getValidField(fieldName, options))
    }
  }

  static dynamicForm(options?: IModelCriteriaOptions): ClassDecorator {
    return <T extends Function>(constructor: T): T | void => {
      if (!constructor.prototype[ROWS_SYMBOL]) {
        constructor.prototype[ROWS_SYMBOL] = [];
      }
      options = FBuilder.getValidCriteriaOptions(options);
      const perRow = options.fieldsPerRow;
      const rowNumbers = Math.ceil(constructor.prototype[ROWS_SYMBOL].length / perRow);
      const rows = new Array(rowNumbers);
      constructor.prototype[PREPARED_ROWS_SYMBOL] = rows.fill('row').map((row, index) => (<FormlyFieldConfig>{
        fieldGroupClassName: 'row mb-3 formly-row',
        fieldGroup: <FormlyFieldConfig[]>(constructor.prototype[ROWS_SYMBOL]).slice((index * perRow), ((index * perRow) + perRow))
      }));
      (constructor.prototype as unknown as IDynamicForm).getDynamicFields = function () {
        let rows = (this as unknown as any)[PREPARED_ROWS_SYMBOL] as CustomFormlyFieldConfig[];
        rows = rows.map((row) => {
          row.fieldGroup = row.fieldGroup?.map((field, index, row) => {
            return FBuilder.generateFormField(field as unknown as IFormFieldOptions, {fields: row as unknown as IFormFieldOptions[]})
          });
          return row;
        })
        return rows;
      }
    }
  }

  private static generateFormRow(row: IFormRowGroup): FormlyFieldConfig {
    return {
      fieldGroupClassName: 'row mb-3 formly-row',
      fieldGroup: row.fields?.map(field => FBuilder.generateFormField(field, row)),
    };
  }

  private static generateFormField(field: IFormFieldOptions, row: IFormRowGroup): CustomFormlyFieldConfig {
    if (field.type === DynamicFieldType.DATE) {
      return FBuilder.generateDateField(field, row);
    } else if (field.type === DynamicFieldType.SELECT) {
      return FBuilder.generateSelectField(field, row);
    } else if (field.type === DynamicFieldType.MASK) {
      return FBuilder.generateMaskField(field, row);
    } else {
      return FBuilder.generateDefaultFormField(field, row);
    }
  }

  private static generateDateField(field: IFormFieldOptions, row: IFormRowGroup): CustomFormlyFieldConfig {
    let defaultValue = field.dateOptions?.defaultValue !== null ? new Date() : null;
    if (field.dateOptions?.value && field.dateOptions.operator && defaultValue) {
      let [number, type] = field.dateOptions.value.split(' ');
      let isPlus = field.dateOptions.operator === '+';

      switch (type.toLowerCase()) {
        case 'y':
        case 'year':
          let year = defaultValue?.getFullYear()!;
          defaultValue?.setFullYear(isPlus ? (year + (Number(number))) : (year - (Number(number))));
          break;
        case 'd':
        case 'day':
          let day = defaultValue?.getDate()!;
          defaultValue?.setDate(isPlus ? (day + (Number(number))) : (day - (Number(number))));
          break;
        case 'm':
        case 'month':
          let month = defaultValue?.getMonth()!;
          defaultValue?.setMonth(isPlus ? (month + (Number(number))) : (month - (Number(number))));
          break;
      }

    }
    return {
      key: field.key,
      type: field.type,
      templateOptions: {
        label: field.label,
        required: field.validations?.required,
        rows: field.templateOptions?.rows
      },
      dateOptions: field.dateOptions,
      defaultValue: defaultValue ? DateUtils.changeDateToDatepicker(defaultValue) : null,
      wrappers: [(row.fields && row.fields?.length === 1 ? 'col-md-2-10' : 'col-md-4-8')]
    };
  }

  private static generateSelectField(field: IFormFieldOptions, row: IFormRowGroup): CustomFormlyFieldConfig {
    const dynamicOptionsService: DynamicOptionsService = FactoryService.getService('DynamicOptionsService');
    let options: Observable<any[]>;
    if (field.selectOptions?.loader) {
      options = dynamicOptionsService.load(field.selectOptions?.loader) as Observable<any[]>;
    } else {
      options = isObservable(field.selectOptions?.options!) ? field.selectOptions?.options! : of(field.selectOptions?.options!);
    }
    field.selectOptions!.options = options;
    return {
      key: field.key,
      type: field.type,
      templateOptions: {
        ...field.templateOptions,
        ...{
          label: field.label,
          required: field.validations?.required,
          rows: field.templateOptions?.rows,
          options: options
        }
      },
      selectOptions: field.selectOptions,
      defaultValue: field.selectOptions?.defaultValue,
      wrappers: [(row.fields && row.fields?.length === 1 ? 'col-md-2-10' : 'col-md-4-8')]
    };
  }

  private static generateDefaultFormField(field: IFormFieldOptions, row: IFormRowGroup): CustomFormlyFieldConfig {
    return {
      key: field.key,
      type: field.type,
      templateOptions: {
        ...field.templateOptions,
        ...{
          label: field.label,
          required: field.validations?.required,
          rows: field.templateOptions?.rows
        }
      },
      wrappers: [(row.fields && row.fields?.length === 1 ? 'col-md-2-10' : 'col-md-4-8')]
    };
  }

  private static generateMaskField(field: IFormFieldOptions, row: IFormRowGroup): CustomFormlyFieldConfig {
    return {...FBuilder.generateDefaultFormField(field, row), mask: field.mask};
  }

  private static getValidField(key: string | symbol, options?: Partial<IFormFieldOptions>): IFormFieldOptions {
    return {
      ...options,
      key: options && options.key ? options.key : (key as unknown as string),
      label: options && options.label ? options.label : (key as unknown as keyof ILanguageKeys),
      type: options && options.type ? options.type : DynamicFieldType.TEXT,
      decorator: true
    }
  }

  private static getValidCriteriaOptions(options?: IModelCriteriaOptions): IModelCriteriaOptions {
    return {
      ...options,
      fieldsPerRow: options && options.fieldsPerRow ? options.fieldsPerRow : 2
    }
  }
}
