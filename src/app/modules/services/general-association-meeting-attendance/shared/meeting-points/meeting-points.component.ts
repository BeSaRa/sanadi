import { GeneralAssociationMeetingAttendance } from './../../../../../models/general-association-meeting-attendance';
import { MeetingPointsPopupComponent } from './../../popups/meeting-points-popup/meeting-points-popup.component';
import { ComponentType } from '@angular/cdk/overlay';
import { ActionIconsEnum } from './../../../../../enums/action-icons-enum';
import { IMenuItem } from './../../../../context-menu/interfaces/i-menu-item';
import { MeetingAttendanceMainItem } from './../../../../../models/meeting-attendance-main-item';
import { IKeyValue } from './../../../../../interfaces/i-key-value';
import { Component, Input } from '@angular/core';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';

@Component({
  selector: 'meeting-points',
  templateUrl: './meeting-points.component.html',
  styleUrls: ['./meeting-points.component.scss']
})
export class MeetingPointsComponent extends UiCrudListGenericComponent<MeetingAttendanceMainItem> {

  @Input() model?: GeneralAssociationMeetingAttendance;
  constructor() {
    super();
  }

  displayColumns: string[] = ['enName', 'actions'];
  actions: IMenuItem<MeetingAttendanceMainItem>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      disabled: this.readonly,
      onClick: (item: MeetingAttendanceMainItem) => this.edit$.next(item)
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      disabled: this.readonly,
      show: (item: MeetingAttendanceMainItem) => !!this.canRemoveMeetingPoint(item),
      onClick: (item: MeetingAttendanceMainItem) => this.confirmDelete$.next(item)
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: MeetingAttendanceMainItem) => this.view$.next(item),
    }
  ];

  _getNewInstance(override?: Partial<MeetingAttendanceMainItem> | undefined): MeetingAttendanceMainItem {
    return new MeetingAttendanceMainItem().clone(override ?? {});
  }
  _afterViewInit(): void {
  }
  _getDialogComponent(): ComponentType<any> {
    return MeetingPointsPopupComponent;
  }

  _getDeleteConfirmMessage(record: MeetingAttendanceMainItem): string {
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

}
