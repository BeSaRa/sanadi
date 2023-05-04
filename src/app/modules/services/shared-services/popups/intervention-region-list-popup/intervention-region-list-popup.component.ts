import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { InterventionRegion } from '@app/models/intervention-region';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-intervention-region-list-popup',
  templateUrl: './intervention-region-list-popup.component.html',
  styleUrls: ['./intervention-region-list-popup.component.scss']
})
export class InterventionRegionListPopupComponent extends UiCrudDialogGenericComponent<InterventionRegion>{
  model: InterventionRegion;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;
  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<InterventionRegion>,
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

  _getNewInstance(override?: Partial<InterventionRegion> | undefined): InterventionRegion {
    return new InterventionRegion().clone(override ?? {});
  }
  initPopup(): void {
    this.popupTitleKey = 'intervention_areas';
  }
  destroyPopup(): void {
  }
  afterSave(savedModel: InterventionRegion, originalModel: InterventionRegion): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }
  beforeSave(model: InterventionRegion, form: UntypedFormGroup): boolean | Observable<boolean> {
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
  prepareModel(model: InterventionRegion, form: UntypedFormGroup): InterventionRegion | Observable<InterventionRegion> {
    let formValue = form.getRawValue();
     return this._getNewInstance({
       ...this.model,
       ...formValue
     });
  }
  saveFail(error: Error): void {
    throw new Error(error.message);
  }
  buildForm(): void {
    this.form = this.fb.group(this.model.getRegionFields(true));
  }
}
