import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ContactOfficer} from '@app/models/contact-officer';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-contact-officer-popup',
  templateUrl: './contact-officer-popup.component.html',
  styleUrls: ['./contact-officer-popup.component.scss']
})
export class ContactOfficerPopupComponent extends UiCrudDialogGenericComponent<ContactOfficer> {
  popupTitleKey: keyof ILanguageKeys;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ContactOfficer>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'contact_officers';
  }

  _getNewInstance(override?: Partial<ContactOfficer> | undefined): ContactOfficer {
    return new ContactOfficer().clone(override ?? {});
  }

  getPopupHeadingText(): string {
    return '';
  }

  initPopup(): void {
  }

  destroyPopup(): void {
  }

  afterSave(savedModel: ContactOfficer, originalModel: ContactOfficer): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  beforeSave(model: ContactOfficer, form: UntypedFormGroup): boolean | Observable<boolean> {
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

  prepareModel(model: ContactOfficer, form: UntypedFormGroup): ContactOfficer | Observable<ContactOfficer> {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      ...formValue,
    });
  }

  saveFail(error: Error): void {
    throw new Error(error.message);
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getContactOfficerFields(true));
  }
}
