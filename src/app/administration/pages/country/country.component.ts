import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {Country} from '../../../models/country';
import {IMenuItem} from '../../../modules/context-menu/interfaces/i-menu-item';
import {IGridAction} from '../../../interfaces/i-grid-action';
import {TableComponent} from '../../../shared/components/table/table.component';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {LangService} from '../../../services/lang.service';
import {CountryService} from '../../../services/country.service';
import {switchMap, tap} from 'rxjs/operators';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {ITableOptions} from '../../../interfaces/i-table-options';
import {SortEvent} from '../../../interfaces/sort-event';
import {isEmptyObject, isValidValue} from '../../../helpers/utils';
import {CommonUtils} from '../../../helpers/common-utils';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {DialogService} from '../../../services/dialog.service';
import {ToastService} from '../../../services/toast.service';
import {SharedService} from '../../../services/shared.service';

@Component({
  selector: 'country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit, AfterViewInit {
  @Input() headerTitle: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  @Input() parentCountry?: Country;

  countries: Country[] = [];
  actions: IMenuItem[] = [];
  bulkActions: IGridAction[] = [];

  @ViewChild('table') table!: TableComponent;

  add$ = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;

  constructor(public langService: LangService,
              private countryService: CountryService,
              private toast: ToastService,
              private dialogService: DialogService,
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
    filterCallback: (record: any, searchText: string) => {
      return record.search(searchText);
    },
    sortingCallbacks: {
      statusDateModified: (a: Country, b: Country, dir: SortEvent): number => {
        // @ts-ignore
        let value1 = !isValidValue(a) ? '' : new Date(a.statusDateModified).valueOf(),
          // @ts-ignore
          value2 = !isValidValue(b) ? '' : new Date(b.statusDateModified).valueOf();
        return CommonUtils.getSortValue(value1, value2, dir.direction);
      },
      statusInfo: (a: Country, b: Country, dir: SortEvent): number => {
        let value1 = !isValidValue(a) ? '' : a.statusInfo?.getName().toLowerCase(),
          value2 = !isValidValue(b) ? '' : b.statusInfo?.getName().toLowerCase();
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
      {
        type: 'action',
        icon: 'mdi-close-box',
        label: 'btn_delete',
        onClick: (item: Country) => this.deleteCountry(item),
        show: () => {
          return true
        }
      },
      // cities
      {
        type: 'action',
        icon: 'mdi-city',
        label: 'cities',
        onClick: (item: Country) => this.showCities(item),
        show: () => {
          return !this.parentCountry;
        }
      }
    ];
  }

  private buildBulkActions() {
    this.bulkActions = [
      {
        icon: 'mdi-swap-vertical-bold',
        langKey: 'btn_change_parent',
        callback: ($event: MouseEvent, action: IGridAction) => this.changeBulkParent($event),
        show: (items: Country[]) => {
          return !!this.parentCountry;
        }
      },
      {
        icon: 'mdi-close-box',
        langKey: 'btn_delete',
        callback: ($event: MouseEvent, action: IGridAction) => this.deleteBulk($event),
        show: (items: Country[]) => {
          return true;
        }
      }
    ];
  }

}
