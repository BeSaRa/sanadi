import {Component, Inject} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {AdminGenericDialog} from "@app/generics/admin-generic-dialog";
import {InternalUser} from "@app/models/internal-user";
import {FormBuilder, FormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {IDialogData} from "@app/interfaces/i-dialog-data";
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from "@app/shared/models/dialog-ref";
import {Observable} from 'rxjs';

@Component({
  selector: 'internal-user-popup',
  templateUrl: './internal-user-popup.component.html',
  styleUrls: ['./internal-user-popup.component.scss']
})
export class InternalUserPopupComponent extends AdminGenericDialog<InternalUser> {
  operation: OperationTypes;
  model: InternalUser;
  form!: FormGroup;

  constructor(public dialogRef: DialogRef,
              public lang: LangService,
              public fb: FormBuilder,
              @Inject(DIALOG_DATA_TOKEN) public data: IDialogData<InternalUser>) {
    super();
    this.model = this.data.model;
    this.operation = this.data.operation;
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(model: InternalUser, dialogRef: DialogRef): void {
    console.log('SAVE DONE');
  }

  beforeSave(model: InternalUser, form: FormGroup): boolean | Observable<boolean> {
    console.log('BEFORE SAVE');
    return true;
  }

  prepareModel(model: InternalUser, form: FormGroup): InternalUser | Observable<InternalUser> {
    console.log('MODEL');
    return model;
  }

  saveFail(error: Error): void {
    console.log(error);
  }
}
