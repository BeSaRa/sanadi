import {Component, OnDestroy, OnInit} from '@angular/core';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {LangService} from '../../../services/lang.service';
import {DialogService} from '../../../services/dialog.service';
import {ToastService} from '../../../services/toast.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {debounceTime, switchMap, tap} from 'rxjs/operators';
import {OrgUnit} from '../../../models/org-unit';
import {OrganizationUnitService} from '../../../services/organization-unit.service';
import {LookupCategories} from '../../../enums/lookup-categories';
import {Lookup} from '../../../models/lookup';
import {LookupService} from '../../../services/lookup.service';
import {ConfigurationService} from '../../../services/configuration.service';
import {searchInObject} from '../../../helpers/utils';
import {cloneDeep as _deepClone} from 'lodash';
import {IGridAction} from '../../../interfaces/i-grid-action';
import {EmployeeService} from '../../../services/employee.service';
import {SharedService} from '../../../services/shared.service';

@Component({
  selector: 'app-organization-unit',
  templateUrl: './organization-unit.component.html',
  styleUrls: ['./organization-unit.component.scss']
})
export class OrganizationUnitComponent implements OnInit, OnDestroy, PageComponentInterface<OrgUnit> {
  add$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  search$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  internalSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  organizations: OrgUnit[] = [];
  organizationsClone: OrgUnit[] = [];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'phoneNumber1', 'email', 'address', 'status', 'statusDateModified', 'actions']; //orgNationality
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;
  searchSubscription!: Subscription;
  internalSearchSubscription!: Subscription;
  orgUnitTypesList: Lookup[];
  xDeleteMessage = this.langService.map.lbl_organization + ', ' +
    this.langService.map.lbl_org_branches + ', ' + this.langService.map.lbl_org_users;

  selectedRecords: OrgUnit[] = [];
  actionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deactivateBulk($event);
      }
    }
  ];

  private _addSelected(record: OrgUnit): void {
    this.selectedRecords.push(_deepClone(record));
  }

  private _removeSelected(record: OrgUnit): void {
    const index = this.selectedRecords.findIndex((item) => {
      return item.id === record.id;
    });
    this.selectedRecords.splice(index, 1);
  }

  get isIndeterminateSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length < this.organizations.length;
  }

  get isFullSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length === this.organizations.length;
  }

  isSelected(record: OrgUnit): boolean {
    return !!this.selectedRecords.find((item) => {
      return item.id === record.id;
    });
  }

  onSelect($event: Event, record: OrgUnit): void {
    const checkBox = $event.target as HTMLInputElement;
    if (checkBox.checked) {
      this._addSelected(record);
    } else {
      this._removeSelected(record);
    }
  }

  onSelectAll($event: Event): void {
    if (this.selectedRecords.length === this.organizations.length) {
      this.selectedRecords = [];
    } else {
      this.selectedRecords = _deepClone(this.organizations);
    }
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
    this.searchSubscription?.unsubscribe();
    this.internalSearchSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToAdd();
    this.listenToReload();
    this.listenToSearch();
    this.listenToInternalSearch();
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

  deactivate(event: MouseEvent, model: OrgUnit): void {
    event.preventDefault();
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
      this.organizationsClone = orgUnits;
      this.selectedRecords = [];
      this.internalSearch$.next(this.search$.value);
    });
  }

  search(searchText: string): void {
    this.search$.next(searchText);
  }

  private listenToSearch(): void {
    this.searchSubscription = this.search$.pipe(
      debounceTime(500)
    ).subscribe((searchText) => {
      this.organizations = this.organizationsClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }

  private listenToInternalSearch(): void {
    this.internalSearchSubscription = this.internalSearch$.subscribe((searchText) => {
      this.organizations = this.organizationsClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }

  showAuditLogs($event: MouseEvent, organization: OrgUnit): void {
    $event.preventDefault();
    organization.showAuditLogs($event)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe();
      });
  }
}
