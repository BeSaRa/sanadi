import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {Localization} from '../../../models/localization';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {DialogService} from '../../../services/dialog.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  styleUrls: ['./localization.component.scss']
})
export class LocalizationComponent implements OnInit, OnDestroy, PageComponentInterface<Localization> {
  localization: Localization[] = [];
  displayedColumns: string[] = ['id', 'localizationKey', 'arName', 'enName', 'actions'];
  reloadSubscription!: Subscription;
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  add$ = new Subject<any>();

  constructor(public langService: LangService, private dialogService: DialogService, public toast: ToastService) {

  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
    this.addSubscription?.unsubscribe();
  }

  listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        return this.langService.load();
      })
    ).subscribe((locals) => {
      this.localization = locals;
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
    // @ts-ignore
    const sub = this.dialogService.confirm(this.langService.map.confirm_delete_x.change({x: localization.localizationKey}))
      .onAfterClose$
      .subscribe((click: UserClickOn) => {
        sub.unsubscribe();
        if (click === UserClickOn.YES) {
          localization.delete().subscribe(() => {
            this.toast.success(this.langService.map.delete_x_success);
            this.reload$.next(null);
          });
        }
      });
  }
}
