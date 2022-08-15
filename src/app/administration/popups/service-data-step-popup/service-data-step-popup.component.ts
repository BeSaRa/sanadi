import { Component, Inject } from '@angular/core';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { ServiceDataStep } from '@app/models/service-data-step';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { FormManager } from '@app/models/form-manager';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { DialogService } from '@app/services/dialog.service';
import { ToastService } from '@app/services/toast.service';

@Component({
  selector: 'service-data-step-popup',
  templateUrl: './service-data-step-popup.component.html',
  styleUrls: ['./service-data-step-popup.component.scss']
})
export class ServiceDataStepPopupComponent extends AdminGenericDialog<ServiceDataStep>{
  form!: UntypedFormGroup;
  fm!: FormManager;
  model!: ServiceDataStep;
  operation!: OperationTypes;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<ServiceDataStep>,
              public fb: UntypedFormBuilder,
              public dialogRef: DialogRef,
              public lang: LangService,
              private lookupService: LookupService,
              private dialogService: DialogService,
              private toast: ToastService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  get popupTitle(): string {
    return this.lang.map.edit_step;
  };

  initPopup(): void {

  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    this.fm = new FormManager(this.form, this.lang);
  }

  prepareModel(model: ServiceDataStep, form: UntypedFormGroup): ServiceDataStep | Observable<ServiceDataStep> {
    let newObj = {arName: form.get('arName')?.value, enName: form.get('enName')?.value, stepSLA: form.get('stepSLA')?.value};
    return (new ServiceDataStep()).clone({...model, ...newObj});
  }

  beforeSave(model: ServiceDataStep, form: UntypedFormGroup): boolean | Observable<boolean> {
    return form.valid;
  }

  afterSave(model: ServiceDataStep, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    // @ts-ignore
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.dialogRef.close(this.model);
  }

  saveFail(error: Error): void {

  }

  destroyPopup(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
