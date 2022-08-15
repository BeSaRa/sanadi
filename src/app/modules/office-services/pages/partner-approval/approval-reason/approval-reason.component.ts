import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {ToastService} from "@app/services/toast.service";
import {DialogService} from "@app/services/dialog.service";
import {AbstractControl, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {ReadinessStatus} from "@app/types/types";
import {BehaviorSubject, Subject} from "rxjs";
import {filter, map, take, takeUntil} from "rxjs/operators";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {ApprovalReason} from "@app/models/approval-reason";

@Component({
  selector: 'approval-reason',
  templateUrl: './approval-reason.component.html',
  styleUrls: ['./approval-reason.component.scss']
})
export class ApprovalReasonComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private fb: UntypedFormBuilder) {
  }

  private _list: ApprovalReason[] = [];
  @Input() set list(list: ApprovalReason[]) {
    this._list = list;
    this.dataSource.next(this._list);
  }

  get list(): ApprovalReason[] {
    return this._list;
  }
  @Input() readonly : boolean = false;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<ApprovalReason[]> = new BehaviorSubject<ApprovalReason[]>([]);
  columns = ['projects', 'research', 'fieldVisit', 'description', 'actions'];

  editIndex: number = -1;
  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<ApprovalReason | null> = new Subject<ApprovalReason | null>();
  private current?: ApprovalReason;
  private destroy$: Subject<any> = new Subject<any>();

  form!: UntypedFormGroup;

  ngOnInit(): void {
    this._handleInitData();
    this.buildForm();
    this.listenToAdd();
    this.listenToChange();
    this.listenToSave();
    this._setComponentReadiness('READY');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private _handleInitData() {
  }

  private buildForm() {
    this.form = this.fb.group({
      approvalReasons: this.fb.array([])
    })
  }

  get approvalReasonsFormArray(): UntypedFormArray {
    return (this.form.get('approvalReasons')) as UntypedFormArray;
  }

  addAllowed(): boolean {
    return !this.readonly;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.changed$.next(new ApprovalReason())
      })
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$))
      .subscribe(approvalReason => {
        if (this.readonly) {
          return;
        }
        this.current = approvalReason || undefined;
        this.updateForm(this.current);
      })
  }

  private updateForm(record: ApprovalReason | undefined) {
    const approvalReasonsFormArray = this.approvalReasonsFormArray;
    approvalReasonsFormArray.clear();

    if (record) {
      this._setComponentReadiness('NOT_READY');
      approvalReasonsFormArray.push(this.fb.group((record.getApprovalReasonFields(true))));
    } else {
      this._setComponentReadiness('READY');
    }
  }

  save() {
    if (this.readonly) {
      return;
    }
    this.save$.next();
  }

  private listenToSave() {
    const form$ = this.save$.pipe(map(() => {
      return this.form.get('approvalReasons.0') as AbstractControl;
    }));

    const validForm$ = form$.pipe(filter((form) => form.valid));
    const invalidForm$ = form$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.form.get('approvalReasons')?.markAllAsTouched();
        });
    });

    validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return (this.form.get('approvalReasons.0')) as UntypedFormArray;
      }),
      map((form) => {
        return (new ApprovalReason()).clone({
          ...this.current, ...form.getRawValue()
        });
      })
    ).subscribe((approvalReason: ApprovalReason) => {
      if (!approvalReason) {
        return;
      }

      this._updateList(approvalReason, (this.editIndex > -1 ? 'UPDATE' : 'ADD'), this.editIndex);
      this.toastService.success(this.lang.map.msg_save_success);
      this.editIndex = -1;
      this.changed$.next(null);
    });
  }

  private _updateList(record: (ApprovalReason | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
    if (record) {
      if (operation === 'ADD') {
        this.list.push(record);
      } else if (operation === 'UPDATE') {
        this.list.splice(gridIndex, 1, record);
      } else if (operation === 'DELETE') {
        this.list.splice(gridIndex, 1);
      }
    }
    this.list = this.list.slice();
    this.dataSource.next(this.list);
  }

  edit($event: MouseEvent, record: ApprovalReason, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.changed$.next(record);
  }

  delete($event: MouseEvent, record: ApprovalReason, index: number): any {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_selected)
      .onAfterClose$
      .pipe(take(1))
      .subscribe((click: UserClickOn) => {
        if (click === UserClickOn.YES) {
          this._updateList(record, 'DELETE', index);
          this.toastService.success(this.lang.map.msg_delete_success);
        }
      });
  }

  cancel() {
    this.resetForm();
    this._setComponentReadiness('READY');
    this.editIndex = -1;
  }

  private resetForm() {
    this.approvalReasonsFormArray.clear();
    this.approvalReasonsFormArray.markAsUntouched();
    this.approvalReasonsFormArray.markAsPristine();
  }

  private _setComponentReadiness(readyStatus: ReadinessStatus) {
    this.readyEvent.emit(readyStatus);
  }

  forceClearComponent() {
    this.cancel();
    this.list = [];
    this._updateList(null, 'NONE');
    this._setComponentReadiness('READY');
  }
}
