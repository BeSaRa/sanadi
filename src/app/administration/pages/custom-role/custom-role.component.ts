import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {CustomRoleService} from '../../../services/custom-role.service';
import {CustomRole} from '../../../models/custom-role';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {debounceTime, switchMap, tap} from 'rxjs/operators';
import {ToastService} from '../../../services/toast.service';
import {DialogService} from '../../../services/dialog.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {IGridAction} from '../../../interfaces/i-grid-action';
import {cloneDeep as _deepClone} from 'lodash';
import {searchInObject} from '../../../helpers/utils';
import {SharedService} from '../../../services/shared.service';

@Component({
  selector: 'app-custom-role',
  templateUrl: './custom-role.component.html',
  styleUrls: ['./custom-role.component.scss']
})
export class CustomRoleComponent implements OnInit, OnDestroy, PageComponentInterface<CustomRole> {
  add$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  search$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  internalSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  customRoles: CustomRole[] = [];
  customRolesClone: CustomRole[] = [];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'status', 'actions'];
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;
  searchSubscription!: Subscription;
  internalSearchSubscription!: Subscription;

  selectedRecords: CustomRole[] = [];
  actionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];

  private _addSelected(record: CustomRole): void {
    this.selectedRecords.push(_deepClone(record));
  }

  private _removeSelected(record: CustomRole): void {
    const index = this.selectedRecords.findIndex((item) => {
      return item.id === record.id;
    });
    this.selectedRecords.splice(index, 1);
  }

  get isIndeterminateSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length < this.customRoles.length;
  }

  get isFullSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length === this.customRoles.length;
  }

  isSelected(record: CustomRole): boolean {
    return !!this.selectedRecords.find((item) => {
      return item.id === record.id;
    });
  }

  onSelect($event: Event, record: CustomRole): void {
    const checkBox = $event.target as HTMLInputElement;
    if (checkBox.checked) {
      this._addSelected(record);
    } else {
      this._removeSelected(record);
    }
  }

  onSelectAll($event: Event): void {
    if (this.selectedRecords.length === this.customRoles.length) {
      this.selectedRecords = [];
    } else {
      this.selectedRecords = _deepClone(this.customRoles);
    }
  }

  constructor(public langService: LangService,
              private dialogService: DialogService,
              private customRoleService: CustomRoleService,
              private toast: ToastService,
              private sharedService: SharedService) {
  }


  ngOnDestroy(): void {
    this.reloadSubscription.unsubscribe();
    this.addSubscription.unsubscribe();
    this.searchSubscription?.unsubscribe();
    this.internalSearchSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToAdd();
    this.listenToReload();
    this.listenToSearch();
    this.listenToInternalSearch();
  }

  add(): void {
    const sub = this.customRoleService.openCreateDialog().onAfterClose$.subscribe(() => {
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  delete(model: CustomRole, event: MouseEvent): void {
    event.preventDefault();
    // @ts-ignore
    this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({x: model.getName()})).onAfterClose$
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = model.delete().subscribe(() => {
            // @ts-ignore
            this.toast.success(this.langService.map.msg_delete_x_success.change({x: model.getName()}));
            this.reload$.next(null);
            sub.unsubscribe();
          });
        }
      });
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
          const sub = this.customRoleService.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
              .subscribe(()=> {
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

  edit(model: CustomRole, event: MouseEvent): void {
    event.preventDefault();
    const sub = this.customRoleService.openUpdateDialog(model.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  listenToAdd(): void {
    this.addSubscription = this.add$.pipe(
      tap(() => {
        this.add();
      })
    ).subscribe();
  }

  listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        return this.customRoleService.load();
      })
    ).subscribe((roles) => {
      this.customRoles = roles;
      this.customRolesClone = roles;
      this.selectedRecords = [];
      this.internalSearch$.next(this.search$.value);
    });
  }

  updateStatus(model: CustomRole): void {
    const sub = model.toggleStatus().update().subscribe(() => {
      // @ts-ignore
      this.toast.success(this.langService.map.msg_status_x_updated_success.change({x: model.getName()}));
      sub.unsubscribe();
    }, () => {
      // @ts-ignore
      this.toast.error(this.langService.map.msg_status_x_updated_fail.change({x: model.getName()}));
      model.toggleStatus();
      sub.unsubscribe();
    });
  }

  search(searchText: string): void {
    this.search$.next(searchText);
  }

  private listenToSearch(): void {
    this.searchSubscription = this.search$.pipe(
      debounceTime(500)
    ).subscribe((searchText) => {
      this.customRoles = this.customRolesClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }

  private listenToInternalSearch(): void {
    this.internalSearchSubscription = this.internalSearch$.subscribe((searchText) => {
      this.customRoles = this.customRolesClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }
}
