import { Observable } from 'rxjs';

export interface ControlWrapper {
  controlName: string;
  label: string;
  load?: any[];
  load$?: Observable<any[]>;
  type: 'text' | 'dropdown' | 'date';
  dropdownValue?: string;
  onChange?: (id: string | number) => void;
}
