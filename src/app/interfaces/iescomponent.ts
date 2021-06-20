import {Subject} from 'rxjs';
import {SaveTypes} from '../enums/save-types';
import {FormGroup} from '@angular/forms';

export interface IESComponent {
  outModel: any;
  save: Subject<SaveTypes>;
  form: FormGroup;
  fromDialog: boolean;
}
