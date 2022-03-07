import {Component, Input, ViewChild} from '@angular/core';
import {of} from 'rxjs';
import {OrgBranch} from '@app/models/org-branch';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {OrganizationBranchService} from '@app/services/organization-branch.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {exhaustMap, filter, switchMap, takeUntil} from 'rxjs/operators';
import {OrgUnit} from '@app/models/org-unit';
import {ConfigurationService} from '@app/services/configuration.service';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {SharedService} from '@app/services/shared.service';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {TableComponent} from '@app/shared/components/table/table.component';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';

@Component({
  selector: 'app-organization-branch',
  templateUrl: './organization-branch.component.html',
  styleUrls: ['./organization-branch.component.scss']
})
export class OrganizationBranchComponent extends AdminGenericComponent<OrgBranch, OrganizationBranchService> {
  @Input() organization!: OrgUnit;
  @ViewChild('table') table!: TableComponent;
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'phoneNumber1', 'address', 'status', 'statusDateModified', 'actions'];
  actions: IMenuItem<OrgBranch>[] = [
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
              public service: OrganizationBranchService,
              public lookupService: LookupService, public configService: ConfigurationService,
              private toast: ToastService,
              private sharedService: SharedService) {
    super();
  }

  ngOnInit(): void {
    this.listenToAdd();
    this.listenToEdit();
    this.listenToReload();
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openCreateDialog(this.organization).onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  listenToEdit() {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => this.service.openUpdateDialog(model.id, this.organization)))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => {
        this.reload$.next(null)
      })
  }

  listenToReload(): void {
    this.reload$
      .pipe(takeUntil(this.destroy$))
      .pipe(
        switchMap(() => {
          if (!this.organization || !this.organization.id) {
            return of([]);
          }
          return this.service.loadByCriteria({'org-id': this.organization?.id});
        })
      ).subscribe((branches) => {
      this.models = branches;
      this.table.selection.clear();
    });
  }

  edit(model: OrgBranch, event?: MouseEvent): void {
    event?.preventDefault();
    this.edit$.next(model);
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
          const sub = this.service.deactivateBulk(ids).subscribe((response) => {
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

  showAuditLogs(branch: OrgBranch, $event?: MouseEvent): void {
    $event?.preventDefault();
    branch.showAuditLogs()
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

}
