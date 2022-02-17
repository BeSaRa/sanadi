import {Subject} from 'rxjs';
import {SaveTypes} from '../enums/save-types';
import {FormGroup} from '@angular/forms';
import {OperationTypes} from '../enums/operation-types.enum';
import {OpenFrom} from '@app/enums/open-from.enum';
import {EventEmitter} from "@angular/core";

export interface IESComponent<T> {
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
  onModelChange$: EventEmitter<T | undefined>
  fromWrapperComponent: boolean;

  launch?(): void
}
