import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, of, Subject, Subscription} from 'rxjs';
import {OrgBranch} from '../../../models/org-branch';
import {LangService} from '../../../services/lang.service';
import {DialogService} from '../../../services/dialog.service';
import {LookupService} from '../../../services/lookup.service';
import {ToastService} from '../../../services/toast.service';
import {OrganizationBranchService} from '../../../services/organization-branch.service';

import {UserClickOn} from '../../../enums/user-click-on.enum';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {switchMap, tap} from 'rxjs/operators';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {OrgUnit} from '../../../models/org-unit';
import {ConfigurationService} from '../../../services/configuration.service';
import {IGridAction} from '../../../interfaces/i-grid-action';
import {cloneDeep as _deepClone} from 'lodash';
import {generateHtmlList} from '../../../helpers/utils';

@Component({
  selector: 'app-organization-branch',
  templateUrl: './organization-branch.component.html',
  styleUrls: ['./organization-branch.component.scss']
})
export class OrganizationBranchComponent implements OnInit, OnDestroy, PageComponentInterface<OrgBranch> {
  add$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  branches: OrgBranch[] = [];

  @Input() organization!: OrgUnit;
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'phoneNumber1', 'address', 'status', 'statusDateModified', 'actions'];
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;

  selectedRecords: OrgBranch[] = [];
  /*actionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];*/
  actionsList: IGridAction[] = [];

  private _addSelected(record: OrgBranch): void {
    this.selectedRecords.push(_deepClone(record));
  }

  private _removeSelected(record: OrgBranch): void {
    const index = this.selectedRecords.findIndex((item) => {
      return item.id === record.id;
    });
    this.selectedRecords.splice(index, 1);
  }

  get isIndeterminateSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length < this.branches.length;
  }

  get isFullSelection(): boolean {
    return this.selectedRecords.length === this.branches.length;
  }

  isSelected(record: OrgBranch): boolean {
    return !!this.selectedRecords.find((item) => {
      return item.id === record.id;
    });
  }

  onSelect($event: Event, record: OrgBranch): void {
    const checkBox = $event.target as HTMLInputElement;
    if (checkBox.checked) {
      this._addSelected(record);
    } else {
      this._removeSelected(record);
    }
  }

  onSelectAll($event: Event): void {
    if (this.selectedRecords.length === this.branches.length) {
      this.selectedRecords = [];
    } else {
      this.selectedRecords = _deepClone(this.branches);
    }
  }

  constructor(public langService: LangService,
              private dialogService: DialogService,
              private organizationBranchService: OrganizationBranchService,
              public lookupService: LookupService, public configService: ConfigurationService,
              private toast: ToastService) {
  }

  ngOnDestroy(): void {
    this.reloadSubscription.unsubscribe();
    this.addSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToAdd();
    this.listenToReload();
  }

  add(): void {
    const sub = this.organizationBranchService.openCreateDialog(this.organization).onAfterClose$.subscribe(() => {
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  delete(model: OrgBranch, event: MouseEvent): void {
    event.preventDefault();
    const deleteMsg = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.langService.map.lbl_org_users}) + '<br/>' +
      this.langService.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(deleteMsg).onAfterClose$
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = model.deactivate().subscribe(() => {
            this.toast.success(this.langService.map.msg_delete_x_success.change({x: model.getName()}));
            this.reload$.next(null);
            sub.unsubscribe();
          });
        }
      });
  }

  _mapBulkResponse(resultMap: any, key: string): void {
    const failedRecords: OrgBranch[] = [];
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
          const sub = this.organizationBranchService.deleteBulk(ids).subscribe((response) => {
            this._mapBulkResponse(response, 'id');
            this.reload$.next(null);
            sub.unsubscribe();
          });
        }
      });
    }
  }

  edit(model: OrgBranch, event: MouseEvent): void {
    event.preventDefault();
    const sub = this.organizationBranchService.openUpdateDialog(model.id, this.organization).subscribe((dialog: DialogRef) => {
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
        if (!this.organization || !this.organization.id) {
          return of([]);
        }
        return this.organizationBranchService.loadByCriteria({'org-id': this.organization?.id});
      })
    ).subscribe((branches) => {
      this.branches = branches;
      this.selectedRecords = [];
    });
  }

}
