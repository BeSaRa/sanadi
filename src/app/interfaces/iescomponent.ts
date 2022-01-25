import {Subject} from 'rxjs';
import {SaveTypes} from '../enums/save-types';
import {FormGroup} from '@angular/forms';
import {OperationTypes} from '../enums/operation-types.enum';
import {OpenFrom} from '@app/enums/open-from.enum';

export interface IESComponent {
  outModel: any;
  save: Subject<SaveTypes>;
  form: FormGroup;
  fromDialog: boolean;
  readonly: boolean;
  allowEditRecommendations?: boolean;
  operation: OperationTypes;
  openFrom: OpenFrom;
  accordionView: boolean;
  handleReadonly?: any;
  formValidity$?: Subject<any>
}
