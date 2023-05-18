import { Observable } from 'rxjs';
import {ILanguageKeys} from "@contracts/i-language-keys";

export interface ControlWrapper {
  controlName: string;
  gridClass?: string;
  label?: string | ((item: any) => string);
  langKey: keyof ILanguageKeys,
  load?: any[];
  load$?: Observable<any[]>;
  type: 'text' | 'textarea' | 'dropdown' | 'date' | 'title';
  dropdownValue?: string;
  onChange?: (id: string | number) => void;
  dropdownOptionDisabled?: (optionItem: any) => boolean,
  hide?: boolean
}
