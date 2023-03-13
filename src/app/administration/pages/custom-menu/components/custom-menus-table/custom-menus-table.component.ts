import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { CommonStatusEnum } from '@app/enums/common-status.enum';
import { CommonUtils } from '@app/helpers/common-utils';
import { IGridAction } from '@app/interfaces/i-grid-action';
import { PageEvent } from '@app/interfaces/page-event';
import { SortEvent } from '@app/interfaces/sort-event';
import { CustomMenu } from '@app/models/custom-menu';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { ToastService } from '@app/services/toast.service';
import { LangService } from '@services/lang.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-custom-menus-table',
  templateUrl: './custom-menus-table.component.html',
  styleUrls: ['./custom-menus-table.component.scss']
})
export class CustomMenusTableComponent implements OnInit, OnDestroy {

  filterControl: UntypedFormControl = new UntypedFormControl('');
  @Input() data: CustomMenu[] = [];
  @Input() displayedColumns!: string[];
  @Input() reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  @Input() add$: Subject<any> = new Subject<any>();
  @Input() readonly: boolean = false;
  @Input() actions!: IMenuItem<any>[];
  @Input() bulkActionsList!: IGridAction[];
  @Input() lang!: LangService;
  @Input() toast!: ToastService;
  @Input() parent?: CustomMenu;
  @Input() pageChange!: ($event: PageEvent)=> void;
  @Input() count!: number;

  commonStatusEnum = CommonStatusEnum;
  destroy$: Subject<any> = new Subject<any>();
  sortingCallbacks = {
    menuType: (a: CustomMenu, b: CustomMenu, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.menuTypeInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.menuTypeInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
    statusInfo: (a: CustomMenu, b: CustomMenu, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  };

  toggleStatus(model: CustomMenu) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_status_x_updated_success.change({x: model.getName()}));
        this.reload$.next(null);
      }, () => {
        // this.toast.error(this.lang.map.msg_status_x_updated_fail.change({x: model.getName()}));
        this.reload$.next(null);
      });
  }
  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
