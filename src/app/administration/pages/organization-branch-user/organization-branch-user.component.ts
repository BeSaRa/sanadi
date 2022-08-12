import {Component, Input, ViewChild} from '@angular/core';
import {OrgUser} from '@app/models/org-user';
import {OrganizationUserService} from '@app/services/organization-user.service';
import {LangService} from '@app/services/lang.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {OrgBranch} from '@app/models/org-branch';
import {OrgUnit} from '@app/models/org-unit';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {EmployeeService} from '@app/services/employee.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {TableComponent} from '@app/shared/components/table/table.component';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';

@Component({
  selector: 'app-organization-branch-user',
  templateUrl: './organization-branch-user.component.html',
  styleUrls: ['./organization-branch-user.component.scss']
})
export class OrganizationBranchUserComponent extends AdminGenericComponent<OrgUser, OrganizationUserService> {
  @Input() organization!: OrgUnit;
  @Input() orgBranch!: OrgBranch;

  usePagination = true;

  constructor(public service: OrganizationUserService,
              public langService: LangService,
              public empService: EmployeeService) {
    super();
  }

  displayedColumns: string[] = ['empNum', 'arName', 'enName', 'actions'];
  @ViewChild('table') table!: TableComponent;

  actions: IMenuItem<OrgUser>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item: OrgUser) => this.edit(item, undefined),
      show: (item: OrgUser) => {
        return this.empService.checkPermissions('ADMIN_EDIT_USER');
      }
    },
    // logs
    {
      type: 'action',
      icon: 'mdi-view-list-outline',
      label: 'logs',
      onClick: (item: OrgUser) => this.showAuditLogs(item)
    }
  ];

  edit(orgUser: OrgUser, $event?: MouseEvent): void {
    $event?.preventDefault();
    this.edit$.next(orgUser);
  }

  listenToReload(): void {
    this.reload$
      .pipe(takeUntil(this.destroy$))
      .pipe(
        switchMap(() => {
          const paginationOptions = {
            limit: this.pageEvent.pageSize,
            offset: (this.pageEvent.pageIndex * this.pageEvent.pageSize)
          };
          return this.service.getByCriteriaPaging(paginationOptions, {'org-id': this.organization.id, 'org-branch-id': this.orgBranch.id})
            .pipe(map((res) => {
              this.count = res.count;
              return res.rs;
            }));
        })
      ).subscribe((users: OrgUser[]) => {
      this.models = users;
      this.table && this.table.clearSelection();
    });
  }

  showAuditLogs(user: OrgUser, $event?: MouseEvent): void {
    $event?.preventDefault();
    user.showAuditLogs()
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }
}
