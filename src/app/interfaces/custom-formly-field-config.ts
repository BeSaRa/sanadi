import {FormlyFieldConfig} from '@ngx-formly/core/lib/components/formly.field.config';
import {Observable} from 'rxjs';

export interface CustomFormlyFieldConfig extends FormlyFieldConfig {
  dateOptions?: {
    defaultValue?: 'now' | null,
    operator?: string | null,
    value?: string
  }
  selectOptions?: {
    defaultValue?: any,
    options?: any[] | Observable<any[]>,
    loader?: string,
    loadFrom?: string,
    bindValue?: string,
    bindLabel?: string
  }
  mask?: string
}
