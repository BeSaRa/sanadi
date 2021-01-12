import {Component, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {Localization} from '../../../models/localization';
import {BehaviorSubject, Subscription} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../../shared/models/dialog-ref';

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

  constructor(public lang: LangService, public toast: ToastService) {
  }

  private listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(
      switchMap(() => {
        return this.lang.loadLocalization();
      })
    ).subscribe((locals) => {
      this.localization = locals;
    });
  }

  ngOnInit(): void {
    this.localization = this.lang.localization;
    this.listenToReload();
  }

  addNewLocalization(): void {
    // this.dialog.show(LocalizationPopupComponent, {localization: new Localization(), editMode: false}, {escToClose: true});
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
  }

  editLocalization(id: number, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.lang.editLocal(id)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose.subscribe((_) => {
          this.reload$.next(null);
          sub.unsubscribe();
        });
      });

  }
}
