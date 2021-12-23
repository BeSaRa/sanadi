import {Component} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {JobTitle} from '@app/models/job-title';
import {JobTitleService} from '@app/services/job-title.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {SharedService} from '@app/services/shared.service';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {cloneDeep as _deepClone} from 'lodash';
import {ToastService} from '@app/services/toast.service';
import {catchError, map, switchMap, takeUntil} from 'rxjs/operators';
import {of} from 'rxjs';
import {CommonStatusEnum} from '@app/enums/common-status.enum';;
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';

@Component({
  selector: 'job-title',
  templateUrl: './job-title.component.html',
  styleUrls: ['./job-title.component.scss']
})
export class JobTitleComponent extends AdminGenericComponent<JobTitle, JobTitleService> {

  constructor(public lang: LangService,
              public service: JobTitleService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private jobTitleService: JobTitleService,
              private toast: ToastService) {
    super();
  }

  searchText = '';
  commonStatusEnum = CommonStatusEnum;
  actions: IMenuItem<JobTitle>[] = [
    {
      type: 'action',
      label: 'btn_reload',
      icon: 'mdi-reload',
      onClick: _ => this.reload$.next(null),
    },
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (user) => this.edit$.next(user)
    },
    // activate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_activate',
      onClick: (item: JobTitle) => this.activateJobTitle(item),
      show: (item) => {
        return item.status === CommonStatusEnum.DEACTIVATED;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_deactivate',
      onClick: (item: JobTitle) => this.deactivateJobTitle(item),
      show: (item) => {
        return item.status === CommonStatusEnum.ACTIVATED;
      }
    }
  ];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'status', 'actions'];
  selectedRecords: JobTitle[] = [];
  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    },
    {
      icon: 'mdi-list-status',
      langKey: 'lbl_status',
      children: [
        {
          langKey: 'btn_activate',
          icon: '',
          callback: ($event: MouseEvent, data?: any) => this.changeStatusBulk($event, CommonStatusEnum.ACTIVATED),
          show: (items: JobTitle[]) => {
            return true;
          }
        },
        {
          langKey: 'btn_deactivate',
          icon: '',
          callback: ($event: MouseEvent, data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
          show: (items: JobTitle[]) => {
            return true;
          }
        }
      ],
    }
  ];

  sortingCallbacks = {
    statusInfo: (a: JobTitle, b: JobTitle, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  edit(jobTitle: JobTitle, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(jobTitle);
  }

  delete(event: MouseEvent, model: JobTitle): void {
    event.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
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
          const sub = this.service.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
              .subscribe(() => {
                this.selectedRecords = [];
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

  changeStatusBulk($event: MouseEvent, newStatus: CommonStatusEnum): void {
    const sub = this.jobTitleService.updateStatusBulk(this.selectedRecords.map(item => item.id), newStatus)
      .subscribe((response) => {
        this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response, 'UPDATE')
          .subscribe(() => {
            this.reload$.next(null);
            sub.unsubscribe();
          });
      });
  }

  activateJobTitle(model: JobTitle): void {
    const sub = model.updateStatus(CommonStatusEnum.ACTIVATED).subscribe(() => {
      // @ts-ignore
      this.toast.success(this.lang.map.msg_update_x_success.change({x: model.getName()}));
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  deactivateJobTitle(model: JobTitle): void {
    const sub = model.updateStatus(CommonStatusEnum.DEACTIVATED).subscribe(() => {
      // @ts-ignore
      this.toast.success(this.lang.map.msg_update_x_success.change({x: model.getName()}));
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        const load = this.useCompositeToLoad ? this.service.loadComposite() : this.service.load();
        return load.pipe(
          map(list => {
            return list.filter(model => {
              return model.status !== CommonStatusEnum.RETIRED;
            });
          }),
          catchError(_ => of([]))
        );
      }))
      .subscribe((list: JobTitle[]) => {
        this.models = list;
        this.selectedRecords = [];
      })
  }

  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  }

  private _addSelected(record: JobTitle): void {
    this.selectedRecords.push(_deepClone(record));
  }

  private _removeSelected(record: JobTitle): void {
    const index = this.selectedRecords.findIndex((item) => {
      return item.id === record.id;
    });
    this.selectedRecords.splice(index, 1);
  }

  get isIndeterminateSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length < this.models.length;
  }

  get isFullSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length === this.models.length;
  }

  isSelected(record: JobTitle): boolean {
    return !!this.selectedRecords.find((item) => {
      return item.id === record.id;
    });
  }

  onSelect($event: Event, record: JobTitle): void {
    const checkBox = $event.target as HTMLInputElement;
    if (checkBox.checked) {
      this._addSelected(record);
    } else {
      this._removeSelected(record);
    }
  }

  onSelectAll(): void {
    if (this.selectedRecords.length === this.models.length) {
      this.selectedRecords = [];
    } else {
      this.selectedRecords = _deepClone(this.models);
    }
  }
}
