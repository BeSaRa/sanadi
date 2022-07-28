import {Component, Inject} from '@angular/core';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {ChecklistItem} from '@app/models/checklist-item';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {FormManager} from '@app/models/form-manager';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {Observable} from 'rxjs';
import {CustomValidators} from '@app/validators/custom-validators';

@Component({
  selector: 'checklist-item-popup',
  templateUrl: './checklist-item-popup.component.html',
  styleUrls: ['./checklist-item-popup.component.scss']
})
export class ChecklistItemPopupComponent extends AdminGenericDialog<ChecklistItem> {
  form!: FormGroup;
  model!: ChecklistItem;
  operation!: OperationTypes;
  stepId!: number;
  saveVisible = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<ChecklistItem>,
              public fb: FormBuilder,
              public dialogRef: DialogRef,
              public lang: LangService,
              private lookupService: LookupService,
              private dialogService: DialogService,
              private toast: ToastService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.stepId = data.stepId;
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.lang.map.add_checklist_item : this.lang.map.edit_checklist_item;
  };

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

  prepareModel(model: ChecklistItem, form: FormGroup): ChecklistItem | Observable<ChecklistItem> {
    let item = (new ChecklistItem()).clone({...model, ...form.value});
    item.stepId = this.stepId;
    return item;
  }

  beforeSave(model: ChecklistItem, form: FormGroup): boolean | Observable<boolean> {
    return form.valid;
  }

  afterSave(model: ChecklistItem, dialogRef: DialogRef): void {
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
