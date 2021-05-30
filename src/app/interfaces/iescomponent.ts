import {Subject} from 'rxjs';
import {SaveTypes} from '../enums/save-types';

export interface IESComponent {
  outModel: any;
  save: Subject<SaveTypes>;
}
