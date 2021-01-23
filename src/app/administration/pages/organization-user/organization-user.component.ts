import {Component, OnDestroy, OnInit} from '@angular/core';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {OrgUser} from '../../../models/org-user';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {OrganizationUserService} from '../../../services/organization-user.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {LangService} from '../../../services/lang.service';

@Component({
  selector: 'app-organization-user',
  templateUrl: './organization-user.component.html',
  styleUrls: ['./organization-user.component.scss']
})
export class OrganizationUserComponent implements OnInit, OnDestroy, PageComponentInterface<OrgUser> {

  orgUsers: OrgUser[] = [];
  displayedColumns: string[] = ['empNum', 'arName', 'enName', 'actions'];
  add$ = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;

  constructor(private orgUserService: OrganizationUserService, public langService: LangService) {
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
        return this.orgUserService.load();
      })
    ).subscribe((orgUsers) => {
      this.orgUsers = orgUsers;
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
