import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {ToastService} from "@app/services/toast.service";
import {DialogService} from "@app/services/dialog.service";
import {AbstractControl, FormArray, FormBuilder, FormGroup} from "@angular/forms";
import {ReadinessStatus} from "@app/types/types";
import {BehaviorSubject, Subject} from "rxjs";
import {filter, map, take, takeUntil} from "rxjs/operators";
import {UserClickOn} from "@app/enums/user-click-on.enum";
import {TargetGroup} from "@app/models/target-group";
import {Goal} from "@app/models/goal";

@Component({
  selector: 'target-group',
  templateUrl: './target-group.component.html',
  styleUrls: ['./target-group.component.scss']
})
export class TargetGroupComponent implements OnInit, OnDestroy {

  constructor(public lang: LangService,
              private toastService: ToastService,
              private dialogService: DialogService,
              private fb: FormBuilder) {
  }

  @Input() list: TargetGroup[] = [];
  @Input() readonly : boolean = false;

  @Output() readyEvent = new EventEmitter<ReadinessStatus>();

  dataSource: BehaviorSubject<TargetGroup[]> = new BehaviorSubject<TargetGroup[]>([]);
  columns = ['services', 'targetedGroup', 'actions'];

  editIndex: number = -1;
  add$: Subject<any> = new Subject<any>();
  private save$: Subject<any> = new Subject<any>();

  private changed$: Subject<TargetGroup | null> = new Subject<TargetGroup | null>();
  private current?: TargetGroup;
  private destroy$: Subject<any> = new Subject<any>();

  form!: FormGroup;

  ngOnInit(): void {
    this.dataSource.next(this.list);
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
      targetGroups: this.fb.array([])
    })
  }

  get targetGroupsFormArray(): FormArray {
    return (this.form.get('targetGroups')) as FormArray;
  }

  addAllowed(): boolean {
    return !this.readonly;
  }

  private listenToAdd() {
    this.add$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.changed$.next(new TargetGroup())
      })
  }

  private listenToChange() {
    this.changed$.pipe(takeUntil(this.destroy$))
      .subscribe(targetGroup => {
        if (this.readonly) {
          return;
        }
        this.current = targetGroup || undefined;
        this.updateForm(this.current);
      })
  }

  private updateForm(record: TargetGroup | undefined) {
    const targetGroupsFormArray = this.targetGroupsFormArray;
    targetGroupsFormArray.clear();

    if (record) {
      this._setComponentReadiness('NOT_READY');
      targetGroupsFormArray.push(this.fb.group((record.getTargetGroupFields(true))));
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
      return this.form.get('targetGroups.0') as AbstractControl;
    }));

    const validForm$ = form$.pipe(filter((form) => form.valid));
    const invalidForm$ = form$.pipe(filter((form) => form.invalid));
    invalidForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.dialogService
        .error(this.lang.map.msg_all_required_fields_are_filled)
        .onAfterClose$
        .pipe(take(1))
        .subscribe(() => {
          this.form.get('targetGroups')?.markAllAsTouched();
        });
    });

    validForm$.pipe(
      takeUntil(this.destroy$),
      map(() => {
        return (this.form.get('targetGroups.0')) as FormArray;
      }),
      map((form) => {
        return (new TargetGroup()).clone({
          ...this.current, ...form.getRawValue()
        });
      })
    ).subscribe((targetGroup: TargetGroup) => {
      if (!targetGroup) {
        return;
      }

      this._updateList(targetGroup, (this.editIndex > -1 ? 'UPDATE' : 'ADD'), this.editIndex);
      this.toastService.success(this.lang.map.msg_save_success);
      this.editIndex = -1;
      this.changed$.next(null);
    });
  }

  private _updateList(record: (TargetGroup | null), operation: 'ADD' | 'UPDATE' | 'DELETE' | 'NONE', gridIndex: number = -1) {
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

  edit($event: MouseEvent, record: TargetGroup, index: number) {
    $event.preventDefault();
    if (this.readonly) {
      return;
    }
    this.editIndex = index;
    this.changed$.next(record);
  }

  delete($event: MouseEvent, record: TargetGroup, index: number): any {
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
    this.targetGroupsFormArray.clear();
    this.targetGroupsFormArray.markAsUntouched();
    this.targetGroupsFormArray.markAsPristine();
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
