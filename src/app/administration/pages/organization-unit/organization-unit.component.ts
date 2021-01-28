import {Component, OnDestroy, OnInit} from '@angular/core';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {LangService} from '../../../services/lang.service';
import {DialogService} from '../../../services/dialog.service';
import {ToastService} from '../../../services/toast.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {switchMap, tap} from 'rxjs/operators';
import {OrgUnit} from '../../../models/org-unit';
import {OrganizationUnitService} from '../../../services/organization-unit.service';
import {LookupCategories} from '../../../enums/lookup-categories';
import {Lookup} from '../../../models/lookup';
import {LookupService} from '../../../services/lookup.service';
import {ConfigurationService} from '../../../services/configuration.service';

@Component({
  selector: 'app-organization-unit',
  templateUrl: './organization-unit.component.html',
  styleUrls: ['./organization-unit.component.scss']
})
export class OrganizationUnitComponent implements OnInit, OnDestroy, PageComponentInterface<OrgUnit> {
  add$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  organizations: OrgUnit[] = [];
  displayedColumns: string[] = ['arName', 'enName', 'orgNationality', 'phoneNumber1', 'email', 'address', 'status', 'statusDateModified', 'actions'];
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;
  orgUnitTypesList: Lookup[];

  constructor(public langService: LangService,
              private dialogService: DialogService,
              private organizationUnitService: OrganizationUnitService,
              public lookupService: LookupService, private toast: ToastService,
              public configService: ConfigurationService) {
    this.orgUnitTypesList = this.lookupService.getByCategory(LookupCategories.ORG_UNIT_TYPE);
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
    const sub = this.organizationUnitService.openCreateDialog().onAfterClose$.subscribe(() => {
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  delete(model: OrgUnit, event: MouseEvent): void {
    event.preventDefault();
    // @ts-ignore
    this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({x: model.getName()})).onAfterClose$
      .subscribe((click: UserClickOn) => {
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

  edit(model: OrgUnit, event: MouseEvent): void {
    event.preventDefault();
    const sub = this.organizationUnitService.openUpdateDialog(model.id).subscribe((dialog: DialogRef) => {
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
        return this.organizationUnitService.load();
      })
    ).subscribe((orgUnits) => {
      this.organizations = orgUnits;
    });
  }
}
