import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {PageComponentInterface} from '@app/interfaces/page-component-interface';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {switchMap, tap} from 'rxjs/operators';
import {OrgUnit} from '@app/models/org-unit';
import {OrganizationUnitService} from '@app/services/organization-unit.service';
import {LookupCategories} from '@app/enums/lookup-categories';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {ConfigurationService} from '@app/services/configuration.service';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {EmployeeService} from '@app/services/employee.service';
import {SharedService} from '@app/services/shared.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {TableComponent} from '@app/shared/components/table/table.component';
import {SortEvent} from '@app/interfaces/sort-event';
import {CommonUtils} from '@app/helpers/common-utils';
import {FormControl} from '@angular/forms';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {OrgStatusEnum} from '@app/enums/status.enum';

@Component({
  selector: 'app-organization-unit',
  templateUrl: './organization-unit.component.html',
  styleUrls: ['./organization-unit.component.scss']
})
export class OrganizationUnitComponent implements OnInit, OnDestroy, PageComponentInterface<OrgUnit> {
  add$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  organizations: OrgUnit[] = [];
  organizationsClone: OrgUnit[] = [];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'phoneNumber1', 'email', 'address', 'status', 'statusDateModified', 'actions']; //orgNationality
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;
  orgUnitTypesList: Lookup[];
  xDeleteMessage = this.langService.map.lbl_organization + ', ' +
    this.langService.map.lbl_org_branches + ', ' + this.langService.map.lbl_org_users;
  commonStatus = CommonStatusEnum;
  orgStatusEnum = OrgStatusEnum;

  @ViewChild('table') table!: TableComponent;
  filterControl: FormControl = new FormControl('');

  actionsList: IMenuItem<OrgUnit>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (item: OrgUnit) => this.edit(item),
      show: (item: OrgUnit) => {
        return this.empService.checkPermissions('ADMIN_EDIT_OU');
      }
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: 'mdi-close-box',
      onClick: (item: OrgUnit) => this.deactivate(item),
      show: (item: OrgUnit) => {
        return this.empService.checkPermissions('ADMIN_DELETE_OU');
      }
    },
    // logs
    {
      type: 'action',
      icon: 'mdi-view-list-outline',
      label: 'logs',
      onClick: (item: OrgUnit) => this.showAuditLogs(item)
    },
    // activate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_activate',
      onClick: (item: OrgUnit) => this.toggleStatus(item),
      show: (item) => {
        return item.status !== OrgStatusEnum.RETIRED && item.status === OrgStatusEnum.INACTIVE;
      }
    },
    // deactivate
    {
      type: 'action',
      icon: 'mdi-list-status',
      label: 'btn_deactivate',
      onClick: (item: OrgUnit) => this.toggleStatus(item),
      show: (item) => {
        return item.status !== OrgStatusEnum.RETIRED && item.status === OrgStatusEnum.ACTIVE;
      }
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
    status: (a: OrgUnit, b: OrgUnit, dir: SortEvent): number => {
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
              private organizationUnitService: OrganizationUnitService,
              public lookupService: LookupService,
              private toast: ToastService,
              public empService: EmployeeService,
              public configService: ConfigurationService,
              private sharedService: SharedService) {
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
    return;
  }

  deactivate(model: OrgUnit, event?: MouseEvent): void {
    event?.preventDefault();
    const message = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.xDeleteMessage}) + '<br/>' +
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
      const message = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.xDeleteMessage}) + '<br/>' +
        this.langService.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });

          const sub = this.organizationUnitService.deactivateBulk(ids).subscribe((response) => {
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

  edit(model: OrgUnit, event?: MouseEvent): void {
    event?.preventDefault();
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
      this.organizationsClone = orgUnits;
      this.table.selection.clear();
    });
  }

  showAuditLogs(organization: OrgUnit, $event?: MouseEvent): void {
    $event?.preventDefault();
    organization.showAuditLogs()
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }

  toggleStatus(orgUnit: OrgUnit) {
    this.organizationUnitService.updateStatus(orgUnit.id, orgUnit.status!)
      .subscribe(() => {
        this.toast.success(this.langService.map.msg_status_x_updated_success.change({x: orgUnit.getName()}));
        this.reload$.next(null);
      }, () => {
        this.toast.error(this.langService.map.msg_status_x_updated_fail.change({x: orgUnit.getName()}));
        this.reload$.next(null);
      });
  }
}
