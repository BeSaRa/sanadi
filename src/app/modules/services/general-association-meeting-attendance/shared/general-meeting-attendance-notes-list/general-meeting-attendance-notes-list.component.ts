import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {UiCrudListGenericComponent} from "@app/generics/ui-crud-list-generic-component";
import {GeneralMeetingAttendanceNote} from "@models/general-meeting-attendance-note";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {IKeyValue} from "@contracts/i-key-value";
import {ComponentType} from "@angular/cdk/portal";
import {
  GeneralMeetingAttendanceNotesPopupComponent
} from "@modules/services/general-association-meeting-attendance/popups/general-meeting-attendance-notes-popup/general-meeting-attendance-notes-popup.component";
import {ActionIconsEnum} from "@enums/action-icons-enum";
import {GeneralAssociationMeetingAttendance} from "@models/general-association-meeting-attendance";
import {EmployeeService} from "@services/employee.service";
import {GeneralAssociationMeetingAttendanceService} from "@services/general-association-meeting-attendance.service";

@Component({
  selector: 'general-meeting-attendance-notes-list',
  templateUrl: './general-meeting-attendance-notes-list.component.html',
  styleUrls: ['./general-meeting-attendance-notes-list.component.scss']
})
export class GeneralMeetingAttendanceNotesListComponent extends UiCrudListGenericComponent<GeneralMeetingAttendanceNote> {
  private employeeService = inject(EmployeeService);

  constructor(private service: GeneralAssociationMeetingAttendanceService) {
    super();
  }

  @Output() onListChange: EventEmitter<GeneralMeetingAttendanceNote[]> =
    new EventEmitter<GeneralMeetingAttendanceNote[]>();

  private _model!: GeneralAssociationMeetingAttendance;
  @Input() set model(value: GeneralAssociationMeetingAttendance) {
    this._model = value;
    this._onModelChange();
  }

  get model(): GeneralAssociationMeetingAttendance {
    return this._model;
  }

  isMemberReview: boolean = false;
  isDecisionMakerRework: boolean = false;
  isManagerFinalReview: boolean = false;
  isDecisionMakerReview: boolean = false;

  displayColumns: string[] = ['index', 'comment', 'actions'];
  actions: IMenuItem<GeneralMeetingAttendanceNote>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: GeneralMeetingAttendanceNote) => !this.readonly && this.edit$.next(item),
      show: (item: GeneralMeetingAttendanceNote) => !this.readonly,
      disabled: () => this.isNotesDisabled
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: GeneralMeetingAttendanceNote) => this.confirmDelete$.next(item),
      show: (item: GeneralMeetingAttendanceNote) => !this.readonly,
      disabled: () => this.isNotesDisabled
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: GeneralMeetingAttendanceNote) => this.view$.next(item),
    }
  ];

  private _onModelChange(): void {
    this.isMemberReview = this.model?.isMemberReviewStep() ?? false;
    this.isDecisionMakerRework = this.model?.isDecisionMakerReworkStep() ?? false;
    this.isManagerFinalReview = this.model?.isManagerFinalReviewStep() ?? false;
    this.isDecisionMakerReview = this.model?.isDecisionMakerReviewStep() ?? false;
  }

  _getDeleteConfirmMessage(record: GeneralMeetingAttendanceNote): string {
    return this.lang.map.msg_confirm_delete_selected;
  }

  _getDialogComponent(): ComponentType<any> {
    return GeneralMeetingAttendanceNotesPopupComponent;
  }

  _getNewInstance(override: Partial<GeneralMeetingAttendanceNote> | undefined): GeneralMeetingAttendanceNote {
    return new GeneralMeetingAttendanceNote().clone(override ?? {
      caseID: this.model.id,
      memberID: this.employeeService.getCurrentUser().generalUserId
    });
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      serviceModel: this.model
    };
  }

  get isNotesDisabled(): boolean {
    return !(this.isMemberReview || ((this.isDecisionMakerReview || this.isDecisionMakerRework) && this.model?.isSendToMember));
  }

  saveGeneralNotes() {
    const meetingGeneralNotes = this.list.map(x => {
      return new GeneralMeetingAttendanceNote().clone(x);
    });
    this.service.addMeetingGeneralNotes(meetingGeneralNotes, this.model?.id)
      .subscribe(result => {
        this.list = result.map(x => {
          return new GeneralMeetingAttendanceNote().clone(x);
        });
        this.dialog.success(this.lang.map.general_notes_saved_successfully);
        this.afterReload();
      });
  }

  saveFinalGeneralNotes() {
    const meetingGeneralNotes = this.list.map(x => {
      return new GeneralMeetingAttendanceNote().clone(x);
    });
    this.service.addFinalMeetingGeneralNotes(meetingGeneralNotes, this.model?.id)
      .subscribe(result => {
        this.list = result.map(x => {
          return new GeneralMeetingAttendanceNote().clone(x);
        });
        this.dialog.success(this.lang.map.general_notes_saved_successfully);
        this.afterReload();
      });
  }

  afterReload() {
    this.onListChange.emit(this.list);
  }
}
