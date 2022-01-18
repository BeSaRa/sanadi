import {Component, Inject, OnInit} from '@angular/core';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {LangService} from '@app/services/lang.service';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';
import {ServiceDataStep} from '@app/models/service-data-step';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {ChecklistItem} from '@app/models/checklist-item';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {ChecklistService} from '@app/services/checklist.service';
import {catchError, exhaustMap, switchMap, takeUntil} from 'rxjs/operators';
import {UserClickOn} from '@app/enums/user-click-on.enum';

@Component({
  selector: 'checklist-popup',
  templateUrl: './checklist-popup.component.html',
  styleUrls: ['./checklist-popup.component.scss']
})
export class ChecklistPopupComponent implements OnInit {
  operation: OperationTypes;
  serviceDataStep!: ServiceDataStep;
  checklistItems: ChecklistItem[] = [];
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<ChecklistItem> = new Subject<ChecklistItem>();
  destroy$: Subject<any> = new Subject<any>();
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];
  models: ChecklistItem[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<ServiceDataStep>,
              public lang: LangService,
              private dialogService: DialogService,
              private toast: ToastService,
              private service: ChecklistService) {
    this.operation = data.operation;
    this.serviceDataStep = data.model;
  }

  ngOnInit(): void {
    this.listenToAdd();
    this.listenToEdit();
    this.listenToReload();
  }

  listenToAdd() {
    this.add$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap(() => this.service.openAddChecklistItemDialog(this.serviceDataStep.id).onAfterClose$))
      .subscribe(() => {
        this.reload$.next(null);
      });
  }

  listenToEdit(): void {
    this.edit$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((checklist) => this.service.openEditChecklistItemDialog(this.serviceDataStep.id, checklist).onAfterClose$))
      .subscribe(() => {
        this.reload$.next(null);
      });
  }

  edit(checklistItem: ChecklistItem, event: MouseEvent) {
    event.preventDefault();
    this.edit$.next(checklistItem);
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap((_) => {
        let load = this.service.getChecklistByStepId(this.serviceDataStep.id);
        return load.pipe(catchError(_ => of([])));
      }))
      .subscribe((list: ChecklistItem[]) => {
        this.models = list;
      });
  }

  delete(event: MouseEvent, model: ChecklistItem): void {
    event.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload$.next(null);
          sub.unsubscribe();
        });
      }
    });
  }

  get popupTitle(): string {
    return this.lang.map.lbl_checklist;
  };
}
