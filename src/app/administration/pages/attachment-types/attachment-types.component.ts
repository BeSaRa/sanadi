import {Component, ViewChild} from '@angular/core';
import {LangService} from '@app/services/lang.service';
import {of, Subscription} from 'rxjs';
import {AttachmentType} from '@app/models/attachment-type';
import {AttachmentTypeService} from '@app/services/attachment-type.service';
import {FormControl} from '@angular/forms';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {SharedService} from '@app/services/shared.service';
import {ToastService} from '@app/services/toast.service';
import {catchError, map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {TableComponent} from '@app/shared/components/table/table.component';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';

@Component({
  selector: 'attachment-types',
  templateUrl: './attachment-types.component.html',
  styleUrls: ['./attachment-types.component.scss']
})
export class AttachmentTypesComponent extends AdminGenericComponent<AttachmentType, AttachmentTypeService> {
  list: AttachmentType[] = [];
  displayedColumns = ['rowSelection', 'arName', 'enName', 'status', 'actions'];
  reloadSubscription!: Subscription;
  filterControl: FormControl = new FormControl('');

  actionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];
  actions: IMenuItem<AttachmentType>[] = [];

  @ViewChild('table') table!: TableComponent;

  constructor(public lang: LangService,
              public service: AttachmentTypeService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService) {
    super();
  }

  get selectedRecords(): AttachmentType[] {
    return this.table.selection.selected;
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
      .subscribe((list: AttachmentType[]) => {
        this.models = list;
        this.table.selection.clear();
      })
  }

  sortingCallbacks = {
    statusInfo: (a: AttachmentType, b: AttachmentType, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  edit(attachmentType: AttachmentType, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(attachmentType);
  }

  delete(event: MouseEvent, model: AttachmentType): void {
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
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }
}
