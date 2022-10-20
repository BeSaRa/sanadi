import { Observable } from 'rxjs';

export interface ControlWrapper {
  controlName: string;
  gridClass?: string;
  label: string;
  load?: any[];
  load$?: Observable<any[]>;
  type: 'text' | 'textarea' | 'dropdown' | 'date' | 'title';
  dropdownValue?: string;
  onChange?: (id: string | number) => void;
}
