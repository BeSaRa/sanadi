import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {OrgUser} from '../../../models/org-user';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {OrganizationUserService} from '../../../services/organization-user.service';
import {LangService} from '../../../services/lang.service';
import {switchMap, tap} from 'rxjs/operators';
import {OrgBranch} from '../../../models/org-branch';
import {OrgUnit} from '../../../models/org-unit';
import {DialogRef} from '../../../shared/models/dialog-ref';

@Component({
  selector: 'app-organization-branch-user',
  templateUrl: './organization-branch-user.component.html',
  styleUrls: ['./organization-branch-user.component.scss']
})
export class OrganizationBranchUserComponent implements OnInit, OnDestroy, PageComponentInterface<OrgUser> {
  @Input() organization!: OrgUnit;
  @Input() orgBranch!: OrgBranch;

  users: OrgUser[] = [];
  displayedColumns: string[] = ['id', 'empNum', 'arName', 'enName', 'actions'];
  add$: Subject<any> = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;

  constructor(private orgUserService: OrganizationUserService, public langService: LangService) {
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

  edit(orgUser: OrgUser, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.orgUserService.openUpdateDialog(orgUser.id).subscribe((dialog: DialogRef) => {
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
}
