import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {Localization} from '../../../models/localization';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {DialogService} from '../../../services/dialog.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {IGridAction} from '../../../interfaces/i-grid-action';
import {cloneDeep as _deepClone} from 'lodash';
import {generateHtmlList} from '../../../helpers/utils';

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  styleUrls: ['./localization.component.scss']
})
export class LocalizationComponent implements OnInit, OnDestroy, PageComponentInterface<Localization> {
  localization: Localization[] = [];
  displayedColumns: string[] = ['rowSelection', 'localizationKey', 'arName', 'enName', 'actions'];
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  add$ = new Subject<any>();

  selectedRecords: Localization[] = [];
  actionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];

  private _addSelected(record: Localization): void {
    this.selectedRecords.push(_deepClone(record));
  }

  private _removeSelected(record: Localization): void {
    const index = this.selectedRecords.findIndex((item) => {
      return item.id === record.id;
    });
    this.selectedRecords.splice(index, 1);
  }

  get isIndeterminateSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length < this.localization.length;
  }

  get isFullSelection(): boolean {
    return this.selectedRecords.length === this.localization.length;
  }

  isSelected(record: Localization): boolean {
    return !!this.selectedRecords.find((item) => {
      return item.id === record.id;
    });
  }

  onSelect($event: Event, record: Localization): void {
    const checkBox = $event.target as HTMLInputElement;
    if (checkBox.checked) {
      this._addSelected(record);
    } else {
      this._removeSelected(record);
    }
  }

  onSelectAll($event: Event): void {
    if (this.selectedRecords.length === this.localization.length) {
      this.selectedRecords = [];
    } else {
      this.selectedRecords = _deepClone(this.localization);
    }
  }

  constructor(public langService: LangService, private dialogService: DialogService, public toast: ToastService) {

  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
    this.addSubscription?.unsubscribe();
  }

  listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        return this.langService.load();
      })
    ).subscribe((locals) => {
      this.localization = locals;
      this.selectedRecords = [];
    });
  }

  listenToAdd(): void {
    this.addSubscription = this.add$.pipe(
      tap(() => {
        this.add();
      })
    ).subscribe();
  }

  add(): void {
    const sub = this.langService.openCreateDialog().onAfterClose$.subscribe(() => {
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  edit(localization: Localization, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.langService.openUpdateDialog(localization.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });

  }

  delete(localization: Localization, $event: MouseEvent): void {
    $event.preventDefault();
    // @ts-ignore
    const sub = this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({x: localization.localizationKey}))
      .onAfterClose$
      .subscribe((click: UserClickOn) => {
        sub.unsubscribe();
        if (click === UserClickOn.YES) {
          localization.delete().subscribe(() => {
            this.toast.success(this.langService.map.msg_delete_x_success.change({x: localization.localizationKey}));
            this.reload$.next(null);
          });
        }
      });
  }

  _mapBulkResponse(resultMap: any, key: string): void {
    const failedRecords: Localization[] = [];
    for (const item of this.selectedRecords) {
      // @ts-ignore
      if (resultMap.hasOwnProperty(item[key]) && !resultMap[item[key]]) {
        failedRecords.push(item);
      }
    }
    if (failedRecords.length === 0) {
      this.toast.success(this.langService.map.msg_delete_success);
    } else if (failedRecords.length === this.selectedRecords.length) {
      this.toast.success(this.langService.map.msg_delete_fail);
    } else {
      const listHtml = generateHtmlList(this.langService.map.msg_delete_success_except, failedRecords.map((item) => item.getName()));
      this.dialogService.info(listHtml.outerHTML);
    }
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      this.dialogService.confirm(this.langService.map.msg_confirm_delete_selected)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.langService.deleteBulk(ids).subscribe((response) => {
            this._mapBulkResponse(response, 'id');
            this.reload$.next(null);
            sub.unsubscribe();
          });
        }
      });
    }
  }
}
