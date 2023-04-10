import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {DIALOG_DATA_TOKEN} from '../../tokens/tokens';
import {Localization} from '@app/models/localization';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {FactoryService} from '@app/services/factory.service';
import {ToastService} from '@app/services/toast.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {Observable} from 'rxjs';
import {DialogRef} from '../../models/dialog-ref';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';

@Component({
  selector: 'app-localization-popup',
  templateUrl: './localization-popup.component.html',
  styleUrls: ['./localization-popup.component.scss']
})
export class LocalizationPopupComponent extends AdminGenericDialog<Localization> implements OnInit, OnDestroy {
  form!: UntypedFormGroup;
  model: Localization;
  operation: OperationTypes;
  saveVisible = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Localization>,
              private toast: ToastService,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public lang: LangService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
  }

  initPopup(): void {
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.readonly) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
    if (this.operation === OperationTypes.UPDATE) {
      this.displayFormValidity(this.form);
    }
  }

  beforeSave(model: Localization, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: Localization, form: UntypedFormGroup): Observable<Localization> | Localization {
    return (new Localization()).clone({...model, ...form.value});
  }

  afterSave(model: Localization, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({x: model.localizationKey}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_localization;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_localization;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };
}
