import {Subject} from 'rxjs';
import {SaveTypes} from '../enums/save-types';
import {FormGroup} from '@angular/forms';
import {OperationTypes} from '../enums/operation-types.enum';

export interface IESComponent {
  outModel: any;
  save: Subject<SaveTypes>;
  form: FormGroup;
  fromDialog: boolean;
  readonly: boolean;
  allowEditRecommendations?: boolean;
  operation: OperationTypes;
}
