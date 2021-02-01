import {Component, OnDestroy, OnInit} from '@angular/core';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {OrgUser} from '../../../models/org-user';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {OrganizationUserService} from '../../../services/organization-user.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {LangService} from '../../../services/lang.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {DialogService} from '../../../services/dialog.service';
import {ToastService} from '../../../services/toast.service';
import {ConfigurationService} from '../../../services/configuration.service';
import {cloneDeep as _deepClone} from 'lodash';
import {generateHtmlList} from '../../../helpers/utils';

@Component({
  selector: 'app-organization-user',
  templateUrl: './organization-user.component.html',
  styleUrls: ['./organization-user.component.scss']
})
export class OrganizationUserComponent implements OnInit, OnDestroy, PageComponentInterface<OrgUser> {

  orgUsers: OrgUser[] = [];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'empNum', 'organization', 'branch', 'status', 'statusDateModified', 'actions'];
  add$ = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;

  selectedRecords: OrgUser[] = [];
  actionsList: any[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      actionCallback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];

  private _addSelected(record: OrgUser): void {
    this.selectedRecords.push(_deepClone(record));
  }

  private _removeSelected(record: OrgUser): void {
    const index = this.selectedRecords.findIndex((item) => {
      return item.id === record.id;
    });
    this.selectedRecords.splice(index, 1);
  }

  isIndeterminateSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length < this.orgUsers.length;
  }

  isFullSelection(): boolean {
    return this.selectedRecords.length === this.orgUsers.length;
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
              private dialogService: DialogService) {
  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
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
    // @ts-ignore
    this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({x: model.getName()}))
      .onAfterClose$.subscribe((click: UserClickOn) => {
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

  _mapBulkResponse(resultMap: any, key: string): void {
    const failedRecords: OrgUser[] = [];
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
          const sub = this.orgUserService.deleteBulk(ids).subscribe((response) => {
            this._mapBulkResponse(response, 'id');
            this.reload$.next(null);
            sub.unsubscribe();
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

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
    this.addSubscription?.unsubscribe();
  }

}
