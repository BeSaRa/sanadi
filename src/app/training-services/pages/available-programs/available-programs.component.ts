import {Component} from '@angular/core';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {TrainingProgram} from '@app/models/training-program';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {TrainingProgramService} from '@app/services/training-program.service';
import {LangService} from '@app/services/lang.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {BehaviorSubject, of} from 'rxjs';
import {catchError, switchMap, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'available-programs',
  templateUrl: './available-programs.component.html',
  styleUrls: ['./available-programs.component.scss']
})
export class AvailableProgramsComponent extends AdminGenericComponent<TrainingProgram, TrainingProgramService> {
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

  constructor(public lang: LangService,
              public service: TrainingProgramService) {
    super();
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        // const load = this.service.loadAvailablePrograms(); // to be uncommented
        const load = this.service.loadAvailablePrograms();
        return load.pipe(catchError(_ => of([])));
      }))
      .subscribe((list: TrainingProgram[]) => {
        this.models = list;
      })
  }

  searchCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  };

  candidates(trainingProgram: TrainingProgram, event: MouseEvent) {
    event.preventDefault();
    const sub = this.service.openOrganizationCandidatesDialog(trainingProgram.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        sub.unsubscribe();
      });
    });
  }
}
