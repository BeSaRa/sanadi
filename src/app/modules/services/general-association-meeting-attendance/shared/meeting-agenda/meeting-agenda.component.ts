import { ComponentType } from '@angular/cdk/portal';
import { Component, Input } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { Agenda } from '@app/models/agenda';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { AgendaPopupComponent } from '../../popups/agenda-popup/agenda-popup.component';

@Component({
  selector: 'meeting-agenda',
  templateUrl: './meeting-agenda.component.html',
  styleUrls: ['./meeting-agenda.component.scss']
})
export class MeetingAgendaComponent extends UiCrudListGenericComponent<Agenda>{
  @Input()isExternalUser!:boolean;
  displayColumns: string[] = ['index', 'description', 'actions'];
  
  _getDialogComponent(): ComponentType<any> {
    return AgendaPopupComponent;
  }

  _getNewInstance(override: Partial<Agenda> | undefined): Agenda {
    return new Agenda().clone(override ?? {});
  }

  _getDeleteConfirmMessage(record: Agenda): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.description});
  }

  getExtraDataForPopup(): IKeyValue {
    return {
    };
  }
  
  @Input() agendaItems: Agenda[] = [];
  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
  super();
  }
  actions: IMenuItem<Agenda>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: Agenda) => !this.readonly && this.edit$.next(item),
      show: (_item: Agenda) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: Agenda) => this.confirmDelete$.next(item),
      show: (_item: Agenda) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: Agenda) => this.view$.next(item),
    }
  ];

}
