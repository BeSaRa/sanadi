import {Component, Inject, OnInit} from '@angular/core';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {TrainingProgram} from '@app/models/training-program';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {Trainee} from '@app/models/trainee';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {catchError, exhaustMap, switchMap, takeUntil} from 'rxjs/operators';
import {TraineeService} from '@app/services/trainee.service';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {TraineeData} from '@app/models/trainee-data';

@Component({
  selector: 'training-program-candidates',
  templateUrl: './training-program-candidates-popup.component.html',
  styleUrls: ['./training-program-candidates-popup.component.scss']
})
export class TrainingProgramCandidatesPopupComponent implements OnInit {
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  add$: Subject<any> = new Subject<any>();
  destroy$: Subject<any> = new Subject<any>();
  searchText = '';
  actions: IMenuItem<TrainingProgram>[] = [
    {
      type: 'action',
      label: 'btn_reload',
      icon: 'mdi-reload',
      onClick: _ => this.reload$.next(null),
    }
  ];
  displayedColumns: string[] = ['arName', 'enName', 'department', 'status', 'nationality', 'actions'];
  models: Trainee[] = [];
  trainingProgramId: number;
  operation!: OperationTypes;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<number>,
              public lang: LangService,
              public service: TraineeService,
              private dialogService: DialogService,
              private toast: ToastService) {
    this.operation = data.operation;
    this.trainingProgramId = data.model;
  }

  ngOnInit(): void {
    this.listenToAdd();
    this.listenToReload();
  }

  listenToAdd() {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openAddTrainingProgramCandidateDialog(this.trainingProgramId).onAfterClose$))
      .subscribe(() => {
      this.reload$.next(this.trainingProgramId);
    })
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        let load = this.service.trainingProgramCandidates(this.trainingProgramId);
        return load.pipe(catchError(_ => of([])));
      }))
      .subscribe((list: Trainee[]) => {
        console.log('candidates = ', list);
        this.models = list;
      })
  }

  searchCallback = (record: any, searchText: string) => {
    return record.trainee.search(searchText);
  };

  get popupTitle(): string {
    return this.lang.map.training_program_candidates;
  };

  delete(event: MouseEvent, model: TraineeData): void {
    event.preventDefault();
    const traineeModel = (new Trainee()).clone(model.trainee);
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.trainee.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = traineeModel.deleteTrainee(this.trainingProgramId).subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.trainee.getName()}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }
}
