import { MeetingSubPointsComponent } from './../../shared/meeting-sub-points/meeting-sub-points.component';
import { MeetingAttendanceSubItem } from '@app/models/meeting-attendance-sub-item';
import { GeneralAssociationMeetingAttendance } from './../../../../../models/general-association-meeting-attendance';
import { Component, Inject, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { MeetingAttendanceMainItem } from '@app/models/meeting-attendance-main-item';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'meeting-points-popup',
  templateUrl: './meeting-points-popup.component.html',
  styleUrls: ['./meeting-points-popup.component.scss']
})
export class MeetingPointsPopupComponent extends UiCrudDialogGenericComponent<MeetingAttendanceMainItem> {
  popupTitleKey: keyof ILanguageKeys;
  generalMeetingsModel: GeneralAssociationMeetingAttendance;
  @ViewChild('meetingSubPointsListComponent') meetingSubPointsListComponent!: MeetingSubPointsComponent;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<MeetingAttendanceMainItem>,
    public dialogRef: DialogRef,
    public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'main_meeting_points';
    this.generalMeetingsModel = data.extras?.generalMeetingsModel;

  }

  initPopup(): void {
  }

  getPopupHeadingText(): string {
    return this.model.enName;
  }

  _getNewInstance(override?: Partial<MeetingAttendanceMainItem> | undefined): MeetingAttendanceMainItem {
    return new MeetingAttendanceMainItem().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getFields(true));
  }

  afterSave(savedModel: MeetingAttendanceMainItem, originalModel: MeetingAttendanceMainItem): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<MeetingAttendanceMainItem>, record2: Partial<MeetingAttendanceMainItem>): boolean {
    return (record1 as MeetingAttendanceMainItem).isEqual(record2 as MeetingAttendanceMainItem);
  }

  beforeSave(model: MeetingAttendanceMainItem, form: UntypedFormGroup): Observable<boolean> | boolean {
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

  prepareModel(model: MeetingAttendanceMainItem, form: UntypedFormGroup): Observable<MeetingAttendanceMainItem> | MeetingAttendanceMainItem {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      meetingSubItem: model.meetingSubItem ? [...this.meetingSubPointsListComponent.list.map(x => new MeetingAttendanceSubItem().clone(x))] : [new MeetingAttendanceSubItem()],
      ...formValue,
    });
  }

  canEditMeetingPoints() {
    return this.generalMeetingsModel?.canEditSelfMadeMeetingPoints(+this.model.addedByDecisionMaker !== 1);
  }
  saveFail(error: Error): void {
  }

  destroyPopup(): void {
  }
}
