import { Component } from '@angular/core';
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

@Component({
  selector: 'training-program',
  templateUrl: './training-program.component.html',
  styleUrls: ['./training-program.component.scss']
})
export class TrainingProgramComponent extends AdminGenericComponent<TrainingProgram, TrainingProgramService>{
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
  displayedColumns: string[] = ['rowSelection', 'activityName', 'trainingType', 'trainingDate', 'registrationDate', 'actions'];
  selectedRecords: TrainingProgram[] = [];
  actionsList: IGridAction[] = [
    {
      langKey: 'btn_delete',
      icon: 'mdi-close-box',
      callback: ($event: MouseEvent) => {
        this.deleteBulk($event);
      }
    }
  ];

  constructor(public lang: LangService,
              public service: TrainingProgramService,
              private dialogService: DialogService,
              private sharedService: SharedService,
              private toast: ToastService) {
    super();
  }

  edit(trainingProgram: TrainingProgram, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(trainingProgram);
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

  filterCallback = (record: any, searchText: string) => {
    return record.search(searchText);
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
