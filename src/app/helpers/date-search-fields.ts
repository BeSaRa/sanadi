import {ISearchFieldsMap} from "@app/types/types";

export function dateSearchFields<T>(fields: (keyof T)[]): ISearchFieldsMap<T> {
  return fields.reduce((fields, field) => {
    return {
      ...fields, [field]: (text: string, model: any): boolean => {
        let date: string;
        try {
          date = new Intl.DateTimeFormat('en', {dateStyle: 'medium'} as unknown as Intl.DateTimeFormatOptions).format(new Date(model[field]));
        } catch (e) {
          date = model[field];
        }
        return date.toLowerCase().includes(text.toLowerCase());
      }
    }
  }, {} as ISearchFieldsMap<T>);
}

