import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Country} from '@app/models/country';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {TableComponent} from '@app/shared/components/table/table.component';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {LangService} from '@app/services/lang.service';
import {CountryService} from '@app/services/country.service';
import {switchMap, tap} from 'rxjs/operators';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ITableOptions} from '@app/interfaces/i-table-options';
import {SortEvent} from '@app/interfaces/sort-event';
import {isEmptyObject} from '@app/helpers/utils';
import {CommonUtils} from '@app/helpers/common-utils';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {SharedService} from '@app/services/shared.service';
import {LookupService} from '@app/services/lookup.service';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {FilterEventTypes} from '@app/types/types';

@Component({
  selector: 'country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit, AfterViewInit {
  @Input() headerTitle: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  @Input() parentCountry?: Country;

  countries: Country[] = [];
  actions: IMenuItem<Country>[] = [];
  bulkActions: IGridAction[] = [];

  @ViewChild('table') table!: TableComponent;

  add$ = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;
  commonStatusEnum = CommonStatusEnum;

  constructor(public langService: LangService,
              private countryService: CountryService,
              private toast: ToastService,
              private dialogService: DialogService,
              private lookupService: LookupService,
              private sharedService: SharedService) {
  }

  tableOptions: ITableOptions = {
    ready: false,
    columns: ['select', 'arName', 'enName', 'riskLevel', 'status', 'statusDateModified', 'actions'],
    searchText: '',
    isSelectedRecords: () => {
      if (!this.tableOptions || !this.tableOptions.ready || !this.table) {
        return false;
      }
      return this.table.selection.selected.length !== 0;
    },
    searchCallback: (record: any, searchText: string) => {
      return record.search(searchText);
    },
    filterCallback: (type: FilterEventTypes = 'OPEN') => {
    },
    sortingCallbacks: {
      statusDateModified: (a: Country, b: Country, dir: SortEvent): number => {
        // @ts-ignore
        let value1 = !CommonUtils.isValidValue(a) ? '' : new Date(a.statusDateModified).valueOf(),
          // @ts-ignore
          value2 = !CommonUtils.isValidValue(b) ? '' : new Date(b.statusDateModified).valueOf();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      statusInfo: (a: Country, b: Country, dir: SortEvent): number => {
        let value1 = !CommonUtils.isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
          value2 = !CommonUtils.isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      }
    }
  };

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
    this.buildActions();
    this.buildBulkActions();
  }

  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.tableOptions.ready = true;
      // if not parent country, hide riskLevel
      if (this.parentCountry) {
        this.tableOptions.columns = this.tableOptions.columns.filter(x => x !== 'riskLevel');
      }
    });
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
    this.addSubscription?.unsubscribe();
  }

  getTitleText(): (keyof ILanguageKeys) {
    return isEmptyObject(this.headerTitle) ? 'menu_countries' : this.headerTitle;
  }

  listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        if (this.parentCountry) {
          return this.countryService.loadCountriesByParentId(this.parentCountry.id);
        }
        return this.countryService.loadCountries();
      })
    ).subscribe((countries: Country[]) => {
      this.countries = countries;
      this.table.selection.clear();
    });
  }

  listenToAdd(): void {
    this.addSubscription = this.add$.pipe(
      tap(() => {
        this.add();
      })
    ).subscribe();
  }

  add(): void {
    const sub = this.countryService.openCreateDialog(this.parentCountry).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe(() => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  editCountry(country: Country, tab: 'basic' | 'cities' = 'basic'): void {
    const sub = this.countryService.openUpdateDialog(country.id, tab).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  deleteCountry(model: Country): void {
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

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.table.selection.selected.length > 0) {
      this.dialogService.confirm(this.langService.map.msg_confirm_delete_selected)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.table.selection.selected.map((item) => {
            return item.id;
          });
          const sub = this.countryService.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.table.selection.selected, 'id', response)
              .subscribe(() => {
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

  activateCountry(model: Country): void {
    const sub = model.updateStatus(CommonStatusEnum.ACTIVATED).subscribe(() => {
      // @ts-ignore
      this.toast.success(this.langService.map.msg_update_x_success.change({x: model.getName()}));
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  deactivateCountry(model: Country): void {
    const sub = model.updateStatus(CommonStatusEnum.DEACTIVATED).subscribe(() => {
      // @ts-ignore
      this.toast.success(this.langService.map.msg_update_x_success.change({x: model.getName()}));
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  changeStatusBulk($event: MouseEvent, newStatus: CommonStatusEnum): void {
    const sub = this.countryService.updateStatusBulk(this.table.selection.selected.map(item => item.id), newStatus)
      .subscribe((response) => {
        this.sharedService.mapBulkResponseMessages(this.table.selection.selected, 'id', response, 'UPDATE')
          .subscribe(() => {
            this.reload$.next(null);
            sub.unsubscribe();
          });
      });
  }

  showCities(country: Country): void {
    this.editCountry(country, 'cities');
  }

  changeBulkParent($event: MouseEvent): void {
    $event.preventDefault();
    if (this.table.selection.selected.length === 0) {
      return;
    }
    const sub = this.countryService.openChangeParentDialog(this.table.selection.selected)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe((_) => {
          this.reload$.next(null);
          sub.unsubscribe();
        });
      });
  }

  private buildActions() {
    // noinspection JSUnusedLocalSymbols
    this.actions = [
      // edit
      {
        type: 'action',
        icon: 'mdi-pen',
        label: 'btn_edit',
        onClick: (item: Country) => this.editCountry(item),
        show: () => {
          return true
        }
      },
      // delete
      /*{
        type: 'action',
        icon: 'mdi-close-box',
        label: 'btn_delete',
        onClick: (item: Country) => this.deleteCountry(item),
        show: (item) => {
          return true
        }
      },*/
      // cities
      {
        type: 'action',
        icon: 'mdi-city',
        label: 'cities',
        onClick: (item: Country) => this.showCities(item),
        show: (item) => {
          return !this.parentCountry;
        }
      },
      // activate
      {
        type: 'action',
        icon: 'mdi-list-status',
        label: 'btn_activate',
        onClick: (item: Country) => this.activateCountry(item),
        show: (item) => {
          return item.status === CommonStatusEnum.DEACTIVATED;
        }
      },
      // deactivate
      {
        type: 'action',
        icon: 'mdi-list-status',
        label: 'btn_deactivate',
        onClick: (item: Country) => this.deactivateCountry(item),
        show: (item) => {
          return item.status === CommonStatusEnum.ACTIVATED;
        }
      }
    ];
  }

  private buildBulkActions() {
    // noinspection JSUnusedLocalSymbols
    this.bulkActions = [
      {
        icon: 'mdi-swap-vertical-bold',
        langKey: 'btn_change_parent',
        callback: ($event: MouseEvent, action: IGridAction) => this.changeBulkParent($event),
        show: (items: Country[]) => {
          return !!this.parentCountry;
        }
      },
      /*{
        icon: 'mdi-close-box',
        langKey: 'btn_delete',
        callback: ($event: MouseEvent, action: IGridAction) => this.deleteBulk($event),
        show: (items: Country[]) => {
          return true;
        }
      },*/
      {
        icon: 'mdi-list-status',
        langKey: 'lbl_status',
        children: [
          {
            langKey: 'btn_activate',
            icon: '',
            callback: ($event: MouseEvent, data?: any) => this.changeStatusBulk($event, CommonStatusEnum.ACTIVATED),
            show: (items: Country[]) => {
              return true;
            }
          },
          {
            langKey: 'btn_deactivate',
            icon: '',
            callback: ($event: MouseEvent, data?: any) => this.changeStatusBulk($event, CommonStatusEnum.DEACTIVATED),
            show: (items: Country[]) => {
              return true;
            }
          }
        ],
      }
    ];
  }

}
