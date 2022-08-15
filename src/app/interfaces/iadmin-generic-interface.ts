import {Subject} from "rxjs";
import {UntypedFormBuilder} from "@angular/forms";

export interface IAdminGenericInterface<M> {

  save$: Subject<any>;
  destroy$: Subject<any>;
  fb: UntypedFormBuilder;
  model: M;

  listenToSave(): void

  buildForm(): void

}
