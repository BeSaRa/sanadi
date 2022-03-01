import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PageComponentInterface} from '@app/interfaces/page-component-interface';
import {OrgUser} from '@app/models/org-user';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {OrganizationUserService} from '@app/services/organization-user.service';
import {LangService} from '@app/services/lang.service';
import {switchMap, tap} from 'rxjs/operators';
import {OrgBranch} from '@app/models/org-branch';
import {OrgUnit} from '@app/models/org-unit';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {EmployeeService} from '@app/services/employee.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {TableComponent} from '@app/shared/components/table/table.component';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-organization-branch-user',
  templateUrl: './organization-branch-user.component.html',
  styleUrls: ['./organization-branch-user.component.scss']
})
export class OrganizationBranchUserComponent implements OnInit, OnDestroy, PageComponentInterface<OrgUser> {
  @Input() organization!: OrgUnit;
  @Input() orgBranch!: OrgBranch;

  users: OrgUser[] = [];
  displayedColumns: string[] = ['empNum', 'arName', 'enName', 'actions'];
  add$: Subject<any> = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;

  @ViewChild('table') table!: TableComponent;
  filterControl: FormControl = new FormControl('');

  actionsList: IMenuItem<OrgUser>[] = [
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
  ]

  constructor(private orgUserService: OrganizationUserService,
              public langService: LangService,
              public empService: EmployeeService) {
  }

  ngOnInit(): void {
    this.listenToAdd();
    this.listenToReload();
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
    this.addSubscription?.unsubscribe();
  }

  add(): void {

  }

  delete(model: OrgUser, event: MouseEvent): void {
  }

  edit(orgUser: OrgUser, $event?: MouseEvent): void {
    $event?.preventDefault();
    const sub = this.orgUserService.editDialog(orgUser).subscribe((dialog: DialogRef) => {
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
        return this.orgUserService.getByCriteria({'org-id': this.organization.id, 'org-branch-id': this.orgBranch.id});
      })
    ).subscribe((users: OrgUser[]) => {
      this.users = users;
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
