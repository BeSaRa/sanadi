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
import {generateHtmlList, searchInObject} from '../../../helpers/utils';
import {cloneDeep as _deepClone} from 'lodash';
import {IGridAction} from '../../../interfaces/i-grid-action';
import {EmployeeService} from '../../../services/employee.service';

@Component({
  selector: 'app-organization-unit',
  templateUrl: './organization-unit.component.html',
  styleUrls: ['./organization-unit.component.scss']
})
export class OrganizationUnitComponent implements OnInit, OnDestroy, PageComponentInterface<OrgUnit> {
  add$: Subject<any> = new Subject<any>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  search$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  organizations: OrgUnit[] = [];
  organizationsClone: OrgUnit[] = [];
  displayedColumns: string[] = ['rowSelection', 'arName', 'enName', 'phoneNumber1', 'email', 'address', 'status', 'statusDateModified', 'actions']; //orgNationality
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;
  searchSubscription!: Subscription;
  orgUnitTypesList: Lookup[];
  xDeleteMessage = this.langService.map.lbl_organization + ', ' +
    this.langService.map.lbl_org_branches + ', ' + this.langService.map.lbl_org_users;

  selectedRecords: OrgUnit[] = [];
  /*actionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];*/
  actionsList: IGridAction[] = [];

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
              public configService: ConfigurationService) {
    this.orgUnitTypesList = this.lookupService.getByCategory(LookupCategories.ORG_UNIT_TYPE);
  }


  ngOnDestroy(): void {
    this.reloadSubscription.unsubscribe();
    this.addSubscription.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.listenToAdd();
    this.listenToReload();
    this.listenToSearch();
  }

  add(): void {
    const sub = this.organizationUnitService.openCreateDialog().onAfterClose$.subscribe(() => {
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  delete(model: OrgUnit, event: MouseEvent): void {
    event.preventDefault();
    const deleteMsg = this.langService.map.msg_delete_will_change_x_status_to_retired.change({x: this.xDeleteMessage}) + '<br/>' +
      this.langService.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(deleteMsg).onAfterClose$
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

  _mapBulkResponse(resultMap: any, key: string): void {
    const failedRecords: OrgUnit[] = [];
    for (const item of this.selectedRecords) {
      // @ts-ignore
      if (resultMap.hasOwnProperty(item[key]) && !resultMap[item[key]]) {
        failedRecords.push(item);
      }
    }
    if (failedRecords.length === 0) {
      this.toast.success(this.langService.map.msg_delete_success);
    } else if (failedRecords.length === this.selectedRecords.length) {
      this.toast.success(this.langService.map.msg_delete_fail);
    } else {
      const listHtml = generateHtmlList(this.langService.map.msg_delete_success_except, failedRecords.map((item) => item.getName()));
      this.dialogService.info(listHtml.outerHTML);
    }
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      this.dialogService.confirm(this.langService.map.msg_confirm_delete_selected)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.organizationUnitService.deleteBulk(ids).subscribe((response) => {
            this._mapBulkResponse(response, 'id');
            this.reload$.next(null);
            sub.unsubscribe();
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
      this.search$.next(this.search$.value);
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
}
