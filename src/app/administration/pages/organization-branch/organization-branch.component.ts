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
  displayedColumns: string[] = ['arName', 'enName', 'phoneNumber1', 'email', 'address', 'status', 'actions'];
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;

  constructor(public langService: LangService,
              private dialogService: DialogService,
              private organizationBranchService: OrganizationBranchService,
              public lookupService: LookupService,
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
    // @ts-ignore
    this.dialogService.confirm(this.langService.map.confirm_delete_x.change({x: model.getName()})).onAfterClose$
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const sub = model.delete().subscribe(() => {
            // @ts-ignore
            this.toast.success(this.langService.map.delete_x_success.change({x: model.getName()}));
            this.reload$.next(null);
            sub.unsubscribe();
          });
        }
      });
  }

  edit(model: OrgBranch, event: MouseEvent): void {
    event.preventDefault();
    const sub = this.organizationBranchService.openUpdateDialog(model.id).subscribe((dialog: DialogRef) => {
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
        return this.organizationBranchService.loadByCriteria({orgId: this.organization?.id});
      })
    ).subscribe((branches) => {
      this.branches = branches;
    });
  }

}
