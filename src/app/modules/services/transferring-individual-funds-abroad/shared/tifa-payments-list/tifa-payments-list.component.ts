import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {UiCrudListGenericComponent} from "@app/generics/ui-crud-list-generic-component";
import {Payment} from "@models/payment";
import {EmployeeService} from "@services/employee.service";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {ActionIconsEnum} from "@enums/action-icons-enum";
import {ComponentType} from "@angular/cdk/portal";
import {IKeyValue} from "@contracts/i-key-value";
import {
  TIFAPaymentPopupComponent
} from "@modules/services/transferring-individual-funds-abroad/popups/TIFA-payment-popup/TIFA-payment-popup.component";

@Component({
  selector: 'tifa-payments-list',
  templateUrl: './tifa-payments-list.component.html',
  styleUrls: ['./tifa-payments-list.component.scss']
})
export class TifaPaymentsListComponent extends UiCrudListGenericComponent<Payment> {
  private employeeService = inject(EmployeeService);
  @Input() isCancel: boolean = false;

  @Output() onEmitTotalCost: EventEmitter<number> = new EventEmitter<number>();

  constructor() {
    super();
  }

  isExternalUser = this.employeeService.isExternalUser();

  displayColumns: string[] = ['paymentNo', 'totalCost', 'dueDate', 'actions'];
  actions: IMenuItem<Payment>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      disabled: () => this.readonly || this.isCancel,
      onClick: (item: Payment) => {
        !this.readonly && this.edit$.next(item);
      },
      show: (_item: Payment) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      disabled: () => this.readonly || this.isCancel,
      onClick: (item: Payment) => {
        !this.readonly && this.confirmDelete$.next(item)
      },
      show: (_item: Payment) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: Payment) => this.view$.next(item),
    }
  ];

  _getDeleteConfirmMessage(record: Payment): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.paymentNo});
  }

  _getDialogComponent(): ComponentType<any> {
    return TIFAPaymentPopupComponent;
  }

  _getNewInstance(override: Partial<Payment> | undefined): Payment {
    return new Payment().clone(override ?? {});
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      isCancel: this.isCancel
    };
  }

  afterReload() {
    const totalCost: number = this.list.reduce((accumulator, x) => {
      return accumulator + (+x.totalCost ?? 0);
    }, 0) ?? 0;
    this.onEmitTotalCost.emit(totalCost);
  }
}
