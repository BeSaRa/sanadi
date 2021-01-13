import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {Localization} from '../../../models/localization';
import {BehaviorSubject, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {DialogService} from '../../../services/dialog.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';

@Component({
  selector: 'app-localization',
  templateUrl: './localization.component.html',
  styleUrls: ['./localization.component.scss']
})
export class LocalizationComponent implements OnInit, OnDestroy {
  localization: Localization[] = [];
  displayedColumns: string[] = ['id', 'arName', 'enName', 'localizationKey', 'actions'];
  private reloadSubscription: Subscription | undefined;
  public reload$ = new BehaviorSubject<any>(null);

  constructor(public langService: LangService, private dialogService: DialogService, public toast: ToastService) {
  }

  private listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        return this.langService.loadLocalization();
      })
    ).subscribe((locals) => {
      this.localization = locals;
    });
  }

  ngOnInit(): void {
    this.localization = this.langService.localization;
    this.listenToReload();
  }

  addLocalization(): void {
    const sub = this.langService.openCreateDialog().onAfterClose.subscribe(() => {
      this.reload$.next(null);
      sub.unsubscribe();
    });
  }

  editLocalization(localization: Localization, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.langService.openUpdateDialog(localization.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose.subscribe((_) => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
    });

  }

  deleteLocalization(localization: Localization, $event: MouseEvent) {
    $event.preventDefault();
    // @ts-ignore
    const sub = this.dialogService.confirm(this.langService.lang.confirm_delete_x.change({x: localization.localizationKey}))
      .onAfterClose
      .subscribe((click: UserClickOn) => {
        sub.unsubscribe();
        if (click === UserClickOn.YES) {
          localization.delete().subscribe(() => {
            this.toast.success(this.langService.lang.delete_x_success);
            this.reload$.next(null);
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
  }
}
