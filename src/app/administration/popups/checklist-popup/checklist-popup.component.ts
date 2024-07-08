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
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {UntypedFormControl} from '@angular/forms';

@Component({
  selector: 'checklist-popup',
  templateUrl: './checklist-popup.component.html',
  styleUrls: ['./checklist-popup.component.scss']
})
export class ChecklistPopupComponent implements OnInit {

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<ServiceDataStep>,
              public lang: LangService,
              private dialogService: DialogService,
              private toast: ToastService,
              private service: ChecklistService) {
    this.operation = data.operation;
    this.serviceDataStep = data.model;
  }

  operation: OperationTypes;
  serviceDataStep!: ServiceDataStep;
  checklistItems: ChecklistItem[] = [];
  reload$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  add$: Subject<any> = new Subject<any>();
  edit$: Subject<ChecklistItem> = new Subject<ChecklistItem>();
  view$: Subject<ChecklistItem> = new Subject<ChecklistItem>();
  destroy$: Subject<void> = new Subject();
  displayedColumns: string[] = ['arName', 'enName', 'status', 'actions'];
  models: ChecklistItem[] = [];
  filterControl: UntypedFormControl = new UntypedFormControl('');
  actions: IMenuItem<ChecklistItem>[] = [
    // edit
    {
      type: 'action',
      label: 'btn_edit',
      icon: ActionIconsEnum.EDIT,
      show: () => !this.readonly,
      onClick: (item: ChecklistItem) => this.edit$.next(item)
    },
    // view
    {
      type: 'action',
      label: 'view',
      icon: ActionIconsEnum.VIEW,
      show: () => this.readonly,
      onClick: (item: ChecklistItem) => this.view$.next(item)
    },
    // delete
    {
      type: 'action',
      label: 'btn_delete',
      icon: ActionIconsEnum.DELETE,
      show: () => !this.readonly,
      onClick: (item: ChecklistItem) => this.delete(item)
    },
  ];

  ngOnInit(): void {
    this.listenToAdd();
    this.listenToEdit();
    this.listenToView();
    this.listenToReload();
  }

  get readonly(): boolean {
    return this.operation === OperationTypes.VIEW;
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

  listenToView(): void {
    this.view$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((checklist) => this.service.openViewChecklistItemDialog(this.serviceDataStep.id, checklist).onAfterClose$))
      .subscribe(() => {
        this.reload$.next(null);
      });
  }

  listenToReload() {
    this.reload$
      .pipe(takeUntil((this.destroy$)))
      .pipe(switchMap((_) => {
        let load = this.service.getChecklistByStepId(this.serviceDataStep.id);
        return load.pipe(catchError(_ => of([])));
      }))
      .subscribe((list: ChecklistItem[]) => {
        this.models = list.sort(this.sortByOrder);
      });
  }

  delete(model: ChecklistItem): void {
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

  sortByOrder = (a: ChecklistItem, b: ChecklistItem) => {
    if (a.stepOrder < b.stepOrder)
      return -1;
    if (a.stepOrder > b.stepOrder)
      return 1;
    return 0;
  };
}
