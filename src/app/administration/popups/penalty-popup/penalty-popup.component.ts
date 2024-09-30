import { Component, inject, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { Penalty } from '@app/models/penalty';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
    selector: 'penalty-popup',
    templateUrl: 'penalty-popup.component.html',
    styleUrls: ['penalty-popup.component.scss']
})
export class PenaltyPopupComponent extends AdminGenericDialog<Penalty> {

    form!: UntypedFormGroup;
    model!: Penalty;
    operation: OperationTypes;
    saveVisible = true;


    dialogRef = inject(DialogRef);
    fb = inject(UntypedFormBuilder);
    lang= inject(LangService);
    toast = inject(ToastService);
   
    constructor(
      @Inject(DIALOG_DATA_TOKEN) data: IDialogData<Penalty>,) {
      super();
      this.model = data.model;
      this.operation = data.operation;
    }
  
    initPopup(): void {
     
    }
  
    buildForm(): void {
      this.form = this.fb.group(this.model.buildForm(true));
      if (this.operation === OperationTypes.VIEW) {
        this.form.disable();
        this.saveVisible = false;
        this.validateFieldsVisible = false;
      }
    }
  
    beforeSave(model: Penalty, form: UntypedFormGroup): Observable<boolean> | boolean {
      return form.valid;
    }
  
    prepareModel(model: Penalty, form: UntypedFormGroup): Observable<Penalty> | Penalty {
      return (new Penalty()).clone({ ...model, ...form.value });
    }
  
    afterSave(model: Penalty, dialogRef: DialogRef): void {
      const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
      this.toast.success(message.change({ x: model.getName() }));
      this.model = model;
      this.operation = OperationTypes.UPDATE;
      dialogRef.close(model);
    }
  
    saveFail(error: Error): void {
    }
  
    get popupTitle(): string {
     if (this.operation === OperationTypes.UPDATE) {
        return this.lang.map.lbl_edit;
      } else if (this.operation === OperationTypes.VIEW) {
        return this.lang.map.view;
      }
      return '';
    };
  
    destroyPopup(): void {
    }
  
  }