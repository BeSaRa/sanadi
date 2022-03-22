import {ISearchFieldsMap, OnlyInfoProperty} from "@app/types/types";

export function infoSearchFields<T>(fields: (keyof OnlyInfoProperty<T>)[]): ISearchFieldsMap<T> {
  return fields.reduce((fields, field) => {
    return {
      ...fields, [field]: (text: string, model: any): boolean => {
        let value;
        try {
          value = (model[field].getName() as unknown as string);
        } catch (e) {
          console.log(`need to cast${field} : `, e);
          value = '';
        }
        return value.toLowerCase().includes(text.toLowerCase());
      }
    }
  }, {} as ISearchFieldsMap<T>)
}
