import {Component, OnDestroy, OnInit} from '@angular/core';
import {PageComponentInterface} from '@app/interfaces/page-component-interface';
import {OrgUser} from '@app/models/org-user';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {debounceTime, switchMap, tap} from 'rxjs/operators';
import {OrganizationUserService} from '@app/services/organization-user.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {LangService} from '@app/services/lang.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {ConfigurationService} from '@app/services/configuration.service';
import {cloneDeep as _deepClone} from 'lodash';
import {searchInObject} from '@app/helpers/utils';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {EmployeeService} from '@app/services/employee.service';
import {SharedService} from '@app/services/shared.service';

@Component({
  selector: 'app-organization-user',
  templateUrl: './organization-user.component.html',
  styleUrls: ['./organization-user.component.scss']
})
export class OrganizationUserComponent implements OnInit, OnDestroy, PageComponentInterface<OrgUser> {
  orgUsers: OrgUser[] = [];
  orgUsersClone: OrgUser[] = [];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'empNum', 'organization', 'branch', 'status', 'statusDateModified', 'actions'];
  add$ = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;
  search$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  internalSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  searchSubscription!: Subscription;
  internalSearchSubscription!: Subscription;

  selectedRecords: OrgUser[] = [];
  actionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deactivateBulk($event);
      }
    }
  ];

  // noinspection JSUnusedLocalSymbols
  bindingKeys: IKeyValue = {
    arName: 'arName',
    enName: 'enName',
    empNum: 'empNum',
    organization: (record: any): string => {
      return 'orgUnitInfo.' + this.langService.map.lang + 'Name';
    },
    branch: (record: any): string => {
      return 'orgBranchInfo.' + this.langService.map.lang + 'Name';
    },
    status: (record: any): string => {
      return '';
    },
    statusDateModified: 'statusDateModified'
  };

  private _addSelected(record: OrgUser): void {
    this.selectedRecords.push(_deepClone(record));
  }

  private _removeSelected(record: OrgUser): void {
    const index = this.selectedRecords.findIndex((item) => {
      return item.id === record.id;
    });
    this.selectedRecords.splice(index, 1);
  }

  get isIndeterminateSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length < this.orgUsers.length;
  }

  get isFullSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length === this.orgUsers.length;
  }

  isSelected(record: OrgUser): boolean {
    return !!this.selectedRecords.find((item) => {
      return item.id === record.id;
    });
  }

  onSelect($event: Event, record: OrgUser): void {
    const checkBox = $event.target as HTMLInputElement;
    if (checkBox.checked) {
      this._addSelected(record);
    } else {
      this._removeSelected(record);
    }
  }

  // noinspection JSUnusedLocalSymbols
  onSelectAll($event: Event): void {
    if (this.selectedRecords.length === this.orgUsers.length) {
      this.selectedRecords = [];
    } else {
      this.selectedRecords = _deepClone(this.orgUsers);
    }
  }

  constructor(private orgUserService: OrganizationUserService,
              public langService: LangService,
              private toast: ToastService,
              public configService: ConfigurationService,
              public empService: EmployeeService,
              private dialogService: DialogService,
              private sharedService: SharedService) {
  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
    this.listenToSearch();
    this.listenToInternalSearch();
  }

  add(): void {
    const sub = this.orgUserService.openCreateDialog().subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe(() => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  delete(model: OrgUser, event: MouseEvent): void {
    event.preventDefault();
    return;
  }

  deactivate(event: MouseEvent, model: OrgUser): void {
    event.preventDefault();
    // @ts-ignore
    const message = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.langService.map.user.toLowerCase()}) + '<br/>' +
      this.langService.map.msg_confirm_delete_x.change({x: model.getName()})
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.deactivate().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.langService.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }

  deactivateBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.langService.map.lbl_org_users.toLowerCase()}) + '<br/>' +
        this.langService.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.orgUserService.deactivateBulk(ids).subscribe((response) => {
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

  edit(orgUser: OrgUser, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.orgUserService.openUpdateDialog(orgUser.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        return this.orgUserService.loadComposite();
      })
    ).subscribe((orgUsers) => {
      this.orgUsers = orgUsers;
      this.orgUsersClone = orgUsers;
      this.selectedRecords = [];
      this.internalSearch$.next(this.search$.value);
    });
  }

  listenToAdd(): void {
    this.addSubscription = this.add$.pipe(
      tap(() => {
        this.add();
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
    this.addSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
    this.internalSearchSubscription?.unsubscribe();
  }

  search(searchText: string): void {
    this.search$.next(searchText);
  }

  private listenToSearch(): void {
    this.searchSubscription = this.search$.pipe(
      debounceTime(500)
    ).subscribe((searchText) => {
      this.orgUsers = this.orgUsersClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }

  private listenToInternalSearch(): void {
    this.internalSearchSubscription = this.internalSearch$.subscribe((searchText) => {
      this.orgUsers = this.orgUsersClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }

  showAuditLogs($event: MouseEvent, user: OrgUser): void {
    $event.preventDefault();
    user.showAuditLogs($event)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }
}
