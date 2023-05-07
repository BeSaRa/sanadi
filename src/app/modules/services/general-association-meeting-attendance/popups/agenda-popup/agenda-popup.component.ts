import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { Agenda } from '@app/models/agenda';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'agenda-popup',
  templateUrl: './agenda-popup.component.html',
  styleUrls: ['./agenda-popup.component.scss']
})
export class AgendaPopupComponent extends UiCrudDialogGenericComponent<Agenda> {
  model: Agenda;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<Agenda>,
  public lang: LangService,
  public dialogRef: DialogRef,
  public dialogService: DialogService,
  public fb: UntypedFormBuilder,
  public toast: ToastService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
  }

  initPopup(): void {
     this.popupTitleKey = 'bank_details';
   }

   _getNewInstance(override?: Partial<Agenda> | undefined): Agenda {
     return new Agenda().clone(override ?? {});
   }

   buildForm(): void {
     this.form = this.fb.group(this.model.getAgendaFields(true));
   }

   afterSave(savedModel: Agenda, originalModel: Agenda): void {
     this.toast.success(this.operation === OperationTypes.CREATE
       ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
     this.dialogRef.close(savedModel);
   }

   beforeSave(model: Agenda, form: UntypedFormGroup): Observable<boolean> | boolean {
     if (this.form.invalid) {
       this.displayRequiredFieldsMessage();
       return false;
     }
     const isDuplicate = this.list.some((x) => x === form.getRawValue());
     if (isDuplicate) {
       this.displayDuplicatedItemMessage();
       return false;
     }
     return true;
   }

   prepareModel(model: Agenda, form: UntypedFormGroup): Observable<Agenda> | Agenda {
     let formValue = form.getRawValue();
     return this._getNewInstance({
       ...this.model,
       ...formValue
     });
   }

   saveFail(error: Error): void {
   }

   destroyPopup(): void {
   }
 
}
