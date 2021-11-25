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
import {catchError, switchMap, takeUntil} from 'rxjs/operators';
import {TraineeService} from '@app/services/trainee.service';
import {EmployeeService} from '@app/services/employee.service';

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
  displayedColumns: string[] = ['arName', 'enName', 'department', 'currentJob', 'nationality', 'actions'];
  models: Trainee[] = [];
  trainingProgramId: number;
  operation!: OperationTypes;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<number>,
              public lang: LangService,
              public service: TraineeService,
              private dialogService: DialogService,
              private toast: ToastService,
              private employeeService: EmployeeService) {
    this.operation = data.operation;
    this.trainingProgramId = data.model;
  }

  ngOnInit(): void {
    this.listenToAdd();
    this.listenToReload();
  }

  listenToAdd() {
    this.add$.subscribe(() => {
      this.service.openAddTrainingProgramCandidateDialog(this.trainingProgramId);
    })
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        // const load = this.service.loadAvailablePrograms(); // to be uncommented
        let load = this.employeeService.isInternalUser() ? of([new Trainee(), new Trainee()]) : of([new Trainee(), new Trainee(), new Trainee()])
        // const load = this.service.loadComposite();
        return load.pipe(catchError(_ => of([])));
      }))
      .subscribe((list: Trainee[]) => {
        this.models = list;
      })
  }

  searchCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  };

  get popupTitle(): string {
    return this.lang.map.menu_training_programs;
  };
}
