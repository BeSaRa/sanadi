import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {PageComponentInterface} from '../../../interfaces/page-component-interface';
import {AidLookup} from '../../../models/aid-lookup';
import {BehaviorSubject, Subject, Subscription} from 'rxjs';
import {LangService} from '../../../services/lang.service';
import {DialogService} from '../../../services/dialog.service';
import {ToastService} from '../../../services/toast.service';
import {switchMap, tap} from 'rxjs/operators';
import {AidLookupService} from '../../../services/aid-lookup.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {AidTypes} from '../../../enums/aid-types.enum';
import {IAidLookupCriteria} from '../../../interfaces/i-aid-lookup-criteria';

@Component({
  selector: 'app-aid-lookup',
  templateUrl: './aid-lookup.component.html',
  styleUrls: ['./aid-lookup.component.scss']
})
export class AidLookupComponent implements OnInit, OnDestroy, PageComponentInterface<AidLookup> {
  @Input() aidType!: number;
  @Input() parentId!: number;

  aidLookups: AidLookup[] = [];
  displayedColumns: string[] = ['id', 'aidCode', 'arName', 'enName', 'status', 'actions'];
  add$ = new Subject<any>();
  addSubscription!: Subscription;
  reload$ = new BehaviorSubject<any>(null);
  reloadSubscription!: Subscription;

  constructor(public langService: LangService, private dialogService: DialogService,
              public toast: ToastService, public aidLookupService: AidLookupService) {
  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
  }

  listenToAdd(): void {
    this.addSubscription = this.add$.pipe(tap(() => {
      this.add();
    })).subscribe();

  }

  listenToReload(): void {
    this.reloadSubscription = this.reload$.pipe(switchMap(() => {
      if (this.aidType === AidTypes.CLASSIFICATIONS) {
        return this.aidLookupService.load();
      } else {
        // TODO if status empty the BE default status true
        const criteria: IAidLookupCriteria = {aidType: this.aidType, parent: this.parentId, status: true};
        return this.aidLookupService.getByCriteria(criteria);
      }
    })).subscribe(aidLookups => {
      this.aidLookups = aidLookups;
    });
  }

  add(): void {
    const sub = this.aidLookupService.openCreateDialog(this.aidType, this.parentId)
      .onAfterClose$.subscribe(() => {
        this.reload$.next(null);
        sub.unsubscribe();
      });
  }

  edit(aidLookup: AidLookup, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.aidLookupService.openUpdateDialog(aidLookup.id, this.aidType)
      .subscribe((dialog: DialogRef) => {
        dialog.onAfterClose$.subscribe((_) => {
          this.reload$.next(null);
          sub.unsubscribe();
        });
      });
  }


  delete(aidLookup: AidLookup, $event: MouseEvent): void {
    $event.preventDefault();
    // @ts-ignore
    const sub = this.dialogService.confirm(this.langService.map.msg_confirm_delete_x.change({x: aidLookup.aidCode}))
      .onAfterClose$
      .subscribe((click: UserClickOn) => {
        sub.unsubscribe();
        if (click === UserClickOn.YES) {
          aidLookup.delete().subscribe(() => {
            this.toast.success(this.langService.map.msg_delete_x_success);
            this.reload$.next(null);
          });
        }
      });
  }


  updateStatus(aidLookup: AidLookup) {
    const sub = aidLookup.toggleStatus().update().subscribe(() => {
      // @ts-ignore
      this.toast.success(this.langService.map.status_x_updated_success.change({x: aidLookup.getName()}));
      sub.unsubscribe();
    }, () => {
      // @ts-ignore
      this.toast.error(this.langService.map.status_x_updated_fail.change({x: aidLookup.getName()}));
      aidLookup.toggleStatus();
      sub.unsubscribe();
    });
  }

  getTitleText(): string {
    let title!: string;
    switch (this.aidType) {
      case AidTypes.CLASSIFICATIONS:
        title = 'menu_aid_class';
        break;
      case AidTypes.MAIN_CATEGORY:
        title = 'menu_aid_main_category';
        break;
      case AidTypes.SUB_CATEGORY:
        title = 'menu_aid_sub_category';
        break;
    }

    return title;
  }

  ngOnDestroy(): void {
    this.reloadSubscription?.unsubscribe();
    this.addSubscription?.unsubscribe();
  }
}
