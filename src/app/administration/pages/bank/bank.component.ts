import {Component, OnInit, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {Bank} from '@app/models/bank';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {BankService} from '@app/services/bank.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {TableComponent} from '@app/shared/components/table/table.component';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {exhaustMap, takeUntil} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {of} from 'rxjs';

@Component({
  selector: 'bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss']
})
export class BankComponent extends AdminGenericComponent<Bank, BankService> implements OnInit {
  prepareFilterModel(): Partial<Bank> {
    throw new Error('Method not implemented.');
  }
  usePagination = true
  actions: IMenuItem<Bank>[] = [];
  displayedColumns: string[] = ['arName', 'enName', 'actions'];
  commonStatusEnum = CommonStatusEnum;
  @ViewChild('table') table!: TableComponent;
  sortingCallbacks = {
    statusInfo: (a: Bank, b: Bank, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  constructor(public service: BankService,
              public lang: LangService,
              public dialogService: DialogService,
              private toast: ToastService) {
    super();
  }

  edit(bank: Bank, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(bank);
  }

  delete(event: MouseEvent, model: Bank): void {
    event.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$
      .pipe(
        takeUntil(this.destroy$),
        exhaustMap((click: UserClickOn) => {
          return click === UserClickOn.YES ? model.delete() : of(null);
        }))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
        this.reload$.next(null);
      });
  }

  toggleStatus(model: Bank) {
    model.toggleStatus().update()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // @ts-ignore
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: model.getName()}));
        this.reload$.next(null);
      }, () => {
        // @ts-ignore
        this.toast.error(this.lang.map.msg_status_x_updated_fail.change({x: model.getName()}));
        this.reload$.next(null);
      });
  }
}
