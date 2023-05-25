import {Component, inject, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {OperationTypes} from "@enums/operation-types.enum";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {UiCrudDialogGenericComponent} from "@app/generics/ui-crud-dialog-generic-component.directive";
import {GeneralMeetingAttendanceNote} from "@models/general-meeting-attendance-note";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";
import {UiCrudDialogComponentDataContract} from "@contracts/ui-crud-dialog-component-data-contract";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {Observable} from "rxjs";
import {EmployeeService} from "@services/employee.service";

@Component({
  selector: 'general-meeting-attendance-notes-popup',
  templateUrl: './general-meeting-attendance-notes-popup.component.html',
  styleUrls: ['./general-meeting-attendance-notes-popup.component.scss']
})
export class GeneralMeetingAttendanceNotesPopupComponent extends UiCrudDialogGenericComponent<GeneralMeetingAttendanceNote> {
  private employeeService = inject(EmployeeService);

  popupTitleKey: keyof ILanguageKeys;
  caseId: string;
  hideFullScreen = true;
  memberId: number = this.employeeService.getCurrentUser()?.generalUserId!

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<GeneralMeetingAttendanceNote>,
              public dialogRef: DialogRef,
              public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.caseId = (data.extras && data.extras.serviceModel) ?? '';
    this.popupTitleKey = 'general_notes';
  }

  getPopupHeadingText(): string {
    return '';
  }

  initPopup(): void {
  }

  _getNewInstance(override?: Partial<GeneralMeetingAttendanceNote> | undefined): GeneralMeetingAttendanceNote {
    return new GeneralMeetingAttendanceNote().clone(override ?? {
      caseID: this.caseId,
      memberID: this.memberId
    });
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
  }

  afterSave(savedModel: GeneralMeetingAttendanceNote, originalModel: GeneralMeetingAttendanceNote): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<GeneralMeetingAttendanceNote>, record2: Partial<GeneralMeetingAttendanceNote>): boolean {
    return record1.comment === record2.comment;
  }

  beforeSave(model: GeneralMeetingAttendanceNote, form: UntypedFormGroup): Observable<boolean> | boolean {
    if (this.form.invalid) {
      this.displayRequiredFieldsMessage();
      return false;
    }
    if (this.isDuplicateInList(form.getRawValue())) {
      this.displayDuplicatedItemMessage();
      return false;
    }
    return true;
  }

  prepareModel(model: GeneralMeetingAttendanceNote, form: UntypedFormGroup): Observable<GeneralMeetingAttendanceNote> | GeneralMeetingAttendanceNote {
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
