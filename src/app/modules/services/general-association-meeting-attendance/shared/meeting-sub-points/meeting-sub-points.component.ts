import { GeneralAssociationMeetingAttendanceService } from './../../../../../services/general-association-meeting-attendance.service';
import { MeetingAttendanceSubItem } from './../../../../../models/meeting-attendance-sub-item';
import { GeneralAssociationMeetingAttendance } from './../../../../../models/general-association-meeting-attendance';
import { ComponentType } from '@angular/cdk/overlay';
import { ActionIconsEnum } from './../../../../../enums/action-icons-enum';
import { IMenuItem } from './../../../../context-menu/interfaces/i-menu-item';
import { IKeyValue } from './../../../../../interfaces/i-key-value';
import { Component, Input } from '@angular/core';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { MeetingSubPointsPopupComponent } from '../../popups/meeting-sub-points-popup/meeting-sub-points-popup.component';

@Component({
  selector: 'meeting-sub-points',
  templateUrl: './meeting-sub-points.component.html',
  styleUrls: ['./meeting-sub-points.component.scss']
})
export class MeetingSubPointsComponent extends UiCrudListGenericComponent<MeetingAttendanceSubItem> {

  @Input() model?: GeneralAssociationMeetingAttendance;
  constructor(
    public service: GeneralAssociationMeetingAttendanceService
  ) {
    super();
  }

  displayColumns: string[] = ['enName', 'comment', 'actions'];
  actions: IMenuItem<MeetingAttendanceSubItem>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      disabled: (_item: MeetingAttendanceSubItem) => this.readonly,
      onClick: (item: MeetingAttendanceSubItem) => this.edit$.next(item)
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      disabled: (_item: MeetingAttendanceSubItem) => this.readonly,
      show: (item: MeetingAttendanceSubItem) => !!this.canRemoveMeetingPoint(item),
      onClick: (item: MeetingAttendanceSubItem) => this.confirmDelete$.next(item)
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: MeetingAttendanceSubItem) => this.view$.next(item),
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DETAILS,
      label: 'view_members_comments',
      show: () => !!((this.model?.isDecisionMakerReviewStep() || this.model?.isDecisionMakerReworkStep()) && this.model?.isSentToMember()) || !!this.model?.isManagerFinalReviewStep(),
      onClick: (item: MeetingAttendanceSubItem) => {
        this.service.openViewPointMembersCommentsDialog(item.userComments ?? [])
      },
    },
    // activate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_activate',
      displayInGrid: false,
      show: (item) => {
        return !item.selected;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: ActionIconsEnum.STATUS,
      label: 'btn_deactivate',
      displayInGrid: false,
      show: (item) => {
        return !!item.selected;
      }
    }
  ];

  _init() {
  }
  _getNewInstance(override?: Partial<MeetingAttendanceSubItem> | undefined): MeetingAttendanceSubItem {
    return new MeetingAttendanceSubItem().clone(override ?? {});
  }

  _getDialogComponent(): ComponentType<any> {
    return MeetingSubPointsPopupComponent;
  }

  _getDeleteConfirmMessage(record: MeetingAttendanceSubItem): string {
    return this.lang.map.msg_confirm_delete_x.change({ x: record.enName });
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      generalMeetingsModel: this.model
    }
  }

  canRemoveMeetingPoint(point: any) {
    let isSelfMadePoint = +point.addedByDecisionMaker !== 1;
    return this.model?.canRemoveMeetingPoints(isSelfMadePoint);
  }

  canEditMeetingPoints(point: any) {
    let isSelfMadePoint = +point.addedByDecisionMaker !== 1;
    return this.model?.canEditSelfMadeMeetingPoints(isSelfMadePoint);
  }
}
