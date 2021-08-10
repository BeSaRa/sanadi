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

@Component({
  selector: 'country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent implements OnInit, AfterViewInit {
  @Input() headerTitle: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  @Input() parent?: Country;

  countries: Country[] = [];
  actions: IMenuItem[] = [];
  bulkActions: IGridAction[] = [];

  @ViewChild('table') table!: TableComponent;

  add$ = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;

  constructor(public langService: LangService,
              private countryService: CountryService) {
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
        console.log('status', value1, value2);
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
        if (this.parent) {
          return this.countryService.loadCountriesByParentId(this.parent.id);
        }
        return this.countryService.loadCountries();
      })
    ).subscribe((countries: Country[]) => {
      this.countries = countries;
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
    const sub = this.countryService.openCreateDialog(this.parent).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe(() => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });
  }

  editCountry(country: Country): void {
    const sub = this.countryService.openUpdateDialog(country.id).subscribe((dialog: DialogRef) => {
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
      }
    ];
  }

  private buildBulkActions() {
    this.bulkActions = [];
  }

}
