import { CustomValidators } from '@app/validators/custom-validators';
import { CommonUtils } from './../../../../../helpers/common-utils';
import { MeetingPointMemberComment } from './../../../../../models/meeting-point-member-comment';
import { GeneralAssociationMeetingAttendance } from './../../../../../models/general-association-meeting-attendance';
import { MeetingAttendanceSubItem } from './../../../../../models/meeting-attendance-sub-item';
import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UiCrudDialogComponentDataContract } from '@app/contracts/ui-crud-dialog-component-data-contract';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { UiCrudDialogGenericComponent } from '@app/generics/ui-crud-dialog-generic-component.directive';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { Observable } from 'rxjs';

@Component({
  selector: 'meeting-sub-points-popup',
  templateUrl: './meeting-sub-points-popup.component.html',
  styleUrls: ['./meeting-sub-points-popup.component.scss']
})
export class MeetingSubPointsPopupComponent extends UiCrudDialogGenericComponent<MeetingAttendanceSubItem> {
  popupTitleKey: keyof ILanguageKeys;
  generalMeetingsModel: GeneralAssociationMeetingAttendance;
  constructor(@Inject(DIALOG_DATA_TOKEN) data: UiCrudDialogComponentDataContract<MeetingAttendanceSubItem>,
    public dialogRef: DialogRef,
    public fb: UntypedFormBuilder) {
    super();
    this.setInitDialogData(data);
    this.popupTitleKey = 'sub_points';
    this.generalMeetingsModel = data.extras?.generalMeetingsModel;
  }

  initPopup(): void {
  }

  getPopupHeadingText(): string {
    return this.model.enName;
  }

  _getNewInstance(override?: Partial<MeetingAttendanceSubItem> | undefined): MeetingAttendanceSubItem {
    return new MeetingAttendanceSubItem().clone(override ?? {});
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.getFields(true));
    if (this.generalMeetingsModel?.isMemberReviewStep() || ((this.generalMeetingsModel?.isDecisionMakerReviewStep() || this.generalMeetingsModel?.isDecisionMakerReworkStep()) && this.generalMeetingsModel?.isSendToMember) &&
      (this.generalMeetingsModel?.isMemberReviewStep() || (this.generalMeetingsModel?.isDecisionMakerReviewStep() && this.generalMeetingsModel?.isSendToMember))) {
      this.form.get('comment')?.setValidators([CustomValidators.required])
    }
  }

  afterSave(savedModel: MeetingAttendanceSubItem, originalModel: MeetingAttendanceSubItem): void {
    this.toast.success(this.operation === OperationTypes.CREATE
      ? this.lang.map.msg_added_in_list_success : this.lang.map.msg_updated_in_list_success);
    this.dialogRef.close(savedModel);
  }

  _isDuplicate(record1: Partial<MeetingAttendanceSubItem>, record2: Partial<MeetingAttendanceSubItem>): boolean {
    return (record1 as MeetingAttendanceSubItem).isEqual(record2 as MeetingAttendanceSubItem);
  }

  beforeSave(model: MeetingAttendanceSubItem, form: UntypedFormGroup): Observable<boolean> | boolean {
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

  prepareModel(model: MeetingAttendanceSubItem, form: UntypedFormGroup): Observable<MeetingAttendanceSubItem> | MeetingAttendanceSubItem {
    let formValue = form.getRawValue();
    return this._getNewInstance({
      ...this.model,
      respectTerms: ((this.generalMeetingsModel?.isDecisionMakerReviewStep() || this.generalMeetingsModel?.isDecisionMakerReworkStep()) && this.generalMeetingsModel?.isSendToMember && !CommonUtils.isValidValue(model?.comment)) ? this.autoCheckRespectTerms(model.userComments!) : model.respectTerms,
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

  autoCheckRespectTerms(userComments: MeetingPointMemberComment[]) {
    let respectTerms;
    if (userComments.length === 0) {
      respectTerms = 0;
      return respectTerms;
    }
    let respectTermsSum = userComments.reduce((accumulator, comment) => {
      return accumulator + comment.respectTerms;
    }, 0);
    if (respectTermsSum >= (userComments.length / 2)) {
      respectTerms = 1;
    } else {
      respectTerms = 0;
    }
    return respectTerms;
  }

}
