import {ControlValueLabelLangKey, LabelTextLangKey} from '@app/types/types';
import {IValueDifference} from '@contracts/i-value-difference';
import {AdminResult} from '@models/admin-result';
import {LangService} from '@services/lang.service';
import {FactoryService} from '@services/factory.service';
import {IAdminResultByProperty} from '@contracts/i-admin-result-by-property';
import {CommonUtils} from '@helpers/common-utils';

export class ObjectUtils {
  static getControlValues<M>(controlValuesWithLabels: { [key: string]: ControlValueLabelLangKey }): Partial<M> {
    let values: Partial<M> = {};
    for (const [controlKey, valueObj] of Object.entries(controlValuesWithLabels)) {
      // @ts-ignore
      values[controlKey] = valueObj.value;
    }
    return values;
  }

  static getControlLabels(controlValuesWithLabels: { [key: string]: ControlValueLabelLangKey }): {
    [key: string]: LabelTextLangKey
  } {
    let values: { [key: string]: LabelTextLangKey } = {};
    for (const [controlKey, valueObj] of Object.entries(controlValuesWithLabels)) {
      values[controlKey] = {
        labelText: (valueObj.label && valueObj.label()) ?? undefined,
        langKey: valueObj.langKey
      };
    }
    return values;
  }

  static getControlComparisonValues<M>(controlValuesWithLabels: {
    [key: string]: ControlValueLabelLangKey
  }): Partial<M> {
    let values: Partial<M> = {};
    for (const [controlKey, valueObj] of Object.entries(controlValuesWithLabels)) {
      if ('comparisonValue' in valueObj) {
        // @ts-ignore
        values[controlKey] = valueObj.comparisonValue;
      } else {
        // @ts-ignore
        values[controlKey] = valueObj.value;
      }
    }
    return values;
  }

  static getControlKeys(controlValuesWithLabels: { [key: string]: ControlValueLabelLangKey }): string[] {
    return Object.keys(controlValuesWithLabels);
  }

  static hasValueDifference<M, V>(newVersionDataObject: Partial<M>, oldVersionDataObject: Partial<V>) {
    let hasDifference: boolean = false;
    for (const [key, oldValue] of Object.entries(oldVersionDataObject)) {
      // if key does not exist or value does not match in new version, there is a difference
      if (!(key in newVersionDataObject)) {
        hasDifference = true;
        break;
      }
      const currentValue = newVersionDataObject[key as keyof M];
      // if new and old values are undefined/null, consider no difference
      if (!CommonUtils.isValidValue(oldValue) && !CommonUtils.isValidValue(currentValue)) {
        continue;
      }
      if (oldValue !== currentValue) {
        hasDifference = true;
        break;
      }
    }
    return hasDifference;
  }

  static getValueDifferencesList<M extends IAdminResultByProperty<M>, V extends IAdminResultByProperty<V>>(newVersionFullObject: M,
                                                                                                           oldVersionFullObject: V,
                                                                                                           newVersionDataObject: Partial<M>,
                                                                                                           oldVersionDataObject: Partial<V>,
                                                                                                           labelTextLangKeys: {
                                                                                                             [p: string]: LabelTextLangKey
                                                                                                           }): IValueDifference[] {
    const langService: LangService = FactoryService.getService('LangService');
    let differencesList: IValueDifference[] = [];

    for (const [key, oldValue] of Object.entries(oldVersionDataObject)) {
      if (key in newVersionDataObject) {
        const currentValue = newVersionDataObject[key as keyof M];
        // if new and old values are undefined/null, consider no difference
        if (!CommonUtils.isValidValue(oldValue) && !CommonUtils.isValidValue(currentValue)) {
          continue;
        }
        if (oldValue !== currentValue) {
          const labelInfo = AdminResult.createInstance({});
          if (labelTextLangKeys[key].labelText) {
            labelInfo.arName = labelTextLangKeys[key].labelText!;
            labelInfo.enName = labelTextLangKeys[key].labelText!;
          } else {
            labelInfo.arName = langService.getArabicLocalByKey(labelTextLangKeys[key].langKey) ?? '';
            labelInfo.enName = langService.getEnglishLocalByKey(labelTextLangKeys[key].langKey) ?? ''
          }

          differencesList.push({
            oldValueInfo: oldVersionFullObject.getAdminResultByProperty(key as keyof V),
            newValueInfo: newVersionFullObject.getAdminResultByProperty(key as keyof M),
            labelInfo: labelInfo
          });
        }
      }
    }
    return differencesList;
  }
}
