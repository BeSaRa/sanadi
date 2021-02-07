import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {AidLookup} from '../../../models/aid-lookup';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {LangService} from '../../../services/lang.service';
import {DialogService} from '../../../services/dialog.service';
import {ToastService} from '../../../services/toast.service';
import {switchMap, tap} from 'rxjs/operators';
import {AidLookupService} from '../../../services/aid-lookup.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {AidTypes} from '../../../enums/aid-types.enum';
import {IAidLookupCriteria} from '../../../interfaces/i-aid-lookup-criteria';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';
import {ConfigurationService} from '../../../services/configuration.service';
import {generateHtmlList} from '../../../helpers/utils';
import {IGridAction} from '../../../interfaces/i-grid-action';
import {cloneDeep as _deepClone} from 'lodash';

@Component({
  selector: 'app-aid-lookup',
  templateUrl: './aid-lookup.component.html',
  styleUrls: ['./aid-lookup.component.scss']
})
export class AidLookupComponent implements OnInit, OnDestroy, PageComponentInterface<AidLookup> {
  @Input() aidType!: number;
  @Input() parentId!: number;

  aidLookups: AidLookup[] = [];
  displayedColumns: string[] = ['rowSelection', 'aidCode', 'arName', 'enName', 'status', 'statusDateModified', 'actions'];
  add$ = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;

  selectedRecords: AidLookup[] = [];
  actionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];

  private _addSelected(record: AidLookup): void {
    this.selectedRecords.push(_deepClone(record));
  }

  private _removeSelected(record: AidLookup): void {
    const index = this.selectedRecords.findIndex((item) => {
      return item.id === record.id;
    });
    this.selectedRecords.splice(index, 1);
  }

  get isIndeterminateSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length < this.aidLookups.length;
  }

  get isFullSelection(): boolean {
    return this.selectedRecords.length === this.aidLookups.length;
  }

  isSelected(record: AidLookup): boolean {
    return !!this.selectedRecords.find((item) => {
      return item.id === record.id;
    });
  }

  onSelect($event: Event, record: AidLookup): void {
    const checkBox = $event.target as HTMLInputElement;
    if (checkBox.checked) {
      this._addSelected(record);
    } else {
      this._removeSelected(record);
    }
  }

  onSelectAll($event: Event): void {
    if (this.selectedRecords.length === this.aidLookups.length) {
      this.selectedRecords = [];
    } else {
      this.selectedRecords = _deepClone(this.aidLookups);
    }
  }

  constructor(public langService: LangService, private dialogService: DialogService,
              public configService: ConfigurationService,
              public toast: ToastService, public aidLookupService: AidLookupService) {
  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
  }

  listenToAdd(): void {
    this.addSubscription = this.add$.pipe(tap(() => {
      this.add();
    })).subscribe();

  }

  listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(switchMap(() => {
      // TODO if status empty the BE default status true
      const criteria: IAidLookupCriteria = {aidType: this.aidType, parent: this.parentId};
      return this.aidLookupService.loadByCriteria(criteria);
    })).subscribe(aidLookups => {
      this.aidLookups = aidLookups;
      this.selectedRecords = [];
    });
  }

  add(): void {
    const sub = this.aidLookupService.openCreateDialog(this.aidType, this.parentId)
      .onAfterClose$.subscribe(() => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
  }

  edit(aidLookup: AidLookup, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.aidLookupService.openUpdateDialog(aidLookup.id, this.aidType)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe((_) => {
          this.reload$.next(null);
          sub.unsubscribe();
        });
      });
  }

  delete(aidLookup: AidLookup, $event: MouseEvent): void {
    $event.preventDefault();
    // @ts-ignore
    const sub = this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({x: aidLookup.aidCode}))
      .onAfterClose$
      .subscribe((click: UserClickOn) => {
        sub.unsubscribe();
        if (click === UserClickOn.YES) {
          aidLookup.delete().subscribe(() => {
            this.toast.success(this.langService.map.msg_delete_x_success.change({x: aidLookup.aidCode}));
            this.reload$.next(null);
          });
        }
      });
  }

  _mapBulkResponse(resultMap: any, key: string): void {
    const failedRecords: AidLookup[] = [];
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
          const sub = this.aidLookupService.deleteBulk(ids).subscribe((response) => {
            this._mapBulkResponse(response, 'id');
            this.reload$.next(null);
            sub.unsubscribe();
          });
        }
      });
    }
  }

  updateStatus(aidLookup: AidLookup): void {
    const sub = aidLookup.toggleStatus().update().subscribe(() => {
      // @ts-ignore
      this.toast.success(this.langService.map.msg_status_x_updated_success.change({x: aidLookup.getName()}));
      sub.unsubscribe();
    }, () => {
      // @ts-ignore
      this.toast.error(this.langService.map.msg_status_x_updated_fail.change({x: aidLookup.getName()}));
      aidLookup.toggleStatus();
      sub.unsubscribe();
    });
  }

  getTitleText(): (keyof ILanguageKeys) {
    let title: keyof ILanguageKeys;
    switch (this.aidType) {
      case AidTypes.CLASSIFICATIONS:
        title = 'menu_aid_class';
        break;
      case AidTypes.MAIN_CATEGORY:
        title = 'menu_aid_main_category';
        break;
      case AidTypes.SUB_CATEGORY:
        title = 'menu_aid_sub_category';
        break;
    }
    // @ts-ignore
    return title;
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
    this.addSubscription?.unsubscribe();
  }
}
