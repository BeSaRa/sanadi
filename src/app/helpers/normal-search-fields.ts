import {ISearchFieldsMap} from "@app/types/types";

export function normalSearchFields<T>(fields: (keyof T)[]): ISearchFieldsMap<T> {
  return fields.reduce((fields, field) => {
    return {...fields, [field]: field as string}
  }, {} as ISearchFieldsMap<T>)
}
