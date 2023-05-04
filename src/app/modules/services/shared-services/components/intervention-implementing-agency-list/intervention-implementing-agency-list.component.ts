import { Component, Input } from '@angular/core';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { ImplementingAgency } from '@models/implementing-agency';
import { DialogService } from '@services/dialog.service';
import { IMenuItem } from '@modules/context-menu/interfaces/i-menu-item';
import { ActionIconsEnum } from '@enums/action-icons-enum';
import { SortEvent } from '@contracts/sort-event';
import { CommonUtils } from '@helpers/common-utils';
import { InterventionImplementingAgencyListPopupComponent } from '../../popups/intervention-implementing-agency-list-popup/intervention-implementing-agency-list-popup.component';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';

@Component({
  selector: 'intervention-implementing-agency-list',
  templateUrl: './intervention-implementing-agency-list.component.html',
  styleUrls: ['./intervention-implementing-agency-list.component.scss']
})
export class InterventionImplementingAgencyListComponent extends UiCrudListGenericComponent<ImplementingAgency> {
  actions: IMenuItem<ImplementingAgency>[] =  [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ImplementingAgency) => this.edit$.next(item),
      show: (_item: ImplementingAgency) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ImplementingAgency) => this.confirmDelete$.next(item),
      show: (_item: ImplementingAgency) => !this.readonly
    },
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ImplementingAgency) => this.view$.next(item),
      show: (_item: ImplementingAgency) => this.readonly
    }
  ];
  displayColumns: string[] = ['implementingAgencyType', 'implementingAgency', 'actions'];
  _getNewInstance(override?: Partial<ImplementingAgency> | undefined): ImplementingAgency {
    return new ImplementingAgency().clone(override ?? {});
  }
  _getDialogComponent(): ComponentType<any> {
    return InterventionImplementingAgencyListPopupComponent;
  }
  _getDeleteConfirmMessage(record: ImplementingAgency): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.implementingAgency});
  }
  getExtraDataForPopup(): IKeyValue {
    return {executionCountry : this.executionCountry}
  }

  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
    super();
  }

  @Input() executionCountry!: number;

  sortingCallbacks = {
    implementingAgency: (a: ImplementingAgency, b: ImplementingAgency, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.implementingAgencyInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.implementingAgencyInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    implementingAgencyType: (a: ImplementingAgency, b: ImplementingAgency, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.agencyTypeInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.agencyTypeInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

}
