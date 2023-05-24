import {Component, Inject} from '@angular/core';
import {UiCrudDialogGenericComponent} from "@app/generics/ui-crud-dialog-generic-component.directive";
import {GeneralAssociationAgenda} from "@models/general-association-meeting-agenda";
import {UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {OperationTypes} from "@enums/operation-types.enum";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {UiCrudDialogComponentDataContract} from "@contracts/ui-crud-dialog-component-data-contract";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {Observable} from "rxjs";

@Component({
  selector: 'meeting-agenda-popup',
  templateUrl: './meeting-agenda-popup.component.html',
  styleUrls: ['./meeting-agenda-popup.component.scss']
})
export class MeetingAgendaPopupComponent extends UiCrudDialogGenericComponent<GeneralAssociationAgenda> {
  popupTitleKey: keyof ILanguageKeys;
  hideFullScreen = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<GeneralAssociationAgenda>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'meeting_agenda';
  }

  getPopupHeadingText(): string {
    return '';
  }

  initPopup(): void {
  }

  _getNewInstance(override?: Partial<GeneralAssociationAgenda> | undefined): GeneralAssociationAgenda {
    return new GeneralAssociationAgenda().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(savedModel: GeneralAssociationAgenda, originalModel: GeneralAssociationAgenda): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  private isDuplicate(formValue: any): boolean {
    if (this.operation === OperationTypes.CREATE) {
      return this.list.some((item) => item.description === formValue.description);
    }
    if (this.operation === OperationTypes.UPDATE) {
      return this.list.some((item: GeneralAssociationAgenda, index: number) => {
        return index !== this.listIndex && item.description === formValue.description;
      });
    }
    return false;
  }

  beforeSave(model: GeneralAssociationAgenda, form: UntypedFormGroup): Observable<boolean> | boolean {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    if (this.isDuplicate(form.getRawValue())) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: GeneralAssociationAgenda, form: UntypedFormGroup): Observable<GeneralAssociationAgenda> | GeneralAssociationAgenda {
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
