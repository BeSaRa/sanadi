import {Component, Input, OnInit} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {FollowupConfiguration} from '@app/models/followup-configuration';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {FollowupConfigurationService} from '@app/services/followup-configuration.service';
import {LangService} from '@app/services/lang.service';
import {ServiceData} from '@app/models/service-data';
import {catchError, exhaustMap, filter, switchMap, takeUntil, tap} from 'rxjs/operators';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';

@Component({
  selector: 'followup-configuration',
  templateUrl: './followup-configuration.component.html',
  styleUrls: ['./followup-configuration.component.scss']
})
export class FollowupConfigurationComponent extends AdminGenericComponent<FollowupConfiguration, FollowupConfigurationService> {
  actions: IMenuItem<FollowupConfiguration>[] = [];
  displayedColumns: string[] = ['name', 'followUpType', 'requestType', 'responsibleTeamId', 'concernedTeamId', 'days', 'actions'];
  searchText = '';
  add$: Subject<any> = new Subject<any>();
  @Input() serviceData!: ServiceData;

  constructor(public lang: LangService,
              public service: FollowupConfigurationService,
              private dialog: DialogService,
              private toast: ToastService) {
    super();
  }

  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  };

  _init() {
    this.reload$.next(this.serviceData.caseType);
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap((caseType: number) => {
        return this.service.getByCaseType(caseType);
      }))
      .subscribe((list: FollowupConfiguration[]) => {
        this.models = list;
      });
  }

  edit(model: FollowupConfiguration, $event: MouseEvent) {
    $event.preventDefault();
    this.edit$.next(model);
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return (this.useCompositeToEdit ?
          this.service.editDialogComposite(model).pipe(catchError(_ => of(null))) :
          this.service.editDialog(model).pipe(catchError(_ => of(null))));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(this.serviceData.caseType));
  }

  listenToAdd(): void {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => {
        const result = this.service.addDialogWithDefaults(this.serviceData.id, this.serviceData.caseType);
        if (result instanceof DialogRef) {
          return result.onAfterClose$;
        } else {
          return result.pipe(switchMap(ref => ref.onAfterClose$));
        }
      }))
      .subscribe(() => this.reload$.next(this.serviceData.caseType));
  }

  delete(model: FollowupConfiguration, $event: MouseEvent) {
    $event.preventDefault();
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialog.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload$.next(this.serviceData.caseType);
          sub.unsubscribe();
        });
      }
    });
  }
}
