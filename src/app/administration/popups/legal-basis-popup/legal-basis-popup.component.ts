import { Component, inject, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LegalBasis } from '@app/models/legal-basis';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
    selector: 'legal-basis-popup',
    templateUrl: 'legal-basis-popup.component.html',
    styleUrls: ['legal-basis-popup.component.scss']
})
export class LegalBasisPopupComponent extends AdminGenericDialog<LegalBasis> {

    form!: UntypedFormGroup;
    model!: LegalBasis;
    operation: OperationTypes;
    saveVisible = true;


    dialogRef = inject(DialogRef);
    fb = inject(UntypedFormBuilder);
    lang= inject(LangService);
    toast = inject(ToastService);
   
    constructor(
      @Inject(DIALOG_DATA_TOKEN) data: IDialogData<LegalBasis>,) {
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
  
    beforeSave(model: LegalBasis, form: UntypedFormGroup): Observable<boolean> | boolean {
      return form.valid;
    }
  
    prepareModel(model: LegalBasis, form: UntypedFormGroup): Observable<LegalBasis> | LegalBasis {
      return (new LegalBasis()).clone({ ...model, ...form.value });
    }
  
    afterSave(model: LegalBasis, dialogRef: DialogRef): void {
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