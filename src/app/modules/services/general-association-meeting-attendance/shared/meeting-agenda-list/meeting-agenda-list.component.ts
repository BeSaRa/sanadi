import {Component, inject} from '@angular/core';
import {UiCrudListGenericComponent} from "@app/generics/ui-crud-list-generic-component";
import {GeneralAssociationAgenda} from "@models/general-association-meeting-agenda";
import {EmployeeService} from "@services/employee.service";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {ActionIconsEnum} from "@enums/action-icons-enum";
import {IKeyValue} from "@contracts/i-key-value";
import {
  MeetingAgendaPopupComponent
} from "@modules/services/general-association-meeting-attendance/popups/meeting-agenda-popup/meeting-agenda-popup.component";
import {ComponentType} from "@angular/cdk/portal";

@Component({
  selector: 'meeting-agenda-list',
  templateUrl: './meeting-agenda-list.component.html',
  styleUrls: ['./meeting-agenda-list.component.scss']
})
export class MeetingAgendaListComponent extends UiCrudListGenericComponent<GeneralAssociationAgenda> {
  private employeeService = inject(EmployeeService);

  constructor() {
    super();
  }

  isExternalUser: boolean = this.employeeService.isExternalUser();
  displayColumns: string[] = ['index', 'description', 'actions'];
  actions: IMenuItem<GeneralAssociationAgenda>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: GeneralAssociationAgenda) => !this.readonly && this.edit$.next(item),
      show: (item: GeneralAssociationAgenda) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: GeneralAssociationAgenda) => this.confirmDelete$.next(item),
      show: (item: GeneralAssociationAgenda) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: GeneralAssociationAgenda) => this.view$.next(item),
    }
  ];

  _getDialogComponent(): ComponentType<any> {
    return MeetingAgendaPopupComponent;
  }

  _getNewInstance(override: Partial<GeneralAssociationAgenda> | undefined): GeneralAssociationAgenda {
    return new GeneralAssociationAgenda().clone(override ?? {});
  }

  _getDeleteConfirmMessage(record: GeneralAssociationAgenda): string {
    return this.lang.map.msg_confirm_delete_selected;
  }

  getExtraDataForPopup(): IKeyValue {
    return {};
  }
}
