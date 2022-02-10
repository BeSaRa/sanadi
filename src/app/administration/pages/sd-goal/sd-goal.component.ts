import {Component, OnInit, ViewChild} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {SDGoal} from '@app/models/sdgoal';
import {SDGoalService} from '@app/services/sdgoal.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {SharedService} from '@app/services/shared.service';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {catchError, exhaustMap, map, switchMap, takeUntil} from 'rxjs/operators';
import {of} from 'rxjs';
import {ToastService} from '@app/services/toast.service';
import {TableComponent} from '@app/shared/components/table/table.component';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';

@Component({
  selector: 'sd-goal',
  templateUrl: './sd-goal.component.html',
  styleUrls: ['./sd-goal.component.scss']
})
export class SdGoalComponent extends AdminGenericComponent<SDGoal, SDGoalService> implements OnInit {
  actions: IMenuItem<SDGoal>[] = [];
  displayedColumns = ['rowSelection', 'arName', 'enName', 'status', 'childCount', 'actions'];

  actionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];
  commonStatusEnum = CommonStatusEnum;

  @ViewChild('table') table!: TableComponent;

  sortingCallbacks = {
    statusInfo: (a: SDGoal, b: SDGoal, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  constructor(public service: SDGoalService,
              private sharedService: SharedService,
              public lang: LangService,
              public dialogService: DialogService,
              private toast: ToastService) {
    super();
  }

  ngOnInit() {
    this.listenToReload();
    super.listenToAdd();
    this.listenToEditSubSdGoal();
  }

  get selectedRecords(): SDGoal[] {
    return this.table.selection.selected;
  }

  listenToEditSubSdGoal(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => this.service.subSdGoalEditDialog(model, model.parentId).onAfterClose$))
      .subscribe(() => this.reload$.next(null));
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        const load = this.useCompositeToLoad ? this.service.loadComposite() : this.service.load();
        return load.pipe(
          map(list => {
              list.map(element => {
              element.childCount = list.filter(e => e.parentId == element.id).length;
            });
            console.log('subs', list);
            return list;
          }),
          map(list => {
            return list.filter(model => {
              return model.status !== CommonStatusEnum.RETIRED && model.parentId == null;
            });
          }),
          catchError(_ => of([]))
        );
      }))
      .subscribe((list: SDGoal[]) => {
        this.models = list;
        this.table.selection.clear();
      })
  }

  edit(sdGoal: SDGoal, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(sdGoal);
  }

  delete(event: MouseEvent, model: SDGoal): void {
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

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.lang.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });

          this.service.deleteBulk(ids)
            .pipe(
              takeUntil(this.destroy$),
              exhaustMap((response) => {
                return this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response).pipe(takeUntil(this.destroy$));
              }))
            .subscribe(() => {
              this.reload$.next(null);
            });
        }
      });
    }
  }

  toggleStatus(model: SDGoal) {
    let updateObservable = model.status == CommonStatusEnum.ACTIVATED ? model.updateStatus(CommonStatusEnum.DEACTIVATED) : model.updateStatus(CommonStatusEnum.ACTIVATED);
    updateObservable.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.toast.success(this.lang.map.msg_update_x_success.change({x: model.getName()}));
        this.reload$.next(null);
      });
  }
}
