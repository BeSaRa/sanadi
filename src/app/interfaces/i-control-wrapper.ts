import { Observable } from 'rxjs';

export interface ControlWrapper {
  controlName: string;
  label: string;
  load?: any[];
  load$?: Observable<any[]>;
}
