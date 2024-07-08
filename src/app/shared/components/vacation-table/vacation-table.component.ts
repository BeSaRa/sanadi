import { UserPreferencesService } from '@services/user-preferences.service';
import { LangService } from './../../../services/lang.service';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { IHasVacation } from '@app/interfaces/i-has-vacation';
import { ExternalUser } from '@app/models/external-user';
import { InternalUser } from '@app/models/internal-user';
import { UserPreferences } from '@app/models/user-preferences';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { Subject, of } from 'rxjs';
import { take, takeUntil, switchMap, filter } from 'rxjs/operators';
import { CommonUtils } from "@helpers/common-utils";
import { DialogService } from '@app/services/dialog.service';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { UserPreferencesInterceptor } from '@app/model-interceptors/user-preferences-interceptor';

@Component({
  selector: 'vacation-table',
  templateUrl: 'vacation-table.component.html',
  styleUrls: ['vacation-table.component.scss']
})
export class VacationTableComponent implements OnInit, OnDestroy {
  displayedColumns = ['vacationFrom', 'vacationTo', 'actions'];

  ngOnInit(): void {
    this.listenToAdd();
  }

  @Input()
  set model(value: IHasVacation) {
    if (CommonUtils.isValidValue(value.vacationFrom) && CommonUtils.isValidValue(value.vacationTo)) {
      this.list = [value];
    }
    this.vacationModel = value;
  };

  vacationModel!: IHasVacation;
  @Input() user!: InternalUser | ExternalUser;

  @Input() canEditPreferences!: boolean;

  add$: Subject<any> = new Subject<any>();
  destroy$: Subject<void> = new Subject();

  list: IHasVacation[] = [];

  constructor(public lang: LangService,
    public dialogRef: DialogRef,
    private userPreferencesService: UserPreferencesService,
    private dialog: DialogService) {

  }

  openVacationPopup() {
    if (!this.canEditPreferences) {
      return;
    }
    this.vacationModel.openVacationDialog(this.user, this.canEditPreferences).subscribe(dialog => {
      dialog.onAfterClose$.subscribe(model => {
        if (model) {
          this.model = model;
        }
      });
    })
  }

  listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(_ => {
        this.openVacationPopup();
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  actions: IMenuItem<UserPreferences>[] = [
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      disabled: () => !this.canEditPreferences,
      onClick: () => this.openVacationPopup(),
    },
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      disabled: () => !this.canEditPreferences,
      onClick: (item) => this._reset(item),
    }
  ];
  private _reset(model: UserPreferences) {
    this.dialog.confirm(this.lang.map.msg_confirm_continue)
      .onAfterClose$
      .pipe(
        take(1),
        switchMap((click: UserClickOn) => {
          if (click === UserClickOn.YES) {
            return this._resetUserVacation(model);
          }
          return of(null)
        }),
        filter(result=> !!result)

      )
      .subscribe(_ => {
          this.list = [];
      })
  }
  private _resetUserVacation(model: UserPreferences) {

    const { send } = new UserPreferencesInterceptor();
    const resetModel = send(new UserPreferences().clone({
      ...model,
      vacationFrom: null,
      vacationTo: null,
    }));
    return this.userPreferencesService.setVacations(this.user.generalUserId, resetModel)
  }
}
