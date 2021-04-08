import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {Localization} from '../../../models/localization';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {debounceTime, switchMap, tap} from 'rxjs/operators';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {DialogService} from '../../../services/dialog.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {filterList, searchInObject} from '../../../helpers/utils';
import {IKeyValue} from '../../../interfaces/i-key-value';

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  styleUrls: ['./localization.component.scss']
})
export class LocalizationComponent implements OnInit, OnDestroy, PageComponentInterface<Localization> {
  localization: Localization[] = [];
  localizationsClone: Localization[] = [];
  displayedColumns: string[] = ['localizationKey', 'arName', 'enName', 'actions'];
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;
  searchSubscription!: Subscription;
  internalSearchSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  add$ = new Subject<any>();
  search$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  internalSearch$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(public langService: LangService, private dialogService: DialogService, public toast: ToastService) {

  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
    this.listenToSearch();
    this.listenToInternalSearch();
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
    this.addSubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
    this.internalSearchSubscription?.unsubscribe();
  }

  listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        return this.langService.load();
      })
    ).subscribe((locals) => {
      this.localization = locals;
      this.localizationsClone = locals.slice();
      this.internalSearch$.next(this.search$.value);
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
    const sub = this.langService.openCreateDialog().onAfterClose$.subscribe(() => {
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  edit(localization: Localization, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.langService.openUpdateDialog(localization.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });

  }

  delete(localization: Localization, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({x: localization.localizationKey}))
      .onAfterClose$
      .subscribe((click: UserClickOn) => {
        sub.unsubscribe();
        if (click === UserClickOn.YES) {
          localization.delete().subscribe(() => {
            this.toast.success(this.langService.map.msg_delete_x_success.change({x: localization.localizationKey}));
            this.reload$.next(null);
          });
        }
      });
  }

  search(searchText: string): void {
    this.search$.next(searchText);
  }

  private listenToSearch(): void {
    this.searchSubscription = this.search$.pipe(
      debounceTime(500)
    ).subscribe((searchText) => {
      this.localization = this.localizationsClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }

  private listenToInternalSearch(): void {
    this.internalSearchSubscription = this.internalSearch$.subscribe((searchText) => {
      this.localization = this.localizationsClone.slice().filter((item) => {
        return searchInObject(item, searchText);
      });
    });
  }
}
