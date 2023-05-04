import { ComponentType } from '@angular/cdk/portal';
import { Component, Input, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { TransferFundsCharityPurpose } from '@app/models/transfer-funds-charity-purpose';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@app/services/dialog.service';
import { EmployeeService } from '@app/services/employee.service';
import { LangService } from '@app/services/lang.service';
import { ToastService } from '@app/services/toast.service';
import { TIFAPurposePopupComponent } from '../../../popups/TIFB-purpose-popup/TIFA-purpose-popup.component';

@Component({
  selector: 'transfer-purpose',
  templateUrl: './transfer-purpose.component.html',
  styleUrls: ['./transfer-purpose.component.scss']
})
export class TransferPurposeComponent extends UiCrudListGenericComponent<TransferFundsCharityPurpose> {
  @Input() isCancel!:boolean;
  actions: IMenuItem<TransferFundsCharityPurpose>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: TransferFundsCharityPurpose) => !this.readonly && this.edit$.next(item),
      show: (_item: TransferFundsCharityPurpose) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: TransferFundsCharityPurpose) => this.confirmDelete$.next(item),
      show: (_item: TransferFundsCharityPurpose) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: TransferFundsCharityPurpose) => this.view$.next(item),
    }
  ];
  isExternalUser!:boolean;
  displayColumns: string[] = ['projectName', 'projectType', 'domain', 'totalCost', 'beneficiaryCountry', 'executionCountry', 'actions'];

  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService,
    private employeeService:EmployeeService) {
  super();
  }
  _getDialogComponent(): ComponentType<any> {
    return TIFAPurposePopupComponent;
  }

  _getNewInstance(override: Partial<TransferFundsCharityPurpose> | undefined): TransferFundsCharityPurpose {
    return new TransferFundsCharityPurpose().clone(override ?? {});
  }

  _getDeleteConfirmMessage(record: TransferFundsCharityPurpose): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.projectName});
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      isCancel:this.isCancel
    };
  }
  protected _init(): void {
    this.isExternalUser = this.employeeService.isExternalUser();
  }

}
