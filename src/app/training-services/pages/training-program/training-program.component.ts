import {Component, OnInit} from '@angular/core';
import {AdminGenericComponent} from '@app/generics/admin-generic-component';
import {TrainingProgram} from '@app/models/training-program';
import {TrainingProgramService} from '@app/services/training-program.service';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {SharedService} from '@app/services/shared.service';
import {ToastService} from '@app/services/toast.service';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {IGridAction} from '@app/interfaces/i-grid-action';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {cloneDeep as _deepClone} from 'lodash';
import {FilterEventTypes} from '@app/types/types';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {CommonUtils} from '@app/helpers/common-utils';
import {ITrainingProgramCriteria} from '@app/interfaces/i-training-program-criteria';
import {catchError, switchMap, takeUntil} from 'rxjs/operators';
import {DateUtils} from '@app/helpers/date-utils';
import {of} from 'rxjs';
import {TrainingStatus} from '@app/enums/training-status';
import {TrainingProgramBriefcaseService} from '@app/services/training-program-briefcase.service';

@Component({
  selector: 'training-program',
  templateUrl: './training-program.component.html',
  styleUrls: ['./training-program.component.scss']
})
export class TrainingProgramComponent extends AdminGenericComponent<TrainingProgram, TrainingProgramService> implements OnInit {
  searchText = '';
  actions: IMenuItem<TrainingProgram>[] = [
    {
      type: 'action',
      label: 'btn_reload',
      icon: 'mdi-reload',
      onClick: _ => this.reload$.next(null),
    },
    {
      type: 'action',
      label: 'btn_edit',
      icon: 'mdi-pen',
      onClick: (trainingProgram) => this.edit$.next(trainingProgram)
    }
  ];
  displayedColumns: string[] = ['rowSelection', 'activityName', 'trainingType', 'trainingStatus', 'trainingDate', 'registrationDate', 'actions'];
  selectedRecords: TrainingProgram[] = [];
  bulkActionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];

  filterCriteria: Partial<ITrainingProgramCriteria> = {};
  trainingStatus = TrainingStatus;

  constructor(public lang: LangService,
              public service: TrainingProgramService,
              private trainingProgramBriefcaseService: TrainingProgramBriefcaseService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService) {
    super();
  }

  ngOnInit(): void {
    this.listenToReload();
    this.listenToAdd();
    this.listenToEdit();
  }

  applyAttendance(trainingProgram: TrainingProgram, event: MouseEvent) {
    event.preventDefault();
    const sub = this.service.openAttendanceDialog(trainingProgram).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        sub.unsubscribe();
      });
    });
  }

  candidates(trainingProgram: TrainingProgram, event: MouseEvent) {
    event.preventDefault();
    const sub = this.service.openOrganizationCandidatesDialog(trainingProgram.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        sub.unsubscribe();
      });
    });
  }

  openTrainingBriefcasesDialog($event: MouseEvent, record: TrainingProgram): void {
    $event.preventDefault();
    const sub = this.trainingProgramBriefcaseService.openTrainingBriefcasesDialog(record).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        sub.unsubscribe();
      });
    });
  }

  edit(trainingProgram: TrainingProgram, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(trainingProgram);
  }

  showAttendance(status: number) {
    return status == this.trainingStatus.TRAINING_FINISHED;
  }

  showAddCandidates(status: number) {
    return status == this.trainingStatus.REGISTRATION_OPEN ||
      status == this.trainingStatus.TRAINING_PUBLISHED ||
      status == this.trainingStatus.EDITING_AFTER_PUBLISHING
  }

  delete(event: MouseEvent, model: TrainingProgram): void {
    event.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.activityName});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.activityName}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }

  deleteBulk($event: MouseEvent): void {
    $event.preventDefault();
    if (this.selectedRecords.length > 0) {
      const message = this.lang.map.msg_confirm_delete_selected;
      this.dialogService.confirm(message)
        .onAfterClose$.subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          const ids = this.selectedRecords.map((item) => {
            return item.id;
          });
          const sub = this.service.deleteBulk(ids).subscribe((response) => {
            this.sharedService.mapBulkResponseMessages(this.selectedRecords, 'id', response)
              .subscribe(() => {
                this.selectedRecords = [];
                this.reload$.next(null);
                sub.unsubscribe();
              });
          });
        }
      });
    }
  }

  searchCallback = (record: any, searchText: string) => {
    return record.search(searchText);
  };

  filterCallback = (type: FilterEventTypes = 'OPEN') => {
    if (type === 'CLEAR') {
      this.filterCriteria = {};
      this.reload$.next(null);
    } else if (type === 'OPEN') {
      this.filterCriteria = this.prepareFilterCriteriaForReceive(this.filterCriteria);
      const sub = this.service.openFilterDialog(this.filterCriteria)
        .subscribe((dialog: DialogRef) => {
          dialog.onAfterClose$.subscribe((result: UserClickOn | Partial<any>) => {
            if (!CommonUtils.isValidValue(result) || result === UserClickOn.CLOSE) {
              return;
            }
            this.filterCriteria = this.prepareFilterCriteriaForSend(result as Partial<ITrainingProgramCriteria>);
            this.reload$.next(null);
            sub.unsubscribe();
          });
        });
    }
  };

  prepareFilterCriteriaForSend(criteria: Partial<ITrainingProgramCriteria>) {
    if (criteria.targetOrganizationListIds && criteria.targetOrganizationListIds.length > 0) {
      criteria.targetOrganizationList = JSON.stringify(criteria.targetOrganizationListIds);
    }
    delete criteria.targetOrganizationListIds;
    criteria = this.deleteEmptyProperties(criteria);

    return criteria;
  }

  prepareFilterCriteriaForReceive(criteria: Partial<ITrainingProgramCriteria>) {
    if (criteria.targetOrganizationList) {
      criteria.targetOrganizationListIds = JSON.parse(this.filterCriteria.targetOrganizationList!);
    }
    if (criteria.startFromDate) {
      criteria.startFromDate = DateUtils.changeDateToDatepicker(this.filterCriteria.startFromDate);
    }
    if (criteria.startToDate) {
      criteria.startToDate = DateUtils.changeDateToDatepicker(this.filterCriteria.startToDate);
    }
    if (criteria.registerationFromDate) {
      criteria.registerationFromDate = DateUtils.changeDateToDatepicker(this.filterCriteria.registerationFromDate);
    }
    if (criteria.registerationToDate) {
      criteria.registerationToDate = DateUtils.changeDateToDatepicker(this.filterCriteria.registerationToDate);
    }

    return criteria;
  }

  deleteEmptyProperties(obj: any) {
    for (let propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined) {
        delete obj[propName];
      }
    }
    return obj;
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap(() => {
        const load = this.service.filterTrainingPrograms(this.filterCriteria);
        return load.pipe(catchError(_ => of([])));
      }))
      .subscribe((list: TrainingProgram[]) => {
        this.models = list;
      });
  }

  private _addSelected(record: TrainingProgram): void {
    this.selectedRecords.push(_deepClone(record));
  }

  private _removeSelected(record: TrainingProgram): void {
    const index = this.selectedRecords.findIndex((item) => {
      return item.id === record.id;
    });
    this.selectedRecords.splice(index, 1);
  }

  get isIndeterminateSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length < this.models.length;
  }

  get isFullSelection(): boolean {
    return this.selectedRecords.length > 0 && this.selectedRecords.length === this.models.length;
  }

  isSelected(record: TrainingProgram): boolean {
    return !!this.selectedRecords.find((item) => {
      return item.id === record.id;
    });
  }

  onSelect($event: Event, record: TrainingProgram): void {
    const checkBox = $event.target as HTMLInputElement;
    if (checkBox.checked) {
      this._addSelected(record);
    } else {
      this._removeSelected(record);
    }
  }

  onSelectAll(): void {
    if (this.selectedRecords.length === this.models.length) {
      this.selectedRecords = [];
    } else {
      this.selectedRecords = _deepClone(this.models);
    }
  }
}
