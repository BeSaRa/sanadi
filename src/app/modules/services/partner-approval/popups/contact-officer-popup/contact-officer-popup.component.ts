import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {UiCrudDialogComponentDataContract} from '@app/contracts/ui-crud-dialog-component-data-contract';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {UiCrudDialogGenericComponent} from '@app/generics/ui-crud-dialog-generic-component.directive';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {ContactOfficer} from '@app/models/contact-officer';
import {DialogService} from '@app/services/dialog.service';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-contact-officer-popup',
  templateUrl: './contact-officer-popup.component.html',
  styleUrls: ['./contact-officer-popup.component.scss']
})
export class ContactOfficerPopupComponent extends UiCrudDialogGenericComponent<ContactOfficer> {
  model: ContactOfficer;
  form!: UntypedFormGroup;
  operation: OperationTypes;
  popupTitleKey!: keyof ILanguageKeys;

  _getNewInstance(override?: Partial<ContactOfficer> | undefined): ContactOfficer {
    return new ContactOfficer().clone(override ?? {});
  }

  getPopupHeadingText(): string {
    return '';
  }

  initPopup(): void {
    this.popupTitleKey = 'contact_officers';
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

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<ContactOfficer>,
              public lang: LangService,
              public dialogRef: DialogRef,
              public dialogService: DialogService,
              public fb: UntypedFormBuilder,
              public toast: ToastService,
              private lookupService: LookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
    this.list = data.list;
  }
}
