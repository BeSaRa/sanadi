import { Component } from '@angular/core';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { TrainingProgram } from '@app/models/training-program';
import { AdminGenericComponent } from '@app/generics/admin-generic-component';
import { TrainingProgramService } from '@app/services/training-program.service';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { catchError, exhaustMap, filter, switchMap, takeUntil } from 'rxjs/operators';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { TrainingStatus } from '@app/enums/training-status';
import { TrainingProgramBriefcaseService } from '@app/services/training-program-briefcase.service';
import { OperationTypes } from '@app/enums/operation-types.enum';

@Component({
  selector: 'available-programs',
  templateUrl: './available-programs.component.html',
  styleUrls: ['./available-programs.component.scss']
})
export class AvailableProgramsComponent extends AdminGenericComponent<TrainingProgram, TrainingProgramService> {
  prepareFilterModel(): Partial<TrainingProgram> {
    throw new Error('Method not implemented.');
  }
  view$: Subject<TrainingProgram> = new Subject<TrainingProgram>();
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  searchText = '';
  actions: IMenuItem<TrainingProgram>[] = [
    {
      type: 'action',
      label: 'btn_reload',
      icon: 'mdi-reload',
      onClick: _ => this.reload$.next(null),
    }
  ];
  displayedColumns: string[] = ['activityName', 'trainingType', 'trainingStatus', 'trainingDate', 'registrationDate', 'actions'];
  trainingProgramStatus = TrainingStatus;

  constructor(public lang: LangService,
              public service: TrainingProgramService,
              private trainingProgramBriefcaseService: TrainingProgramBriefcaseService) {
    super();
  }

  ngOnInit() {
    this.listenToReload();
    super.listenToAdd();
    super.listenToEdit();
    this.listenToView();
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        const load = this.service.loadCharityPrograms();
        return load.pipe(catchError(_ => of([])));
      }))
      .subscribe((list: TrainingProgram[]) => {
        this.models = list;
      });
  }

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((model) => {
        return this.service.viewDialog(model).pipe(catchError(_ => of(null)));
      }))
      .pipe(filter((dialog): dialog is DialogRef => !!dialog))
      .pipe(switchMap(dialog => dialog.onAfterClose$))
      .subscribe(() => this.reload$.next(null))
  }

  searchCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  };

  candidates(trainingProgram: TrainingProgram, event: MouseEvent) {
    event.preventDefault();
    const sub = this.service.openOrganizationCandidatesDialog(trainingProgram).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        sub.unsubscribe();
      });
    });
  }

  onDownloadCertificatesClicked(trainingProgram: TrainingProgram, event: MouseEvent) {
    event.preventDefault();
    const sub = this.service.openDownloadCertificatesDialog(trainingProgram.id)
      .pipe(takeUntil(this.destroy$))
      .pipe(switchMap((dialogRef) => {
        return dialogRef.onAfterClose$;
      }))
      .subscribe((userClick: UserClickOn) => {
        if (userClick == UserClickOn.YES) {
          // this.dialogRef.close();
        }
        sub.unsubscribe();
      });
  }

  view(trainingProgram: TrainingProgram, event: MouseEvent) {
    event.preventDefault();
    this.view$.next(trainingProgram);
  }

  openTrainingBriefcaseDialog($event: MouseEvent, record: TrainingProgram): void {
    $event.preventDefault();
    const sub = this.trainingProgramBriefcaseService.openTrainingBriefcaseDialog(record, OperationTypes.VIEW).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        sub.unsubscribe();
      });
    });
  }

  viewCandidatesStatus(trainingProgram: TrainingProgram, event: MouseEvent) {
    event.preventDefault();
    const sub = this.service.openViewCandidatesStatusDialog(trainingProgram.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        sub.unsubscribe();
      });
    });
  }

  setStatusColumnClass(status: number) {
    switch (status) {
      case this.trainingProgramStatus.REGISTRATION_OPEN:
        return {'status-container': true, 'open-for-registration-status': true};
      case this.trainingProgramStatus.REGISTRATION_CLOSED:
        return {'status-container': true, 'closed-for-registration-status': true};
      case this.trainingProgramStatus.TRAINING_FINISHED:
        return {'status-container': true, 'finished-status': true};
      case this.trainingProgramStatus.TRAINING_CANCELED:
        return {'status-container': true, 'canceled-status': true};
      default:
        return {};
    }
  }
}
