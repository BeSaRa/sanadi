import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject, of, Subject, Subscription} from 'rxjs';
import {OrgBranch} from '@app/models/org-branch';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {OrganizationBranchService} from '@app/services/organization-branch.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {switchMap, tap} from 'rxjs/operators';
import {PageComponentInterface} from '@app/interfaces/page-component-interface';
import {OrgUnit} from '@app/models/org-unit';
import {ConfigurationService} from '@app/services/configuration.service';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {SharedService} from '@app/services/shared.service';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {TableComponent} from '@app/shared/components/table/table.component';
import {FormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';

@Component({
  selector: 'app-organization-branch',
  templateUrl: './organization-branch.component.html',
  styleUrls: ['./organization-branch.component.scss']
})
export class OrganizationBranchComponent implements OnInit, OnDestroy, PageComponentInterface<OrgBranch> {
  add$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  branches: OrgBranch[] = [];
  branchesClone: OrgBranch[] = [];

  @Input() organization!: OrgUnit;
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'phoneNumber1', 'address', 'status', 'statusDateModified', 'actions'];
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;

  @ViewChild('table') table!: TableComponent;
  filterControl: FormControl = new FormControl('');

  actionsList: IMenuItem<OrgBranch>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item: OrgBranch) => this.edit(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: 'mdi-close-box',
      onClick: (item: OrgBranch) => this.deactivate(item)
    },
    // logs
    {
      type: 'action',
      icon: 'mdi-view-list-outline',
      label: 'logs',
      onClick: (item: OrgBranch) => this.showAuditLogs(item)
    }
  ];

  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deactivateBulk($event);
      }
    }
  ];

  sortingCallbacks = {
    status: (a: OrgBranch, b: OrgBranch, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.getOrgStatusLookup()?.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.getOrgStatusLookup()?.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    }
  }

  get selectedRecords(): OrgUnit[] {
    return this.table.selection.selected;
  }

  constructor(public langService: LangService,
              private dialogService: DialogService,
              private organizationBranchService: OrganizationBranchService,
              public lookupService: LookupService, public configService: ConfigurationService,
              private toast: ToastService,
              private sharedService: SharedService) {
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
    return;
  }

  deactivate(model: OrgBranch, event?: MouseEvent): void {
    event?.preventDefault();
    const message = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.langService.map.lbl_org_users}) + '<br/>' +
      this.langService.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message).onAfterClose$
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

  deactivateBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.langService.map.lbl_org_users}) + '<br/>' +
        this.langService.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.organizationBranchService.deactivateBulk(ids).subscribe((response) => {
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

  edit(model: OrgBranch, event?: MouseEvent): void {
    event?.preventDefault();
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
      this.branchesClone = branches;
      this.table.selection.clear();
    });
  }

  showAuditLogs(branch: OrgBranch, $event?: MouseEvent): void {
    $event?.preventDefault();
    branch.showAuditLogs()
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

}
