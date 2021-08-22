import {Subject} from "rxjs";
import {FormBuilder} from "@angular/forms";

export interface IAdminGenericInterface<M> {

  save$: Subject<any>;
  destroy$: Subject<any>;
  fb: FormBuilder;
  model: M;

  listenToSave(): void

  buildForm(): void

}
